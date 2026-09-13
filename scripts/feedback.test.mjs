import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { sourceQuestions, sourceSha256 } from '../鲸伴同行-demo-发布包/feedback/source.mjs';
import { questions, version, readState, activeQuestions, validAnswer, answerCount, complete, setAnswer, submit, storageKey, setXiaobaiComment, commentLimit } from '../鲸伴同行-demo-发布包/feedback/model.mjs';
import { storageKey as preTripKey } from '../鲸伴同行-demo-发布包/questionnaire/model.mjs';

function sampleAnswer(q) {
  return q.type === 'rating' ? 4 : q.type === 'text' ? '体验反馈'
    : q.type === 'multi' ? [q.options[0].value] : q.options[0].value;
}
test('the extracted source matches the downloaded Word file, including five rating stars', async () => {
  const docx = await fs.readFile(new URL('../file/行后问卷.docx', import.meta.url));
  assert.equal(createHash('sha256').update(docx).digest('hex'), sourceSha256);
  assert.equal(sourceQuestions.length, 14);
  assert.equal(sourceQuestions.reduce((sum, q) => sum + q.options.length, 0), 44);
  assert.equal(sourceQuestions.at(-1).ratingMax, 5);
  for (const q of questions) {
    const source = sourceQuestions.find(item => item.id === q.id);
    assert.equal(q.text, source.text);
    for (const option of q.options) assert.deepEqual(option, source.options.find(item => item.value === option.value));
  }
});
test('invalid saved answers, unknown question IDs and premature completion are rejected', () => {
  for (const raw of ['{', 'null', '3', '[]', JSON.stringify({ version: 'old' })]) {
    assert.equal(answerCount(readState(raw)), 0);
  }
  const state = readState(JSON.stringify({ version, answers: { venue_1: 'unknown', platform_7: 6, unknown: 'A' }, currentId: 'missing', completedAt: '2026-09-13' }));
  assert.equal(answerCount(state), 0);
  assert.equal(state.currentId, questions[0].id);
  assert.equal(state.completedAt, null);
  assert.throws(() => submit(state));
  assert.throws(() => setAnswer(state, 'unknown', 'A'));
});
test('draft answers, completion and edits survive reload without mixing other questionnaires', () => {
  let state = readState(null);
  setAnswer(state, questions[0].id, sampleAnswer(questions[0]));
  state.currentId = questions[1].id;
  state = readState(JSON.stringify(state));
  assert.equal(answerCount(state), 1);
  assert.equal(state.currentId, questions[1].id);
  for (const q of activeQuestions(state)) setAnswer(state, q.id, sampleAnswer(q));
  assert.equal(complete(state), true);
  submit(state, '2026-09-13T12:00:00.000Z');
  state = readState(JSON.stringify(state));
  assert.equal(state.completedAt, '2026-09-13T12:00:00.000Z');
  setAnswer(state, 'platform_7', 2);
  assert.equal(state.completedAt, null);
  setAnswer(state, 'platform_7', null);
  assert.equal(complete(state), false);
  assert.notEqual(storageKey('same', 'parent'), storageKey('same', 'xinqingnian'));
  assert.notEqual(storageKey('one', 'parent'), storageKey('two', 'parent'));
  assert.notEqual(storageKey('same', 'xinqingnian'), preTripKey('same'));
});
test('multi-select validates exclusive none, duplicates and unknown options', () => {
  const q = { ...sourceQuestions.find(item => item.id === 'venue_2'), type: 'multi', exclusive: ['F'] };
  assert.equal(validAnswer(q, ['A', 'B']), true);
  assert.equal(validAnswer(q, ['F']), true);
  for (const answer of [[], ['A', 'F'], ['A', 'A'], ['Z'], 'A', null]) assert.equal(validAnswer(q, answer), false);
});

test('none skips uncomfortable venues, clears contradictory answers and restores the question when needed', () => {
  const state = readState(null);
  assert.equal(questions.length, 14);
  assert.ok(questions.some(q => q.text.includes('伴游人员')));
  assert.ok(questions.find(q => q.id === 'platform_2').options.some(option => option.label === '伴游人员'));
  setAnswer(state, 'venue_2', ['A', 'B']);
  setAnswer(state, 'venue_3', ['A', 'C']);
  assert.equal(activeQuestions(state).length, 14);
  setAnswer(state, 'venue_2', ['F']);
  assert.equal(activeQuestions(state).length, 13);
  assert.equal(state.answers.venue_3, undefined);
  assert.throws(() => setAnswer(state, 'venue_3', ['A']));
  const reloaded = readState(JSON.stringify({ ...state, answers: { ...state.answers, venue_3: ['A'] }, currentId: 'venue_3' }));
  assert.equal(reloaded.answers.venue_3, undefined);
  assert.notEqual(reloaded.currentId, 'venue_3');
  for (const q of activeQuestions(state)) if (q.id !== 'venue_2') setAnswer(state, q.id, sampleAnswer(q));
  submit(state);
  assert.ok(state.completedAt);
  setAnswer(state, 'venue_2', ['C']);
  assert.equal(activeQuestions(state).length, 14);
  assert.equal(state.completedAt, null);
  assert.equal(complete(state), false);
  assert.throws(() => submit(state));
  setAnswer(state, 'venue_3', ['B', 'D']);
  assert.equal(complete(state), true);
});

test('optional comments may be blank, survive reload and edits, and never replace the required star rating', () => {
  let state = readState(null);
  assert.equal(state.xiaobaiComment, '');
  setXiaobaiComment(state, '希望回答更简短。\n可以有更多图片吗？');
  assert.equal(answerCount(state), 0);
  assert.throws(() => submit(state));
  for (const q of activeQuestions(state)) setAnswer(state, q.id, sampleAnswer(q));
  submit(state, '2026-09-13T12:00:00.000Z');
  state = readState(JSON.stringify(state));
  assert.equal(state.xiaobaiComment, '希望回答更简短。\n可以有更多图片吗？');
  assert.equal(state.answers.platform_7, 4);
  setXiaobaiComment(state, state.xiaobaiComment);
  assert.ok(state.completedAt);
  setXiaobaiComment(state, '');
  assert.equal(state.completedAt, null);
  assert.equal(complete(state), true);
  submit(state);
  const { xiaobaiComment, ...legacy } = state;
  assert.equal(readState(JSON.stringify(legacy)).xiaobaiComment, '');
  assert.ok(readState(JSON.stringify(legacy)).completedAt);
  assert.throws(() => setXiaobaiComment(state, 'a'.repeat(commentLimit + 1)));
  assert.throws(() => setXiaobaiComment(state, null));
});

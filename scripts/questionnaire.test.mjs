import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { questions, version, readState, answerCount, complete, setAnswer, submit, storageKey } from '../鲸伴同行-demo-发布包/questionnaire/model.mjs';

test('preview uses the supplied questionnaire without changing any source wording', async () => {
  const source = await fs.readFile(new URL('../file/questionnaire.js', import.meta.url), 'utf8');
  const preview = await fs.readFile(new URL('../鲸伴同行-demo-发布包/questionnaire/data.mjs', import.meta.url), 'utf8');
  assert.equal(preview, source);
  assert.equal(questions.length, 17);
  assert.equal(new Set(questions.map(q => q.id)).size, 17);
});
test('invalid, stale and incomplete saved drafts cannot masquerade as complete', () => {
  for (const invalid of ['{', 'null', '[]', '5', JSON.stringify({ version: 'old', answers: { vis_1: 5 } })]) {
    assert.equal(answerCount(readState(invalid)), 0);
  }
  const partial = readState(JSON.stringify({ version, index: 999, completedAt: '2026-09-13', answers: { vis_1: 5, vis_2: '5', vis_3: 6, unknown: 3 } }));
  assert.equal(answerCount(partial), 1);
  assert.equal(partial.index, 16);
  assert.equal(partial.completedAt, null);
  assert.throws(() => submit(partial));
});
test('partial answers survive save/reload, all 17 are needed, editing invalidates completion', () => {
  let state = readState(null);
  for (const q of questions.slice(0, 8)) setAnswer(state, q.id, 2);
  state.index = 7;
  state = readState(JSON.stringify(state));
  assert.equal(answerCount(state), 8);
  assert.equal(state.index, 7);
  assert.equal(complete(state), false);
  for (const q of questions.slice(8)) setAnswer(state, q.id, 4);
  submit(state, '2026-09-13T12:00:00.000Z');
  assert.equal(readState(JSON.stringify(state)).completedAt, '2026-09-13T12:00:00.000Z');
  setAnswer(state, questions[0].id, 2);
  assert.ok(state.completedAt);
  setAnswer(state, questions[0].id, 5);
  assert.equal(state.completedAt, null);
  assert.throws(() => setAnswer(state, questions[0].id, 0));
  assert.throws(() => setAnswer(state, 'unknown', 3));
});
test('each account has a separate questionnaire storage key', () => {
  assert.notEqual(storageKey('account-a'), storageKey('account-b'));
  assert.notEqual(storageKey('account-a'), storageKey(null));
});
test('the actual profile insertion is shown to heart-youth users and hidden from parents', async () => {
  const bundle = await fs.readFile(new URL('../鲸伴同行-demo-发布包/assets/index-BTDJbxyr.js', import.meta.url), 'utf8');
  const fragment = bundle.split('className:"me-body",children:[')[1].split(',v.jsxs("div",{"code-path":"src\\\\pages\\\\Profile.tsx:115:9"')[0];
  const v = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
  const renderEntry = new Function('v', 'a', 'w_', `return (${fragment});`);
  const evaluate = (renderer, parent) => renderEntry(renderer, parent, 'file-text');
  assert.equal(evaluate(v, true), false);
  const entry = evaluate(v, false);
  assert.equal(entry.type, 'a');
  assert.equal(entry.props.href, './questionnaire/');
});

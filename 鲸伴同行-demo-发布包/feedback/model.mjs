import { questions } from './data.mjs?v=2';
export { questions };
export const version = 'post-trip-v1';
export const commentLimit = 1000;
export const storageKey = (account, role) => 'jingban:post-trip:' + version + ':' + (role || 'xinqingnian') + ':' + (account || 'guest');

export function validAnswer(question, answer) {
  if (question.type === 'rating') return Number.isInteger(answer) && answer >= 1 && answer <= question.ratingMax;
  if (question.type === 'text') return typeof answer === 'string' && answer.trim().length > 0 && answer.length <= 1000;
  const accepts = value => question.options.some(option => option.value === value);
  if (question.type === 'multi') {
    return Array.isArray(answer) && answer.length > 0 && new Set(answer).size === answer.length
      && answer.every(accepts) && (!answer.some(value => question.exclusive?.includes(value)) || answer.length === 1);
  }
  return typeof answer === 'string' && accepts(answer);
}
export function activeQuestions(state) {
  return questions.filter(question => {
    if (!question.hideWhen) return true;
    const answer = state.answers[question.hideWhen.question];
    return Array.isArray(answer) ? !answer.includes(question.hideWhen.value) : answer !== question.hideWhen.value;
  });
}
export const answerCount = state => activeQuestions(state).filter(q => validAnswer(q, state.answers[q.id])).length;
export const complete = state => activeQuestions(state).every(q => validAnswer(q, state.answers[q.id]));
function clearHiddenAnswers(state) {
  const activeIds = new Set(activeQuestions(state).map(q => q.id));
  for (const q of questions) if (!activeIds.has(q.id)) delete state.answers[q.id];
  if (!activeIds.has(state.currentId)) state.currentId = activeQuestions(state)[0].id;
}
export function readState(serialized) {
  const state = { version, answers: {}, currentId: questions[0].id, completedAt: null, xiaobaiComment: '' };
  let raw;
  try { raw = JSON.parse(serialized); } catch { return state; }
  if (!raw || raw.version !== version) return state;
  if (typeof raw.xiaobaiComment === 'string' && raw.xiaobaiComment.length <= commentLimit) {
    state.xiaobaiComment = raw.xiaobaiComment;
  }
  for (const q of questions) {
    if (validAnswer(q, raw.answers?.[q.id])) {
      state.answers[q.id] = Array.isArray(raw.answers[q.id]) ? [...raw.answers[q.id]] : raw.answers[q.id];
    }
  }
  if (questions.some(q => q.id === raw.currentId)) state.currentId = raw.currentId;
  clearHiddenAnswers(state);
  if (complete(state) && typeof raw.completedAt === 'string' && Number.isFinite(Date.parse(raw.completedAt))) {
    state.completedAt = raw.completedAt;
  }
  return state;
}
export function setAnswer(state, id, answer) {
  const question = activeQuestions(state).find(q => q.id === id);
  if (!question) throw new Error('Unknown or hidden question');
  const empty = answer === null || (Array.isArray(answer) && answer.length === 0)
    || (question.type === 'text' && answer === '');
  if (!empty && !validAnswer(question, answer)) throw new Error('Invalid answer');
  const normalized = empty ? undefined : Array.isArray(answer)
    ? question.options.map(option => option.value).filter(value => answer.includes(value)) : answer;
  if (JSON.stringify(state.answers[id]) !== JSON.stringify(normalized)) state.completedAt = null;
  if (empty) delete state.answers[id];
  else state.answers[id] = normalized;
  clearHiddenAnswers(state);
}
export function submit(state, timestamp = new Date().toISOString()) {
  if (!complete(state)) throw new Error('Please complete the questionnaire');
  state.completedAt = timestamp;
}

export function setXiaobaiComment(state, text) {
  if (typeof text !== 'string' || text.length > commentLimit) throw new Error('Invalid comment');
  if (state.xiaobaiComment !== text) state.completedAt = null;
  state.xiaobaiComment = text;
}

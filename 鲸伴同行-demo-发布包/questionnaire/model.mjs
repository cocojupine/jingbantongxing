import { sensoryData } from './data.mjs';

export const version = 'sensory-17-v1';
export const dimensions = sensoryData;
export const questions = dimensions.flatMap(d => d.questions.map((q, i) => ({
  ...q, dimension: d.id, dimensionTitle: d.title, dimensionIndex: i,
  dimensionCount: d.questions.length, options: d.scale,
})));
export const validAnswer = value => Number.isInteger(value) && value >= 1 && value <= 5;
export const answerCount = state => questions.filter(q => validAnswer(state.answers[q.id])).length;
export const complete = state => answerCount(state) === questions.length;
export const storageKey = account => `jingban:pre-trip:${version}:${account || 'guest'}`;

export function readState(serialized) {
  let raw;
  try { raw = JSON.parse(serialized); } catch { raw = null; }
  const state = { version, answers: {}, index: 0, completedAt: null };
  if (!raw || raw.version !== version) return state;
  for (const q of questions) {
    if (validAnswer(raw.answers?.[q.id])) state.answers[q.id] = raw.answers[q.id];
  }
  if (Number.isInteger(raw.index)) state.index = Math.max(0, Math.min(questions.length - 1, raw.index));
  if (complete(state) && typeof raw.completedAt === 'string' && Number.isFinite(Date.parse(raw.completedAt))) {
    state.completedAt = raw.completedAt;
  }
  return state;
}

export function setAnswer(state, id, value) {
  if (!questions.some(q => q.id === id) || !validAnswer(value)) throw new Error('Invalid answer');
  if (state.answers[id] !== value) state.completedAt = null;
  state.answers[id] = value;
}

export function submit(state, timestamp = new Date().toISOString()) {
  if (!complete(state)) throw new Error('Please complete every question');
  state.completedAt = timestamp;
  return state;
}

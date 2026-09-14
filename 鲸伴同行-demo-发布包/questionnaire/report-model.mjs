import { dimensions, questions, readState, validAnswer } from './model.mjs';

export const supportNotes = [
  '入园前：确认当天状态、舒适边界和希望避开的项目。',
  '游园中：留意强刺激、拥挤或疲劳信号，必要时提前调整路线和节奏。',
  '出现不适时：先陪同到安静区域，给予选择和等待时间，再决定继续或休息。',
];

export function buildSensoryReport(serialized) {
  const state = readState(serialized);
  const answered = questions.filter(question => validAnswer(state.answers[question.id]));
  const scores = dimensions.map(dimension => {
    const values = dimension.questions
      .map(question => state.answers[question.id])
      .filter(validAnswer);
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    return {
      id: dimension.id,
      title: dimension.title,
      count: values.length,
      total: dimension.questions.length,
      average,
      // The survey's 1–5 scale measures discomfort. Map it to the radar's 0–100 sensitivity axis.
      sensitivity: average === null ? null : Math.round((average - 1) / 4 * 100),
    };
  });
  return {
    completed: Boolean(state.completedAt),
    answered: answered.length,
    total: questions.length,
    completedAt: state.completedAt,
    scores,
  };
}

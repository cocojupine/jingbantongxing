import { sourceQuestions } from './source.mjs';

// Preserve all source questions, including the companion-service items.
// Sensory discomfort and uncomfortable venues allow multiple selections.
export const contentReady = true;
export const questions = sourceQuestions.map(question => ({
  ...question,
  type: question.ratingMax ? 'rating'
    : ['venue_2', 'venue_3'].includes(question.id) ? 'multi' : 'single',
  ...(question.id === 'venue_2' ? { exclusive: ['F'] } : {}),
  ...(question.id === 'venue_3' ? { hideWhen: { question: 'venue_2', value: 'F' } } : {}),
}));

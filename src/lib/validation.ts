import type { ConfigSnapshot } from './types';

export const validateConfigSnapshot = (data: unknown): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const candidate = data as ConfigSnapshot;
  if (!candidate || typeof candidate !== 'object') {
    return { valid: false, errors: ['Config is not an object.'] };
  }
  if (!Array.isArray(candidate.questions)) errors.push('Missing questions array.');
  if (!Array.isArray(candidate.options)) errors.push('Missing options array.');
  if (!Array.isArray(candidate.traits)) errors.push('Missing traits array.');
  if (!Array.isArray(candidate.clusters)) errors.push('Missing clusters array.');

  if (Array.isArray(candidate.questions)) {
    candidate.questions.forEach((question, index) => {
      if (!question.id || !question.prompt || !question.type || !question.mode) {
        errors.push(`Question ${index + 1} is missing required fields.`);
      }
    });
  }

  if (Array.isArray(candidate.options)) {
    candidate.options.forEach((option, index) => {
      if (!option.id || !option.question_id || !option.label) {
        errors.push(`Option ${index + 1} is missing required fields.`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
};

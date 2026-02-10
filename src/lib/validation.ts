import type { ConfigSnapshot, Mode, Track } from './types';
import { validateBranching } from './branching';

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

export const validatePublishSnapshot = (config: ConfigSnapshot): { errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const activeQuestions = config.questions.filter((question) => question.status === 'active');
  if (activeQuestions.length === 0) {
    errors.push('No active questions available.');
  }

  activeQuestions.forEach((question) => {
    if (!question.tags || question.tags.length === 0) {
      errors.push(`Question ${question.id} is missing tags.`);
    }
    if (question.branch_level > 3) {
      errors.push(`Question ${question.id} exceeds max branch level (3).`);
    }
    if (question.track && question.mode !== 'SSS') {
      errors.push(`Question ${question.id} has a track but is not SSS mode.`);
    }
    if (question.type !== 'open_short') {
      const optionCount = config.options.filter((option) => option.question_id === question.id).length;
      if (optionCount === 0) {
        errors.push(`Question ${question.id} has no options.`);
      }
    }
    if (question.type === 'image_select') {
      const options = config.options.filter((option) => option.question_id === question.id);
      const missing = options.filter((option) => !option.image_url);
      if (missing.length > 0) {
        warnings.push(`Image question ${question.id} has options without image URLs.`);
      }
    }
    if (question.type === 'open_short' && !question.tags.includes('rubric')) {
      warnings.push(`Open question ${question.id} is missing a rubric tag.`);
    }
  });

  config.options.forEach((option) => {
    if (!option.next_question_id) return;
    const target = config.questions.find((question) => question.id === option.next_question_id);
    if (!target || target.status !== 'active') {
      errors.push(`Option ${option.id} points to missing/inactive question ${option.next_question_id}.`);
    }
  });

  const runBranching = (mode: Mode, track?: Track | null) => {
    const report = validateBranching(config, mode, track ?? null);
    if (report.cycles.length > 0) {
      report.cycles.forEach((cycle) => {
        errors.push(`Branching cycle detected (${mode}${track ? `-${track}` : ''}): ${cycle.join(' -> ')}`);
      });
    }
    if (report.orphans.length > 0) {
      errors.push(`Orphan questions found (${mode}${track ? `-${track}` : ''}): ${report.orphans.join(', ')}`);
    }
    if (!report.endReachable) {
      errors.push(`No reachable end found for ${mode}${track ? `-${track}` : ''} flow.`);
    }
  };

  runBranching('JSS');
  (['SCIENCE', 'ARTS', 'COMMERCIAL'] as Track[]).forEach((track) => runBranching('SSS', track));

  return { errors, warnings };
};

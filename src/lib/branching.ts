import type { ConfigSnapshot, Mode, Track } from './types';

export interface BranchingReport {
  cycles: string[][];
  orphans: string[];
  endReachable: boolean;
  reachable: string[];
}

export const validateBranching = (
  config: ConfigSnapshot,
  mode: Mode,
  track?: Track | null
): BranchingReport => {
  const questions = config.questions.filter((question) => {
    if (question.mode !== mode) return false;
    if (question.track && track && question.track !== track) return false;
    if (question.track && !track) return false;
    return question.status === 'active';
  });

  const questionIds = new Set(questions.map((question) => question.id));
  const edges = new Map<string, string[]>();

  questions.forEach((question) => {
    const options = config.options.filter((option) => option.question_id === question.id);
    const nextIds = options
      .map((option) => option.next_question_id)
      .filter((nextId): nextId is string => typeof nextId === 'string' && questionIds.has(nextId));
    edges.set(question.id, nextIds);
  });

  const roots = questions.filter((question) => !question.parent_question_id).map((q) => q.id);
  const reachable = new Set<string>();
  const cycles: string[][] = [];
  const stack = new Set<string>();

  const dfs = (node: string, path: string[]) => {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) cycles.push(path.slice(cycleStart));
      return;
    }
    if (reachable.has(node)) return;

    reachable.add(node);
    stack.add(node);
    const neighbors = edges.get(node) || [];
    neighbors.forEach((neighbor) => dfs(neighbor, [...path, neighbor]));
    stack.delete(node);
  };

  roots.forEach((root) => dfs(root, [root]));

  const orphans = questions
    .map((question) => question.id)
    .filter((id) => !reachable.has(id));

  const endReachable = roots.some((root) => {
    let found = false;
    const walk = (node: string) => {
      if (found) return;
      const options = edges.get(node) || [];
      if (options.length === 0) {
        found = true;
        return;
      }
      options.forEach((nextId) => walk(nextId));
    };
    walk(root);
    return found;
  });

  return {
    cycles,
    orphans,
    endReachable,
    reachable: Array.from(reachable)
  };
};

import type {
  AssessmentResult,
  Cluster,
  ClusterScore,
  ConfigSnapshot,
  EngineState,
  Mode,
  Question,
  QuestionResponse,
  TraitId,
  TraitScores,
  Track
} from '../types';

export const traitIds: TraitId[] = [
  'logic',
  'creativity',
  'empathy',
  'practical',
  'communication',
  'leadership',
  'curiosity',
  'organization',
  'technical'
];

export const createEmptyScores = (): TraitScores => ({
  logic: 0,
  creativity: 0,
  empathy: 0,
  practical: 0,
  communication: 0,
  leadership: 0,
  curiosity: 0,
  organization: 0,
  technical: 0
});

const matchesMode = (question: Question, mode: Mode, track?: Track | null) => {
  if (question.mode !== mode) return false;
  if (question.track && track && question.track !== track) return false;
  if (question.track && !track) return false;
  return true;
};

export const getOrderedQuestions = (config: ConfigSnapshot, mode: Mode, track?: Track | null) =>
  config.questions
    .filter((question) => matchesMode(question, mode, track) && question.status === 'active')
    .sort((a, b) => a.id.localeCompare(b.id));

// getQuestionById removed as part of cleanup

const pickStartingQuestion = (config: ConfigSnapshot, mode: Mode, track?: Track | null) => {
  const candidates = getOrderedQuestions(config, mode, track);
  const root = candidates.find((question) => !question.parent_question_id);
  return root || candidates[0] || null;
};

const addScores = (base: TraitScores, delta: Partial<Record<TraitId, number>>) => {
  const next = { ...base };
  traitIds.forEach((trait) => {
    next[trait] = (next[trait] || 0) + (delta[trait] || 0);
  });
  return next;
};

const applyResponseScores = (
  config: ConfigSnapshot,
  questionId: string,
  response: QuestionResponse,
  scores: TraitScores
) => {
  const options = config.options.filter((option) => option.question_id === questionId);
  if (response.type === 'open_short') {
    return scores;
  }

  if (response.type === 'drag_rank') {
    const ranked = response.optionIds || [];
    const weightByRank = [3, 2, 1, 0.5];
    let updated = scores;
    ranked.forEach((optionId, index) => {
      const option = options.find((item) => item.id === optionId);
      if (!option) return;
      const weight = weightByRank[index] ?? 0.25;
      const weightedScores: Partial<Record<TraitId, number>> = {};
      traitIds.forEach((trait) => {
        const value = option.score_map[trait];
        if (value) weightedScores[trait] = value * weight;
      });
      updated = addScores(updated, weightedScores);
    });
    return updated;
  }

  const optionId = response.optionIds?.[0];
  const option = options.find((item) => item.id === optionId);
  if (!option) return scores;
  return addScores(scores, option.score_map);
};

const selectNextQuestionId = (
  config: ConfigSnapshot,
  mode: Mode,
  track: Track | null | undefined,
  _currentId: string, // prefixed with _ to indicate unused
  response: QuestionResponse,
  asked: string[],
  maxQuestions: number
) => {
  if (asked.length >= maxQuestions) return null;
  const optionId = response.optionIds?.[0];
  const option = config.options.find((item) => item.id === optionId);

  // Validate that the explict next question exists and is active/valid for this mode
  if (option?.next_question_id && !asked.includes(option.next_question_id)) {
    const targetExists = config.questions.some(q =>
      q.id === option.next_question_id &&
      q.status === 'active' &&
      matchesMode(q, mode, track)
    );
    if (targetExists) {
      return option.next_question_id;
    }
  }

  const ordered = getOrderedQuestions(config, mode, track);
  const next = ordered.find((question) => !asked.includes(question.id));
  return next?.id || null;
};

export const startAssessment = (
  config: ConfigSnapshot,
  mode: Mode,
  track?: Track | null,
  maxQuestions = 20
): EngineState => {
  const start = pickStartingQuestion(config, mode, track);
  return {
    asked: [],
    answers: {},
    scores: createEmptyScores(),
    currentQuestionId: start?.id || null,
    maxQuestions
  };
};

export const answerQuestion = (
  config: ConfigSnapshot,
  state: EngineState,
  mode: Mode,
  track: Track | null | undefined,
  questionId: string,
  response: QuestionResponse
): EngineState => {
  const updatedScores = applyResponseScores(config, questionId, response, state.scores);
  const asked = [...state.asked, questionId];
  const nextId = selectNextQuestionId(config, mode, track, questionId, response, asked, state.maxQuestions);
  return {
    ...state,
    asked,
    answers: { ...state.answers, [questionId]: response },
    scores: updatedScores,
    currentQuestionId: nextId
  };
};

export const undoLastQuestion = (
  config: ConfigSnapshot,
  state: EngineState
): EngineState => {
  if (state.asked.length === 0) return state;

  const newAsked = [...state.asked];
  const previousQuestionId = newAsked.pop();

  if (!previousQuestionId) return state;

  const newAnswers = { ...state.answers };
  delete newAnswers[previousQuestionId];

  // Re-calculate scores from scratch to ensure accuracy
  let newScores = createEmptyScores();
  Object.entries(newAnswers).forEach(([qId, resp]) => {
    newScores = applyResponseScores(config, qId, resp, newScores);
  });

  return {
    ...state,
    asked: newAsked,
    answers: newAnswers,
    scores: newScores,
    currentQuestionId: previousQuestionId
  };
};

const getDominantTraits = (scores: TraitScores, count = 3) =>
  traitIds
    .map((trait) => ({ trait, value: scores[trait] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count)
    .map((item) => item.trait);

const scoreClusters = (
  clusters: Cluster[],
  scores: TraitScores,
  mode: Mode,
  track?: Track | null
): ClusterScore[] => {
  const prefix = mode === 'JSS' ? 'JSS_' : 'SSS_';
  return clusters
    .filter((cluster) => cluster.id.startsWith(prefix))
    .map((cluster) => {
      let total = 0;
      traitIds.forEach((trait) => {
        const weight = cluster.trait_weights[trait] ?? 0;
        total += scores[trait] * weight;
      });
      if (track && cluster.track_bias.includes(track)) {
        total += 4;
      }
      return { clusterId: cluster.id, score: total };
    })
    .sort((a, b) => b.score - a.score);
};

const computeConfidence = (scores: ClusterScore[], traitScores: TraitScores) => {
  if (scores.length < 2) return 'LOW' as const;
  const totalSignal = traitIds.reduce((sum, trait) => sum + Math.abs(traitScores[trait]), 0);
  if (totalSignal < 4) return 'LOW' as const;
  const [first, second] = scores;
  if (first.score === 0) return 'LOW' as const;
  if (second.score === 0) return 'HIGH' as const;
  const ratio = first.score / second.score;
  if (ratio >= 1.2) return 'HIGH' as const;
  if (ratio >= 1.05) return 'MEDIUM' as const;
  return 'LOW' as const;
};

const buildExplanation = (
  clusters: Cluster[],
  primaryClusterId: string,
  dominantTraits: TraitId[]
) => {
  const cluster = clusters.find((item) => item.id === primaryClusterId);
  const traitLabels = dominantTraits.map((trait) => trait.replace(/\b\w/g, (char) => char.toUpperCase()));
  const summary = cluster
    ? `You lean toward ${cluster.label} because your strongest signals are ${traitLabels.join(', ')}.`
    : `Your answers show strong signals in ${traitLabels.join(', ')}.`;

  const why = dominantTraits.map((trait) =>
    `You repeatedly chose options that reflect ${trait.replace(/\b\w/g, (char) => char.toUpperCase())}.`
  );

  const nextStepsByCluster: Record<string, string[]> = {
    JSS_SCIENCE_ANALYTICAL: [
      'Try science or coding clubs to explore how things work.',
      'Pick projects that let you test ideas and solve puzzles.'
    ],
    JSS_ARTS_HUMANITIES: [
      'Join writing, debate, or art activities that let you express ideas.',
      'Explore subjects that focus on people, stories, and history.'
    ],
    JSS_COMMERCIAL_BUSINESS: [
      'Try simple entrepreneurship projects or class leadership roles.',
      'Practice planning and teamwork through school events.'
    ],
    JSS_CREATIVE_DESIGN: [
      'Explore design, music, or media projects where imagination matters.',
      'Build a small portfolio of what you enjoy creating.'
    ],
    JSS_HYBRID: [
      'Mix activities across science, arts, and business to see what sticks.',
      'Reflect on which tasks keep you energized over time.'
    ]
  };

  const next_steps = nextStepsByCluster[primaryClusterId] || [
    'Explore clubs or activities that match your top traits.',
    'Talk with a teacher about subjects that fit your interests.'
  ];

  return { summary, why, next_steps };
};

const createReportCode = () => {
  const base = Math.random().toString(36).slice(2, 8).toUpperCase();
  return base;
};

const computeEngagement = (
  config: ConfigSnapshot,
  state: EngineState
) => {
  let answeredCount = 0;
  let disengagedCount = 0;

  Object.values(state.answers).forEach((response) => {
    const optionId = response.optionIds?.[0];
    if (!optionId) return;
    answeredCount += 1;
    const option = config.options.find((item) => item.id === optionId);
    if (option?.disengaged) disengagedCount += 1;
  });

  const ratio = answeredCount === 0 ? 0 : disengagedCount / answeredCount;
  let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
  if (ratio >= 0.4) level = 'LOW';
  else if (ratio >= 0.2) level = 'MEDIUM';

  const note =
    level === 'LOW'
      ? 'Several answers suggest low engagement or avoidance. Consider retaking for clearer results.'
      : level === 'MEDIUM'
        ? 'A few answers suggest low engagement. Try to answer based on what you truly prefer.'
        : 'Responses show steady engagement.';

  return { level, disengagedCount, answeredCount, note };
};

export const computeResult = (
  config: ConfigSnapshot,
  state: EngineState,
  mode: Mode,
  track?: Track | null
): AssessmentResult => {
  const clusterScores = scoreClusters(config.clusters, state.scores, mode, track);
  const primary = clusterScores[0]?.clusterId || '';
  const dominant = getDominantTraits(state.scores, 3);
  const confidence = computeConfidence(clusterScores, state.scores);

  return {
    mode,
    track: track ?? null,
    primary_cluster: primary,
    top_clusters: clusterScores.slice(0, mode === 'JSS' ? 3 : 5),
    dominant_traits: dominant.slice(0, 3),
    confidence,
    trait_scores: state.scores,
    explanation: buildExplanation(config.clusters, primary, dominant),
    engagement: computeEngagement(config, state),
    report_code: createReportCode()
  };
};

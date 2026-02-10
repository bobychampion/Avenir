export type Mode = 'JSS' | 'SSS';
export type Track = 'SCIENCE' | 'ARTS' | 'COMMERCIAL';
export type QuestionType = 'mcq' | 'image_select' | 'scenario' | 'drag_rank' | 'open_short';
export type TraitId =
  | 'logic'
  | 'creativity'
  | 'empathy'
  | 'practical'
  | 'communication'
  | 'leadership'
  | 'curiosity'
  | 'organization'
  | 'technical';

export interface User {
  id: string;
  role: 'admin' | 'teacher' | 'parent' | 'counselor';
  password_hash: string;
  created_at: string;
}

export interface Draft {
  id: string;
  name: string;
  updated_at: string;
  draft_json: ConfigSnapshot;
}

export interface ConfigVersion {
  id: string;
  version: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  config_json: ConfigSnapshot;
}

export interface Question {
  id: string;
  mode: Mode;
  type: QuestionType;
  prompt: string;
  tags: string[];
  branch_level: number;
  parent_question_id?: string | null;
  status: 'draft' | 'active' | 'archived';
  track?: Track | null;
  illustration_url?: string | null;
}

export interface Option {
  id: string;
  question_id: string;
  label: string;
  image_url?: string | null;
  score_map: Partial<Record<TraitId, number>>;
  next_question_id?: string | null;
}

export interface Trait {
  id: TraitId;
  label: string;
  description: string;
}

export interface Cluster {
  id: string;
  label: string;
  description: string;
  track_bias: Track[];
  trait_weights: Partial<Record<TraitId, number>>;
  trait_thresholds: Partial<Record<TraitId, number>>;
  subjects?: string[];
  skills?: string[];
  next_steps?: string[];
  what_they_do?: string[];
}

export interface Session {
  id: string;
  mode: Mode;
  track?: Track | null;
  config_version_id: string;
  state_json: EngineState;
  created_at: string;
  completed_at?: string | null;
}

export interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  response_json: QuestionResponse;
  created_at: string;
}

export interface Report {
  id: string;
  session_id: string;
  result_json: AssessmentResult;
  created_at: string;
}

export interface ConfigSnapshot {
  questions: Question[];
  options: Option[];
  traits: Trait[];
  clusters: Cluster[];
}

export interface QuestionResponse {
  type: QuestionType;
  optionIds?: string[];
  text?: string;
}

export interface TraitScores {
  logic: number;
  creativity: number;
  empathy: number;
  practical: number;
  communication: number;
  leadership: number;
  curiosity: number;
  organization: number;
  technical: number;
}

export interface EngineState {
  asked: string[];
  answers: Record<string, QuestionResponse>;
  scores: TraitScores;
  currentQuestionId: string | null;
  maxQuestions: number;
}

export interface ClusterScore {
  clusterId: string;
  score: number;
}

export interface Explanation {
  summary: string;
  why: string[];
  next_steps: string[];
}

export interface AssessmentResult {
  mode: Mode;
  track?: Track | null;
  primary_cluster: string;
  top_clusters: ClusterScore[];
  dominant_traits: TraitId[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  trait_scores: TraitScores;
  explanation: Explanation;
  report_code: string;
}

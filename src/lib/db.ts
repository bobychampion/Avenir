import Dexie, { Table } from 'dexie';
import type {
  User,
  Draft,
  ConfigVersion,
  Question,
  Option,
  Trait,
  Cluster,
  Session,
  Answer,
  Report
} from './types';

export class AvenirDB extends Dexie {
  users!: Table<User, string>;
  drafts!: Table<Draft, string>;
  config_versions!: Table<ConfigVersion, string>;
  questions!: Table<Question, string>;
  options!: Table<Option, string>;
  traits!: Table<Trait, string>;
  clusters!: Table<Cluster, string>;
  sessions!: Table<Session, string>;
  answers!: Table<Answer, string>;
  reports!: Table<Report, string>;

  constructor() {
    super('avenir');
    this.version(1).stores({
      users: 'id, role, created_at',
      drafts: 'id, updated_at',
      config_versions: 'id, status, published_at',
      questions: 'id, mode, type, status, branch_level, parent_question_id',
      options: 'id, question_id',
      traits: 'id',
      clusters: 'id',
      sessions: 'id, mode, track, config_version_id, created_at, completed_at',
      answers: 'id, session_id, question_id, created_at',
      reports: 'id, session_id, created_at'
    });
  }
}

export const db = new AvenirDB();

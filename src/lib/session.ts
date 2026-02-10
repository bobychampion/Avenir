import { nanoid } from 'nanoid';
import { db } from './db';
import { getPublishedConfig } from './config';
import { answerQuestion, computeResult, startAssessment, undoLastQuestion } from './engine';
import type { Mode, QuestionResponse, Session, Track } from './types';

const now = () => new Date().toISOString();

export const createSession = async (mode: Mode, track?: Track | null) => {
  const config = await getPublishedConfig();
  if (!config) throw new Error('No published config found');
  const state = startAssessment(config, mode, track ?? null, 20);
  const session: Session = {
    id: nanoid(),
    mode,
    track: track ?? null,
    config_version_id: (await db.config_versions.where('status').equals('published').first())?.id || '',
    state_json: state,
    created_at: now(),
    completed_at: null
  };
  await db.sessions.add(session);
  return session;
};

export const answerSessionQuestion = async (
  sessionId: string,
  questionId: string,
  response: QuestionResponse
) => {
  const session = await db.sessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  const config = await getPublishedConfig();
  if (!config) throw new Error('No published config found');

  const nextState = answerQuestion(
    config,
    session.state_json,
    session.mode,
    session.track ?? null,
    questionId,
    response
  );

  await db.sessions.update(sessionId, { state_json: nextState });
  await db.answers.add({
    id: nanoid(),
    session_id: sessionId,
    question_id: questionId,
    response_json: response,
    created_at: now()
  });

  return nextState;
};

export const undoSessionAnswer = async (sessionId: string) => {
  const session = await db.sessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  const config = await getPublishedConfig();
  if (!config) throw new Error('No published config found');

  const nextState = undoLastQuestion(config, session.state_json);

  await db.sessions.update(sessionId, { state_json: nextState });

  // Best effort to remove the log entry, though engine state is the source of truth for the assessment
  const lastAnswer = await db.answers.where('session_id').equals(sessionId).last();
  if (lastAnswer) {
    await db.answers.delete(lastAnswer.id);
  }

  return nextState;
};

export const completeSession = async (sessionId: string) => {
  const session = await db.sessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  const existing = await db.reports.where('session_id').equals(sessionId).first();
  if (existing) return existing.result_json;
  const config = await getPublishedConfig();
  if (!config) throw new Error('No published config found');

  const result = computeResult(config, session.state_json, session.mode, session.track ?? null);
  await db.sessions.update(sessionId, { completed_at: now() });
  await db.reports.add({
    id: nanoid(),
    session_id: sessionId,
    result_json: result,
    created_at: now()
  });

  return result;
};

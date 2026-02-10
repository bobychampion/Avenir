import { db } from './db';
import type { ConfigSnapshot } from './types';

export const getPublishedConfig = async (): Promise<ConfigSnapshot | null> => {
  const published = await db.config_versions.where('status').equals('published').first();
  return published?.config_json ?? null;
};

export const buildDraftSnapshot = async (): Promise<ConfigSnapshot> => {
  const [questions, options, traits, clusters] = await Promise.all([
    db.questions.toArray(),
    db.options.toArray(),
    db.traits.toArray(),
    db.clusters.toArray()
  ]);

  return { questions, options, traits, clusters };
};

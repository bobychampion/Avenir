import { db } from './db';
import { isSupabaseEnabled, supabase } from './supabase';
import type {
  Cluster,
  ConfigSnapshot,
  ConfigVersion,
  Draft,
  Option,
  Question,
  Trait
} from './types';

const now = () => new Date().toISOString();

const useSupabase = () => Boolean(isSupabaseEnabled && supabase);

const normalizeQuestion = (row: any): Question => ({
  id: row.id,
  mode: row.mode,
  type: row.type,
  prompt: row.prompt,
  tags: Array.isArray(row.tags) ? row.tags : [],
  branch_level: row.branch_level ?? 0,
  parent_question_id: row.parent_question_id ?? null,
  status: row.status,
  track: row.track ?? null,
  illustration_url: row.illustration_url ?? null
});

const normalizeOption = (row: any): Option => ({
  id: row.id,
  question_id: row.question_id,
  label: row.label,
  image_url: row.image_url ?? null,
  score_map: row.score_map ?? {},
  next_question_id: row.next_question_id ?? null,
  disengaged: row.disengaged ?? false
});

const normalizeTrait = (row: any): Trait => ({
  id: row.id,
  label: row.label,
  description: row.description
});

const normalizeCluster = (row: any): Cluster => ({
  id: row.id,
  label: row.label,
  description: row.description,
  track_bias: Array.isArray(row.track_bias) ? row.track_bias : [],
  trait_weights: row.trait_weights ?? {},
  trait_thresholds: row.trait_thresholds ?? {},
  subjects: Array.isArray(row.subjects) ? row.subjects : [],
  skills: Array.isArray(row.skills) ? row.skills : [],
  what_they_do: Array.isArray(row.what_they_do) ? row.what_they_do : [],
  next_steps: Array.isArray(row.next_steps) ? row.next_steps : []
});

const normalizeDraft = (row: any): Draft => ({
  id: row.id,
  name: row.name,
  updated_at: row.updated_at,
  draft_json: row.draft_json
});

const normalizeConfigVersion = (row: any): ConfigVersion => ({
  id: row.id,
  version: row.version,
  status: row.status,
  published_at: row.published_at ?? null,
  config_json: row.config_json
});

const logSupabaseError = (message: string, error: any) => {
  if (error) {
    console.warn(message, error);
  }
};

export const listQuestions = async (): Promise<Question[]> => {
  if (!useSupabase()) return db.questions.toArray();
  const { data, error } = await supabase!.from('questions').select('*');
  if (error || !data) {
    logSupabaseError('Supabase questions fetch failed', error);
    return db.questions.toArray();
  }
  return data.map(normalizeQuestion);
};

export const getQuestion = async (id: string): Promise<Question | null> => {
  if (!useSupabase()) return (await db.questions.get(id)) || null;
  const { data, error } = await supabase!.from('questions').select('*').eq('id', id).maybeSingle();
  if (error) {
    logSupabaseError('Supabase question lookup failed', error);
    return (await db.questions.get(id)) || null;
  }
  return data ? normalizeQuestion(data) : null;
};

export const countQuestions = async (): Promise<number> => {
  if (!useSupabase()) return db.questions.count();
  const { count, error } = await supabase!
    .from('questions')
    .select('id', { count: 'exact', head: true });
  if (error) {
    logSupabaseError('Supabase question count failed', error);
    return db.questions.count();
  }
  return count ?? 0;
};

export const upsertQuestion = async (question: Question) => {
  if (!useSupabase()) {
    await db.questions.put(question);
    return;
  }
  const { error } = await supabase!.from('questions').upsert(question, { onConflict: 'id' });
  if (error) {
    logSupabaseError('Supabase question upsert failed', error);
    await db.questions.put(question);
  }
};

export const deleteQuestion = async (id: string) => {
  if (!useSupabase()) {
    await db.questions.delete(id);
    return;
  }
  const { error } = await supabase!.from('questions').delete().eq('id', id);
  if (error) {
    logSupabaseError('Supabase question delete failed', error);
    await db.questions.delete(id);
  }
};

export const listOptions = async (): Promise<Option[]> => {
  if (!useSupabase()) return db.options.toArray();
  const { data, error } = await supabase!.from('options').select('*');
  if (error || !data) {
    logSupabaseError('Supabase options fetch failed', error);
    return db.options.toArray();
  }
  return data.map(normalizeOption);
};

export const listOptionsByQuestion = async (questionId: string): Promise<Option[]> => {
  if (!useSupabase()) {
    return db.options.where('question_id').equals(questionId).toArray();
  }
  const { data, error } = await supabase!
    .from('options')
    .select('*')
    .eq('question_id', questionId);
  if (error || !data) {
    logSupabaseError('Supabase options fetch by question failed', error);
    return db.options.where('question_id').equals(questionId).toArray();
  }
  return data.map(normalizeOption);
};

const normalizeOptionForInsert = (option: Option, questionId: string): Option => ({
  ...option,
  question_id: questionId,
  score_map: option.score_map ?? {},
  image_url: option.image_url ?? null,
  next_question_id: option.next_question_id ?? null,
  disengaged: option.disengaged ?? false
});

export const replaceOptionsForQuestion = async (questionId: string, options: Option[]) => {
  if (!useSupabase()) {
    await db.options.where('question_id').equals(questionId).delete();
    if (options.length > 0) {
      await db.options.bulkAdd(options.map((option) => normalizeOptionForInsert(option, questionId)));
    }
    return;
  }
  const { error: deleteError } = await supabase!
    .from('options')
    .delete()
    .eq('question_id', questionId);
  if (deleteError) {
    logSupabaseError('Supabase options delete failed', deleteError);
    await db.options.where('question_id').equals(questionId).delete();
  }
  if (options.length > 0) {
    const payload = options.map((option) => normalizeOptionForInsert(option, questionId));
    const { error: insertError } = await supabase!.from('options').insert(payload);
    if (insertError) {
      logSupabaseError('Supabase options insert failed', insertError);
      await db.options.bulkAdd(payload);
    }
  }
};

export const listTraits = async (): Promise<Trait[]> => {
  if (!useSupabase()) return db.traits.toArray();
  const { data, error } = await supabase!.from('traits').select('*');
  if (error || !data) {
    logSupabaseError('Supabase traits fetch failed', error);
    return db.traits.toArray();
  }
  return data.map(normalizeTrait);
};

export const upsertTrait = async (trait: Trait) => {
  if (!useSupabase()) {
    await db.traits.put(trait);
    return;
  }
  const { error } = await supabase!.from('traits').upsert(trait, { onConflict: 'id' });
  if (error) {
    logSupabaseError('Supabase trait upsert failed', error);
    await db.traits.put(trait);
  }
};

export const deleteTrait = async (id: string) => {
  if (!useSupabase()) {
    await db.traits.delete(id);
    return;
  }
  const { error } = await supabase!.from('traits').delete().eq('id', id);
  if (error) {
    logSupabaseError('Supabase trait delete failed', error);
    await db.traits.delete(id);
  }
};

export const listClusters = async (): Promise<Cluster[]> => {
  if (!useSupabase()) return db.clusters.toArray();
  const { data, error } = await supabase!.from('clusters').select('*');
  if (error || !data) {
    logSupabaseError('Supabase clusters fetch failed', error);
    return db.clusters.toArray();
  }
  return data.map(normalizeCluster);
};

export const upsertCluster = async (cluster: Cluster) => {
  if (!useSupabase()) {
    await db.clusters.put(cluster);
    return;
  }
  const { error } = await supabase!.from('clusters').upsert(cluster, { onConflict: 'id' });
  if (error) {
    logSupabaseError('Supabase cluster upsert failed', error);
    await db.clusters.put(cluster);
  }
};

export const deleteCluster = async (id: string) => {
  if (!useSupabase()) {
    await db.clusters.delete(id);
    return;
  }
  const { error } = await supabase!.from('clusters').delete().eq('id', id);
  if (error) {
    logSupabaseError('Supabase cluster delete failed', error);
    await db.clusters.delete(id);
  }
};

export const buildDraftSnapshot = async (): Promise<ConfigSnapshot> => {
  const [questions, options, traits, clusters] = await Promise.all([
    listQuestions(),
    listOptions(),
    listTraits(),
    listClusters()
  ]);

  return { questions, options, traits, clusters };
};

export const saveDraftSnapshot = async (snapshot: ConfigSnapshot, name = 'Default Draft') => {
  const draft: Draft = {
    id: 'draft_default',
    name,
    updated_at: now(),
    draft_json: snapshot
  };

  if (!useSupabase()) {
    await db.drafts.put(draft);
    return;
  }
  const { data, error } = await supabase!
    .from('drafts')
    .upsert(draft, { onConflict: 'id' })
    .select('*')
    .maybeSingle();
  if (error) {
    logSupabaseError('Supabase draft upsert failed', error);
    await db.drafts.put(draft);
  } else if (data) {
    normalizeDraft(data);
  }
};

export const listConfigVersions = async (): Promise<ConfigVersion[]> => {
  if (!useSupabase()) return db.config_versions.toArray();
  const { data, error } = await supabase!.from('config_versions').select('*');
  if (error || !data) {
    logSupabaseError('Supabase config versions fetch failed', error);
    return db.config_versions.toArray();
  }
  return data.map(normalizeConfigVersion);
};

export const getPublishedConfigVersion = async (): Promise<ConfigVersion | null> => {
  if (!useSupabase()) {
    return (await db.config_versions.where('status').equals('published').first()) || null;
  }
  const { data, error } = await supabase!
    .from('config_versions')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    logSupabaseError('Supabase published config fetch failed', error);
    return (await db.config_versions.where('status').equals('published').first()) || null;
  }
  return data ? normalizeConfigVersion(data) : null;
};

export const getPublishedConfig = async (): Promise<ConfigSnapshot | null> => {
  const published = await getPublishedConfigVersion();
  return published?.config_json ?? null;
};

export const addConfigVersion = async (version: ConfigVersion) => {
  if (!useSupabase()) {
    await db.config_versions.add(version);
    return;
  }
  const { error } = await supabase!.from('config_versions').insert(version);
  if (error) {
    logSupabaseError('Supabase config version insert failed', error);
    await db.config_versions.add(version);
  }
};

export const updateConfigVersion = async (id: string, patch: Partial<ConfigVersion>) => {
  if (!useSupabase()) {
    await db.config_versions.update(id, patch);
    return;
  }
  const { error } = await supabase!.from('config_versions').update(patch).eq('id', id);
  if (error) {
    logSupabaseError('Supabase config version update failed', error);
    await db.config_versions.update(id, patch);
  }
};

export const setPublishedConfigVersion = async (id: string) => {
  if (!useSupabase()) {
    await db.config_versions.where('status').equals('published').modify({ status: 'draft' });
    await db.config_versions.update(id, { status: 'published', published_at: now() });
    return;
  }
  const { error: demoteError } = await supabase!
    .from('config_versions')
    .update({ status: 'draft' })
    .eq('status', 'published');
  if (demoteError) {
    logSupabaseError('Supabase config version demote failed', demoteError);
    await db.config_versions.where('status').equals('published').modify({ status: 'draft' });
  }
  const { error } = await supabase!
    .from('config_versions')
    .update({ status: 'published', published_at: now() })
    .eq('id', id);
  if (error) {
    logSupabaseError('Supabase config version publish failed', error);
    await db.config_versions.where('status').equals('published').modify({ status: 'draft' });
    await db.config_versions.update(id, { status: 'published', published_at: now() });
  }
};

export const replaceConfigData = async (snapshot: ConfigSnapshot) => {
  if (!useSupabase()) {
    await db.questions.clear();
    await db.options.clear();
    await db.traits.clear();
    await db.clusters.clear();
    await db.questions.bulkAdd(snapshot.questions);
    await db.options.bulkAdd(snapshot.options);
    await db.traits.bulkAdd(snapshot.traits);
    await db.clusters.bulkAdd(snapshot.clusters);
    return;
  }

  let hadError = false;
  const clearAll = async (table: string, idColumn = 'id') => {
    const { error } = await supabase!.from(table).delete().neq(idColumn, '');
    if (error) {
      hadError = true;
      logSupabaseError(`Supabase clear ${table} failed`, error);
    }
  };

  // Delete in dependency order
  await clearAll('options');
  await clearAll('questions');
  await clearAll('traits');
  await clearAll('clusters');

  if (snapshot.traits.length > 0) {
    const { error } = await supabase!.from('traits').insert(snapshot.traits);
    if (error) {
      hadError = true;
      logSupabaseError('Supabase traits insert failed', error);
    }
  }
  if (snapshot.clusters.length > 0) {
    const { error } = await supabase!.from('clusters').insert(snapshot.clusters);
    if (error) {
      hadError = true;
      logSupabaseError('Supabase clusters insert failed', error);
    }
  }
  if (snapshot.questions.length > 0) {
    const { error } = await supabase!.from('questions').insert(snapshot.questions);
    if (error) {
      hadError = true;
      logSupabaseError('Supabase questions insert failed', error);
    }
  }
  if (snapshot.options.length > 0) {
    const { error } = await supabase!.from('options').insert(snapshot.options);
    if (error) {
      hadError = true;
      logSupabaseError('Supabase options insert failed', error);
    }
  }

  if (hadError) {
    await db.questions.clear();
    await db.options.clear();
    await db.traits.clear();
    await db.clusters.clear();
    await db.questions.bulkAdd(snapshot.questions);
    await db.options.bulkAdd(snapshot.options);
    await db.traits.bulkAdd(snapshot.traits);
    await db.clusters.bulkAdd(snapshot.clusters);
  }
};

export const hasConfigData = async () => {
  if (!useSupabase()) {
    const count = await db.traits.count();
    return count > 0;
  }
  const { count, error } = await supabase!
    .from('traits')
    .select('id', { count: 'exact', head: true });
  if (error) {
    logSupabaseError('Supabase traits count failed', error);
    const count = await db.traits.count();
    return count > 0;
  }
  return (count ?? 0) > 0;
};

export const ensurePublishedFromSnapshot = async (snapshot: ConfigSnapshot) => {
  const published = await getPublishedConfigVersion();
  if (published) return;
  const version: ConfigVersion = {
    id: 'config_v1',
    version: 'v1',
    status: 'published',
    published_at: now(),
    config_json: snapshot
  };
  await addConfigVersion(version);
};

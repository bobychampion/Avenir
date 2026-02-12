import { isSupabaseEnabled, supabase } from './supabase';

export type TaskStatus = 'not_started' | 'in_progress' | 'done';

export interface PathwayProgress {
  report_code: string;
  cluster_id: string;
  tasks: Record<string, TaskStatus>;
  reflection: string;
  updated_at: string;
}

const storageKey = (reportCode: string, clusterId: string) =>
  `avenir:pathway-progress:${reportCode}:${clusterId}`;

const emptyProgress = (reportCode: string, clusterId: string): PathwayProgress => ({
  report_code: reportCode,
  cluster_id: clusterId,
  tasks: {},
  reflection: '',
  updated_at: new Date().toISOString()
});

const readLocal = (reportCode: string, clusterId: string): PathwayProgress | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(reportCode, clusterId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PathwayProgress;
    return {
      report_code: reportCode,
      cluster_id: clusterId,
      tasks: parsed.tasks || {},
      reflection: parsed.reflection || '',
      updated_at: parsed.updated_at || new Date().toISOString()
    };
  } catch {
    return null;
  }
};

const writeLocal = (progress: PathwayProgress) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(progress.report_code, progress.cluster_id), JSON.stringify(progress));
};

const normalize = (row: any): PathwayProgress => ({
  report_code: row.report_code,
  cluster_id: row.cluster_id,
  tasks: row.tasks ?? {},
  reflection: row.reflection ?? '',
  updated_at: row.updated_at ?? new Date().toISOString()
});

const isNewer = (a?: string, b?: string) => {
  if (!a) return false;
  if (!b) return true;
  return Date.parse(a) > Date.parse(b);
};

export const loadProgress = async (reportCode: string, clusterId: string) => {
  const local = readLocal(reportCode, clusterId);
  if (!isSupabaseEnabled || !supabase) {
    return local ?? emptyProgress(reportCode, clusterId);
  }

  const { data, error } = await supabase
    .from('pathway_progress')
    .select('*')
    .eq('report_code', reportCode)
    .eq('cluster_id', clusterId)
    .maybeSingle();

  if (error || !data) {
    return local ?? emptyProgress(reportCode, clusterId);
  }

  const remote = normalize(data);

  if (!local) {
    writeLocal(remote);
    return remote;
  }

  if (isNewer(local.updated_at, remote.updated_at)) {
    await saveProgressRemote(local);
    return local;
  }

  writeLocal(remote);
  return remote;
};

export const saveProgressRemote = async (progress: PathwayProgress) => {
  if (!isSupabaseEnabled || !supabase) return;
  const payload = {
    report_code: progress.report_code,
    cluster_id: progress.cluster_id,
    tasks: progress.tasks,
    reflection: progress.reflection,
    updated_at: progress.updated_at
  };
  const { error } = await supabase
    .from('pathway_progress')
    .upsert(payload, { onConflict: 'report_code,cluster_id' });
  if (error) {
    console.warn('Supabase progress upsert failed', error);
  }
};

export const saveProgress = async (progress: PathwayProgress) => {
  writeLocal(progress);
  await saveProgressRemote(progress);
};

import { db } from './db';
import { isSupabaseEnabled, supabase } from './supabase';
import type { Report } from './types';

const mapRow = (row: any): Report => ({
  id: row.id,
  session_id: row.session_id,
  student_id: row.student_id ?? null,
  result_json: row.result_json,
  created_at: row.created_at
});

const mergeReports = (remote: Report[], local: Report[]) => {
  const seen = new Set(remote.map((report) => report.id));
  const merged = [...remote];
  local.forEach((report) => {
    if (!seen.has(report.id)) {
      merged.push(report);
    }
  });
  return merged.sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const listReports = async (studentId?: string | null): Promise<Report[]> => {
  const local = await db.reports.toArray();
  const localFiltered = studentId ? local.filter((report) => report.student_id === studentId) : local;
  if (!isSupabaseEnabled || !supabase) return localFiltered;

  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.warn('Supabase reports fetch failed', error);
    return localFiltered;
  }

  const remote = data.map(mapRow);
  return mergeReports(remote, localFiltered);
};

export const getReportById = async (id: string): Promise<Report | null> => {
  const local = await db.reports.get(id);
  if (!isSupabaseEnabled || !supabase) return local || null;

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.warn('Supabase report lookup failed', error);
    return local || null;
  }

  return data ? mapRow(data) : local || null;
};

export const getReportBySessionId = async (sessionId: string): Promise<Report | null> => {
  const local = await db.reports.where('session_id').equals(sessionId).first();
  if (!isSupabaseEnabled || !supabase) return local || null;

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('Supabase report lookup by session failed', error);
    return local || null;
  }

  return data ? mapRow(data) : local || null;
};

export const getReportByCode = async (code: string): Promise<Report | null> => {
  const normalized = code.trim().toUpperCase();
  const local = await db.reports
    .toArray()
    .then((items) => items.find((report) => report.result_json.report_code === normalized) || null);

  if (!isSupabaseEnabled || !supabase) return local;

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('report_code', normalized)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('Supabase report lookup by code failed', error);
    return local;
  }

  return data ? mapRow(data) : local;
};

export const saveReport = async (report: Report) => {
  await db.reports.put(report);

  if (!isSupabaseEnabled || !supabase) return;

  const payload = {
    id: report.id,
    session_id: report.session_id,
    student_id: report.student_id ?? null,
    report_code: report.result_json.report_code,
    result_json: report.result_json,
    created_at: report.created_at
  };

  const { error } = await supabase.from('reports').upsert(payload, { onConflict: 'id' });
  if (error) {
    console.warn('Supabase report upsert failed', error);
  }
};

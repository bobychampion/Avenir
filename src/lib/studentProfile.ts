import { isSupabaseEnabled, supabase } from './supabase';

export type School = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

export type StudentProfile = {
  id: string;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  school_id?: string | null;
  school_name?: string | null;
  location?: string | null;
  age?: number | null;
  class_level?: string | null;
  favorite_color?: string | null;
  favorite_food?: string | null;
  hobbies?: string[] | null;
  interests?: string[] | null;
  guardian_name?: string | null;
  guardian_email?: string | null;
  guardian_phone?: string | null;
  guardian_relationship?: string | null;
  guardian_permission?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export const isProfileComplete = (profile: StudentProfile | null) => {
  if (!profile) return false;
  return Boolean(profile.first_name && (profile.school_id || profile.school_name));
};

export const listSchools = async (): Promise<School[]> => {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('name', { ascending: true });
  if (error || !data) {
    console.warn('Supabase schools fetch failed', error);
    return [];
  }
  return data as School[];
};

export const createSchool = async (payload: Omit<School, 'id'>) => {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data, error } = await supabase
    .from('schools')
    .insert(payload)
    .select('*')
    .single();
  if (error) {
    console.warn('Supabase school create failed', error);
    return null;
  }
  return data as School;
};

export const getStudentProfile = async (id: string): Promise<StudentProfile | null> => {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.warn('Supabase profile fetch failed', error);
    return null;
  }
  return (data as StudentProfile | null) ?? null;
};

export const upsertStudentProfile = async (profile: StudentProfile) => {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data, error } = await supabase
    .from('student_profiles')
    .upsert(profile, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) {
    console.warn('Supabase profile upsert failed', error);
    return null;
  }
  return data as StudentProfile;
};

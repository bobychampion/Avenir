import { supabase, isSupabaseEnabled } from './supabase';

export const getCurrentStudent = async () => {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn('Supabase auth user fetch failed', error);
    return null;
  }
  return data.user ?? null;
};

export const signInStudent = async (email: string, password: string) => {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUpStudent = async (email: string, password: string) => {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase.auth.signUp({ email, password });
};

export const signOutStudent = async () => {
  if (!isSupabaseEnabled || !supabase) return;
  await supabase.auth.signOut();
};

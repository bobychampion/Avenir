import { isSupabaseEnabled, supabase } from './supabase';

export type PartnerSchool = {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string | null;
  created_at?: string | null;
};

export const listPartnerSchools = async (): Promise<PartnerSchool[]> => {
  if (!isSupabaseEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from('partner_schools')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) {
    console.warn('Supabase partner schools fetch failed', error);
    return [];
  }
  return data as PartnerSchool[];
};

export const createPartnerSchool = async (payload: Omit<PartnerSchool, 'id' | 'created_at'>) => {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data, error } = await supabase
    .from('partner_schools')
    .insert(payload)
    .select('*')
    .single();
  if (error) {
    console.warn('Supabase partner school create failed', error);
    return null;
  }
  return data as PartnerSchool;
};

export const deletePartnerSchool = async (id: string) => {
  if (!isSupabaseEnabled || !supabase) return false;
  const { error } = await supabase
    .from('partner_schools')
    .delete()
    .eq('id', id);
  if (error) {
    console.warn('Supabase partner school delete failed', error);
    return false;
  }
  return true;
};

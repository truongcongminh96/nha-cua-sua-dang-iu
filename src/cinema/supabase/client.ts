import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key);
export const supabase = configured ? createClient(url, key, { auth: { storageKey: 'milk-cinema.auth.v1', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }) : null;
export async function identity(): Promise<string> {
  if (!supabase) throw new Error('setup');
  const current = await supabase.auth.getSession();
  if (current.error) throw current.error;
  if (current.data.session) return current.data.session.user.id;
  const result = await supabase.auth.signInAnonymously();
  if (result.error) throw result.error;
  if (!result.data.user) throw new Error('connectionError');
  return result.data.user.id;
}

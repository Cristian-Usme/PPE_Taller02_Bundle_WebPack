import { supabase } from './supabaseClient.js';

export async function signUp(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });
  return error;
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error;
}

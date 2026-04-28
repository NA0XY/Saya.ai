import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import type { Database } from '../types/database';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export const db = <T extends keyof Database['public']['Tables']>(table: T) => supabase.from(String(table));

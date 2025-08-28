// lib/supabaseAdmin.server.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // URL poate fi public
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // STRICT server

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE envs: check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

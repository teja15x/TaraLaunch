import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

export function createSupabaseAdminClient() {
  const { url, isConfigured } = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isConfigured || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

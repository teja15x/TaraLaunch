import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

const PLACEHOLDER_SUPABASE_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_SUPABASE_ANON_KEY = 'placeholder-anon-key';

export function hasSupabaseBrowserConfig() {
  return getSupabaseConfig().isConfigured;
}

export function createClient() {
  if (browserClient) return browserClient;

  const { url, anonKey } = getSupabaseConfig();

  browserClient = createBrowserClient(
    url || PLACEHOLDER_SUPABASE_URL,
    anonKey || PLACEHOLDER_SUPABASE_ANON_KEY
  );
  return browserClient;
}

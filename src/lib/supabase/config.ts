const EMPTY_VALUE = '';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

function normalizeEnvValue(value?: string): string {
  return value?.trim() ?? EMPTY_VALUE;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

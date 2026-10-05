import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; key: string } | null {
  // 1. Tentar variáveis de ambiente
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('placeholder')) {
    return { url: envUrl, key: envKey };
  }

  // 2. Tentar localStorage no navegador
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('sentinela_supabase_url');
    const localKey = localStorage.getItem('sentinela_supabase_anon_key');
    if (localUrl && localKey) {
      return { url: localUrl, key: localKey };
    }
  }

  return null;
}

export function getSupabase(): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  if (!creds) return null;

  if (!cachedClient) {
    cachedClient = createClient(creds.url, creds.key);
  }
  return cachedClient;
}

export function setSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sentinela_supabase_url', url.trim());
    localStorage.setItem('sentinela_supabase_anon_key', key.trim());
    cachedClient = createClient(url.trim(), key.trim());
  }
}

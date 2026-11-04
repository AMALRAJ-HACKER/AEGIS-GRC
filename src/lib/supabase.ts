import { createClient } from '@supabase/supabase-js';

const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn('[AEGIS] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env');
}

export const supabase = createClient(url ?? 'https://placeholder.supabase.co', anonKey ?? 'placeholder', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // web: pick up magic-link / OAuth / recovery codes from the URL
  },
});

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The app still runs without Supabase configured — it falls back to the
// bundled menu data and disables features that need the database.
export const isSupabaseConfigured =
  Boolean(url) &&
  Boolean(anonKey) &&
  !url.includes('your-project-ref') &&
  !anonKey.includes('your-anon');

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// A short-lived client that does NOT persist its session, so admins can create
// staff accounts (auth.signUp) without clobbering their own logged-in session.
export function createAuthOnlyClient() {
  if (!isSupabaseConfigured) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, storageKey: 'aroma-temp-auth' },
  });
}

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[Aroma] Supabase is not configured. Copy .env.example to .env and add your project URL + anon key. Falling back to local data.'
  );
}

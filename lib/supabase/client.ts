import { createBrowserClient } from '@supabase/ssr';

export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_STORAGE_URL || process.env.STORAGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STORAGE_ANON_KEY || process.env.STORAGE_ANON_KEY;
  return Boolean(url && anonKey && !url.includes('your-project-ref') && url.startsWith('http'));
};

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a dummy client or null if not configured
    return null;
  }
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_STORAGE_URL || process.env.STORAGE_URL)!;
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STORAGE_ANON_KEY || process.env.STORAGE_ANON_KEY)!;
  return createBrowserClient(url, anonKey);
}

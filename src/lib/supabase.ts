import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.warn('⚠️ Brakuje VITE_SUPABASE_URL lub VITE_SUPABASE_PUBLISHABLE_KEY w Frontend/.env. Aplikacja działa w trybie awaryjnym (mock data).');
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key'
);

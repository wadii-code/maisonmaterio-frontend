import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

// Keep in sync with src/lib/seo.ts.
export const PRODUCTION_SITE_URL = 'https://www.maisonmateriau.com';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const distDir = resolve(root, 'dist');

const env = { ...loadEnv('production', root, 'VITE_'), ...process.env };

export const SITE_URL = (env.VITE_SITE_URL || PRODUCTION_SITE_URL).replace(/\/+$/, '');

const SUPABASE_URL = (env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || '';

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

export async function fetchTable(table, query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

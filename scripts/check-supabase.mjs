import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const envPath = '.env.local';
if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local.');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8');
const map = {};
for (const raw of env.split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  const val = line.slice(idx + 1).trim();
  map[key] = val;
}

const url = map.VITE_SUPABASE_URL;
const key = map.VITE_SUPABASE_PUBLISHABLE_KEY || map.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY/VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

const tables = [
  'reports',
  'student_profiles',
  'schools',
  'questions',
  'options',
  'traits',
  'clusters',
  'drafts',
  'config_versions',
  'pathway_progress'
];

let hadError = false;

for (const table of tables) {
  const { error, count, status } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  if (error) {
    hadError = true;
    console.error(`${table}: error`, {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details
    });
  } else {
    console.log(`${table}: ok (count=${count ?? 0}, status=${status})`);
  }
}

if (hadError) process.exit(2);

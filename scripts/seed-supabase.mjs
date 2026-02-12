import fs from 'node:fs';
import vm from 'node:vm';
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

const seedPath = 'src/lib/seed.ts';
if (!fs.existsSync(seedPath)) {
  console.error('Missing src/lib/seed.ts');
  process.exit(1);
}

let seedSource = fs.readFileSync(seedPath, 'utf8');

// Strip imports
seedSource = seedSource
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith('import '))
  .join('\n');

// Remove TypeScript annotations on array declarations
seedSource = seedSource
  .replace(/const\s+traits\s*:\s*Trait\[\]\s*=/, 'const traits =')
  .replace(/const\s+questions\s*:\s*Question\[\]\s*=/, 'const questions =')
  .replace(/const\s+options\s*:\s*Option\[\]\s*=/, 'const options =')
  .replace(/const\s+clusters\s*:\s*Cluster\[\]\s*=/, 'const clusters =')
  .replace(/const\s+buildSnapshot\s*=\s*\(\)\s*:\s*ConfigSnapshot\s*=>/g, 'const buildSnapshot = () =>')
  .replace(/export\s+const\s+/g, 'const ');

const context = {};
vm.runInNewContext(`${seedSource}\n__seed = { traits, questions, options, clusters };`, context, {
  filename: 'seed.ts'
});

const { traits, questions, options, clusters } = context.__seed || {};
if (!traits || !questions || !options || !clusters) {
  console.error('Failed to extract seed data from src/lib/seed.ts');
  process.exit(1);
}

const supabase = createClient(url, key);

const clearAll = async (table, idColumn = 'id') => {
  const { error } = await supabase.from(table).delete().neq(idColumn, '');
  if (error) {
    console.error(`Failed to clear ${table}:`, error);
    throw error;
  }
};

const insertBatch = async (table, rows) => {
  if (!rows || rows.length === 0) return;
  const { error } = await supabase.from(table).insert(rows);
  if (error) {
    console.error(`Failed to insert into ${table}:`, error);
    throw error;
  }
};

try {
  // Clear in dependency order
  await clearAll('options');
  await clearAll('questions');
  await clearAll('traits');
  await clearAll('clusters');
  await clearAll('drafts');
  await clearAll('config_versions');

  await insertBatch('traits', traits);
  await insertBatch('clusters', clusters);
  await insertBatch('questions', questions);
  const normalizedOptions = options.map((option) => ({
    ...option,
    disengaged: option.disengaged ?? false
  }));
  await insertBatch('options', normalizedOptions);

  const snapshot = { questions, options: normalizedOptions, traits, clusters };
  const timestamp = new Date().toISOString();

  const draft = {
    id: 'draft_default',
    name: 'Default Draft',
    updated_at: timestamp,
    draft_json: snapshot
  };

  const configVersion = {
    id: 'config_v1',
    version: 'v1',
    status: 'published',
    published_at: timestamp,
    config_json: snapshot
  };

  await insertBatch('drafts', [draft]);
  await insertBatch('config_versions', [configVersion]);

  console.log('Supabase config seed complete:', {
    traits: traits.length,
    clusters: clusters.length,
    questions: questions.length,
    options: options.length
  });
} catch (error) {
  console.error('Supabase seed failed.');
  process.exit(2);
}

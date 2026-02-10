import { useState } from 'react';
import { nanoid } from 'nanoid';
import { AppShell, AdminNav } from '../../components/layout';
import { Button, Card, SectionTitle } from '../../components/ui';
import { db } from '../../lib/db';
import { validateConfigSnapshot } from '../../lib/validation';
import type { ConfigSnapshot } from '../../lib/types';

const downloadJson = (data: object, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function ImportExport() {
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const exportConfig = async () => {
    const published = await db.config_versions.where('status').equals('published').first();
    if (!published) {
      setMessage('No published config available.');
      return;
    }
    downloadJson(published.config_json, `avenir-config-${published.version}.json`);
  };

  const importConfig = async (file: File) => {
    setErrors([]);
    setMessage('');
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as ConfigSnapshot;
      const validation = validateConfigSnapshot(parsed);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
      await db.questions.clear();
      await db.options.clear();
      await db.traits.clear();
      await db.clusters.clear();
      await db.questions.bulkAdd(parsed.questions);
      await db.options.bulkAdd(parsed.options);
      await db.traits.bulkAdd(parsed.traits);
      await db.clusters.bulkAdd(parsed.clusters);
      await db.drafts.put({
        id: 'draft_default',
        name: 'Imported Draft',
        updated_at: new Date().toISOString(),
        draft_json: parsed
      });
      await db.config_versions.add({
        id: nanoid(),
        version: `import-${Date.now()}`,
        status: 'draft',
        published_at: null,
        config_json: parsed
      });
      setMessage('Import complete. Publish the new version when ready.');
    } catch (error) {
      setErrors(['Invalid JSON format.']);
    }
  };

  return (
    <AppShell>
      <SectionTitle title="Import / Export" subtitle="Move assessment configurations between devices." />
      <AdminNav />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Export Published</div>
          <p className="mt-2 text-sm text-slate-500">Download the current published config as JSON.</p>
          <Button className="mt-4" onClick={exportConfig}>
            Export JSON
          </Button>
        </Card>
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Import Config</div>
          <p className="mt-2 text-sm text-slate-500">Upload a validated JSON file to replace the draft.</p>
          <input
            type="file"
            accept="application/json"
            className="mt-4"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) importConfig(file);
            }}
          />
        </Card>
      </div>

      {message && <div className="mt-4 text-sm text-moss">{message}</div>}
      {errors.length > 0 && (
        <div className="mt-4 text-sm text-ember">
          {errors.map((err) => (
            <div key={err}>- {err}</div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

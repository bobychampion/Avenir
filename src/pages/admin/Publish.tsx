import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { AppShell, AdminNav } from '../../components/layout';
import { Button, Card, SectionTitle } from '../../components/ui';
import { db } from '../../lib/db';
import { buildDraftSnapshot } from '../../lib/config';
import type { ConfigVersion } from '../../lib/types';

const now = () => new Date().toISOString();

export default function PublishManager() {
  const [versions, setVersions] = useState<ConfigVersion[]>([]);

  const load = async () => {
    const all = await db.config_versions.toArray();
    setVersions(all.sort((a, b) => b.published_at?.localeCompare(a.published_at || '') || 0));
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async () => {
    const snapshot = await buildDraftSnapshot();
    const latest = versions
      .map((version) => Number(version.version.replace(/[^0-9]/g, '')))
      .filter((value) => !Number.isNaN(value))
      .sort((a, b) => b - a)[0];
    const nextVersion = `v${(latest || 0) + 1}`;

    await db.config_versions.where('status').equals('published').modify({ status: 'draft' });
    await db.config_versions.add({
      id: nanoid(),
      version: nextVersion,
      status: 'published',
      published_at: now(),
      config_json: snapshot
    });

    await load();
  };

  const setPublished = async (id: string) => {
    await db.config_versions.where('status').equals('published').modify({ status: 'draft' });
    await db.config_versions.update(id, { status: 'published', published_at: now() });
    await load();
  };

  return (
    <AppShell>
      <SectionTitle title="Publish Versions" subtitle="Snapshot the current draft or roll back to a prior version." />
      <AdminNav />

      <div className="mt-6">
        <Button onClick={publish}>Publish Current Draft</Button>
      </div>

      <div className="mt-6 grid gap-4">
        {versions.map((version) => (
          <Card key={version.id} className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">{version.version}</div>
              <div className="mt-2 text-sm text-slate-500">
                Status: {version.status} - Published: {version.published_at || '--'}
              </div>
            </div>
            {version.status !== 'published' ? (
              <Button variant="outline" onClick={() => setPublished(version.id)}>
                Rollback to this version
              </Button>
            ) : (
              <Button variant="ghost" disabled>
                Current
              </Button>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

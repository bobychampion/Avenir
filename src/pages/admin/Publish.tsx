import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { AppShell, AdminNav } from '../../components/layout';
import { Badge, Button, Card, SectionTitle } from '../../components/ui';
import { db } from '../../lib/db';
import { buildDraftSnapshot } from '../../lib/config';
import { validatePublishSnapshot } from '../../lib/validation';
import type { ConfigVersion } from '../../lib/types';

const now = () => new Date().toISOString();

export default function PublishManager() {
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [validation, setValidation] = useState<{ errors: string[]; warnings: string[] }>({ errors: [], warnings: [] });
  const [message, setMessage] = useState('');

  const load = async () => {
    const all = await db.config_versions.toArray();
    setVersions(all.sort((a, b) => b.published_at?.localeCompare(a.published_at || '') || 0));
  };

  useEffect(() => {
    load();
    buildDraftSnapshot().then((snapshot) => setValidation(validatePublishSnapshot(snapshot)));
  }, []);

  const publish = async () => {
    const snapshot = await buildDraftSnapshot();
    const validationResult = validatePublishSnapshot(snapshot);
    setValidation(validationResult);
    if (validationResult.errors.length > 0) {
      setMessage('Resolve validation errors before publishing.');
      return;
    }
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

    setMessage('Published successfully.');
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={publish}>Publish Current Draft</Button>
        <Button
          variant="outline"
          onClick={async () => {
            const snapshot = await buildDraftSnapshot();
            setValidation(validatePublishSnapshot(snapshot));
            setMessage('Validation refreshed.');
          }}
        >
          Run Validation
        </Button>
        {message && <span className="text-sm text-slate-500">{message}</span>}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Validation Status</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className={validation.errors.length > 0 ? '!bg-ember/10 !text-ember' : '!bg-green-100 !text-green-700'}>
              {validation.errors.length > 0 ? `${validation.errors.length} Errors` : 'No Errors'}
            </Badge>
            <Badge className={validation.warnings.length > 0 ? '!bg-amber-100 !text-amber-700' : '!bg-slate-100 !text-slate-500'}>
              {validation.warnings.length > 0 ? `${validation.warnings.length} Warnings` : 'No Warnings'}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-slate-500">Publishing is blocked when errors exist.</p>
        </Card>
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Guardrails Enforced</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- Cycles, orphans, and unreachable endpoints</li>
            <li>- Max branch depth (level 3)</li>
            <li>- Missing tags or empty options</li>
            <li>- Invalid next-question links</li>
          </ul>
        </Card>
      </div>

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Errors</div>
            {validation.errors.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No errors found.</p>
            ) : (
              <div className="mt-3 space-y-2 text-sm text-ember">
                {validation.errors.map((error) => (
                  <div key={error}>- {error}</div>
                ))}
              </div>
            )}
          </Card>
          <Card>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Warnings</div>
            {validation.warnings.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No warnings found.</p>
            ) : (
              <div className="mt-3 space-y-2 text-sm text-amber-700">
                {validation.warnings.map((warning) => (
                  <div key={warning}>- {warning}</div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

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

import { useEffect, useState } from 'react';
import { AppShell, AdminNav } from '../../components/layout';
import { Badge, Card, SectionTitle, Select } from '../../components/ui';
import { buildDraftSnapshot } from '../../lib/config';
import { validateBranching } from '../../lib/branching';
import type { Mode, Track } from '../../lib/types';

export default function BranchingTool() {
  const [mode, setMode] = useState<Mode>('JSS');
  const [track, setTrack] = useState<Track>('SCIENCE');
  const [report, setReport] = useState(() =>
    validateBranching({ questions: [], options: [], traits: [], clusters: [] }, 'JSS')
  );

  useEffect(() => {
    const load = async () => {
      const snapshot = await buildDraftSnapshot();
      const validation = validateBranching(snapshot, mode, mode === 'SSS' ? track : null);
      setReport(validation);
    };
    load();
  }, [mode, track]);

  return (
    <AppShell>
      <SectionTitle title="Branching Validation" subtitle="Check for cycles, orphans, and reachable endpoints." />
      <AdminNav />

      <div className="mt-6 grid gap-4 md:grid-cols-[auto,auto,1fr]">
        <Select value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
          <option value="JSS">JSS</option>
          <option value="SSS">SSS</option>
        </Select>
        <Select
          value={track}
          onChange={(event) => setTrack(event.target.value as Track)}
          disabled={mode !== 'SSS'}
        >
          <option value="SCIENCE">SCIENCE</option>
          <option value="ARTS">ARTS</option>
          <option value="COMMERCIAL">COMMERCIAL</option>
        </Select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Status</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{report.cycles.length === 0 ? 'No cycles' : 'Cycles detected'}</Badge>
            <Badge>{report.orphans.length === 0 ? 'No orphans' : 'Orphans found'}</Badge>
            <Badge>{report.endReachable ? 'End reachable' : 'No end reachable'}</Badge>
          </div>
        </Card>
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Reachable Nodes</div>
          <div className="mt-3 text-2xl font-semibold text-night">{report.reachable.length}</div>
          <p className="mt-2 text-sm text-slate-500">Questions reachable from root nodes.</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Cycles</div>
          {report.cycles.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No cycles detected.</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {report.cycles.map((cycle, index) => (
                <div key={`${cycle.join('-')}-${index}`}>- {cycle.join(' -> ')}</div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Orphan Questions</div>
          {report.orphans.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No orphan nodes detected.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {report.orphans.map((orphan) => (
                <Badge key={orphan}>{orphan}</Badge>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

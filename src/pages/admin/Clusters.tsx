import { useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { AppShell, AdminNav } from '../../components/layout';
import { Badge, Button, Card, Input, SectionTitle, Select, Textarea } from '../../components/ui';
import { buildDraftSnapshot } from '../../lib/config';
import { deleteCluster, listClusters, listTraits, saveDraftSnapshot, upsertCluster } from '../../lib/configStore';
import type { Cluster, Trait, Track } from '../../lib/types';

const emptyCluster = (): Cluster => ({
  id: nanoid(),
  label: '',
  description: '',
  track_bias: [],
  trait_weights: {},
  trait_thresholds: {},
  subjects: [],
  skills: [],
  what_they_do: [],
  next_steps: []
});

const toList = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const toLines = (items?: string[]) => (items && items.length > 0 ? items.join('\n') : '');

export default function ClusterManager() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'JSS' | 'SSS'>('ALL');

  const load = async () => {
    const [clusterRows, traitRows] = await Promise.all([
      listClusters(),
      listTraits()
    ]);
    setClusters(clusterRows.sort((a, b) => a.label.localeCompare(b.label)));
    setTraits(traitRows.sort((a, b) => a.id.localeCompare(b.id)));
  };

  useEffect(() => {
    load();
  }, []);

  const updateCluster = (id: string, patch: Partial<Cluster>) => {
    setClusters((prev) => prev.map((cluster) => (cluster.id === id ? { ...cluster, ...patch } : cluster)));
  };

  const saveCluster = async (cluster: Cluster) => {
    await upsertCluster(cluster);
    const snapshot = await buildDraftSnapshot();
    await saveDraftSnapshot(snapshot, 'Default Draft');
    await load();
  };

  const removeCluster = async (id: string) => {
    await deleteCluster(id);
    const snapshot = await buildDraftSnapshot();
    await saveDraftSnapshot(snapshot, 'Default Draft');
    await load();
  };

  const addCluster = () => {
    setClusters((prev) => [emptyCluster(), ...prev]);
  };

  const filtered = useMemo(() => {
    if (filter === 'ALL') return clusters;
    return clusters.filter((cluster) => (filter === 'JSS' ? cluster.id.startsWith('JSS_') : cluster.id.startsWith('SSS_')));
  }, [clusters, filter]);

  const toggleTrack = (cluster: Cluster, track: Track) => {
    const next = cluster.track_bias.includes(track)
      ? cluster.track_bias.filter((item) => item !== track)
      : [...cluster.track_bias, track];
    updateCluster(cluster.id, { track_bias: next });
  };

  return (
    <AppShell>
      <SectionTitle title="Cluster Management" subtitle="Edit career clusters, weights, and prep steps." />
      <AdminNav />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={addCluster}>Add Cluster</Button>
        <Select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="!w-auto">
          <option value="ALL">All</option>
          <option value="JSS">JSS Directions</option>
          <option value="SSS">SSS Clusters</option>
        </Select>
      </div>

      <div className="mt-6 grid gap-6">
        {filtered.map((cluster) => (
          <Card key={cluster.id} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cluster ID</label>
                <Input
                  value={cluster.id}
                  onChange={(event) => updateCluster(cluster.id, { id: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Label</label>
                <Input
                  value={cluster.label}
                  onChange={(event) => updateCluster(cluster.id, { label: event.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Description</label>
              <Textarea
                rows={3}
                value={cluster.description}
                onChange={(event) => updateCluster(cluster.id, { description: event.target.value })}
              />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Track Bias</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(['SCIENCE', 'ARTS', 'COMMERCIAL'] as Track[]).map((track) => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => toggleTrack(cluster, track)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${cluster.track_bias.includes(track) ? 'bg-primary text-white shadow-glow' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {track}
                  </button>
                ))}
                {cluster.track_bias.length === 0 && (
                  <Badge className="!bg-slate-100 !text-slate-500">No bias</Badge>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trait Weights</div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {traits.map((trait) => (
                  <div key={trait.id}>
                    <label className="text-xs font-semibold text-slate-500">{trait.id}</label>
                    <Input
                      type="number"
                      value={cluster.trait_weights?.[trait.id] ?? 0}
                      onChange={(event) =>
                        updateCluster(cluster.id, {
                          trait_weights: {
                            ...cluster.trait_weights,
                            [trait.id]: Number(event.target.value)
                          }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trait Thresholds</div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {traits.map((trait) => (
                  <div key={trait.id}>
                    <label className="text-xs font-semibold text-slate-500">{trait.id}</label>
                    <Input
                      type="number"
                      value={cluster.trait_thresholds?.[trait.id] ?? 0}
                      onChange={(event) =>
                        updateCluster(cluster.id, {
                          trait_thresholds: {
                            ...cluster.trait_thresholds,
                            [trait.id]: Number(event.target.value)
                          }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Subjects (one per line)</label>
                <Textarea
                  rows={4}
                  value={toLines(cluster.subjects)}
                  onChange={(event) => updateCluster(cluster.id, { subjects: toList(event.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Skills (one per line)</label>
                <Textarea
                  rows={4}
                  value={toLines(cluster.skills)}
                  onChange={(event) => updateCluster(cluster.id, { skills: toList(event.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What they do (one per line)</label>
                <Textarea
                  rows={4}
                  value={toLines(cluster.what_they_do)}
                  onChange={(event) => updateCluster(cluster.id, { what_they_do: toList(event.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prep steps (one per line)</label>
                <Textarea
                  rows={4}
                  value={toLines(cluster.next_steps)}
                  onChange={(event) => updateCluster(cluster.id, { next_steps: toList(event.target.value) })}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => saveCluster(cluster)}>Save</Button>
              <Button variant="outline" onClick={() => removeCluster(cluster.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/layout';
import { Badge, Card, LinkButton, SectionTitle, Select } from '../../components/ui';
import { getPublishedConfig } from '../../lib/config';
import type { Cluster, ConfigSnapshot, Mode, Track } from '../../lib/types';

type TrackFilter = Track | 'ALL';

const fallbackDetails = (clusterId: string) => {
  if (clusterId.startsWith('JSS_')) {
    return {
      subjects: ['Mathematics', 'English Language', 'Basic Science'],
      skills: ['Curiosity', 'Communication', 'Problem solving']
    };
  }
  return {
    subjects: ['Mathematics', 'English Language', 'Relevant electives'],
    skills: ['Analytical thinking', 'Communication', 'Teamwork']
  };
};

const resolveDetails = (cluster: Cluster) => {
  const fallback = fallbackDetails(cluster.id);
  return {
    subjects: cluster.subjects && cluster.subjects.length > 0 ? cluster.subjects : fallback.subjects,
    skills: cluster.skills && cluster.skills.length > 0 ? cluster.skills : fallback.skills
  };
};

export default function StudentPathways() {
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);
  const [mode, setMode] = useState<Mode>('JSS');
  const [track, setTrack] = useState<TrackFilter>('ALL');

  useEffect(() => {
    getPublishedConfig().then(setConfig);
  }, []);

  const clusters = useMemo(() => {
    if (!config) return [];
    return config.clusters
      .filter((cluster) => {
        const isMode = mode === 'JSS' ? cluster.id.startsWith('JSS_') : cluster.id.startsWith('SSS_');
        if (!isMode) return false;
        if (mode === 'SSS' && track !== 'ALL') {
          return cluster.track_bias.includes(track);
        }
        return true;
      })
      .map((cluster) => ({
        ...cluster,
        ...resolveDetails(cluster)
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [config, mode, track]);

  if (!config) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-2xl font-bold text-slate-300 animate-pulse">Loading pathways...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionTitle
        title="Explore Pathways"
        subtitle="Browse available directions and career clusters with required subjects and skills."
      />

      <div className="grid gap-4 md:grid-cols-[auto,auto,1fr] mb-8">
        <Select value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
          <option value="JSS">JSS Directions</option>
          <option value="SSS">SSS Career Clusters</option>
        </Select>
        <Select
          value={track}
          onChange={(event) => setTrack(event.target.value as TrackFilter)}
          disabled={mode !== 'SSS'}
        >
          <option value="ALL">All Tracks</option>
          <option value="SCIENCE">Science</option>
          <option value="ARTS">Arts</option>
          <option value="COMMERCIAL">Commercial</option>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {clusters.map((cluster) => (
          <Card key={cluster.id} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-slate-500">{cluster.id}</div>
                <div className="mt-2 text-xl font-semibold text-night">{cluster.label}</div>
                <p className="mt-2 text-sm text-slate-500">{cluster.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <LinkButton to={`/student/careers/${cluster.id}`} variant="outline" className="!px-4 !py-2 text-xs">
                  View details
                </LinkButton>
                {cluster.track_bias.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {cluster.track_bias.map((item) => (
                      <Badge key={item} className="!bg-secondary/10 !text-secondary">{item}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Required subjects</div>
              <div className="flex flex-wrap gap-2">
                {cluster.subjects.map((subject) => (
                  <Badge key={subject} className="!bg-primary/10 !text-primary">{subject}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Core skills</div>
              <div className="flex flex-wrap gap-2">
                {cluster.skills.map((skill) => (
                  <Badge key={skill} className="!bg-slate-100 !text-slate-600">{skill}</Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

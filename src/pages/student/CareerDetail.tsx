import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Badge, Button, Card, SectionTitle } from '../../components/ui';
import { getPublishedConfig } from '../../lib/config';
import type { Cluster, ConfigSnapshot } from '../../lib/types';

const fallbackDetails = (clusterId: string) => {
  if (clusterId.startsWith('JSS_')) {
    return {
      subjects: ['Mathematics', 'English Language', 'Basic Science'],
      skills: ['Curiosity', 'Communication', 'Problem solving'],
      what_they_do: [
        'Explore different subjects and interests.',
        'Complete small projects to test new ideas.',
        'Learn from feedback and improve.'
      ],
      next_steps: [
        'Join a school club that interests you.',
        'Talk with a teacher about subject choices.',
        'Try a new activity each term.'
      ]
    };
  }
  return {
    subjects: ['Mathematics', 'English Language', 'Relevant electives'],
    skills: ['Analytical thinking', 'Communication', 'Teamwork'],
    what_they_do: [
      'Study topics in depth and apply them to projects.',
      'Use problem solving to tackle real challenges.',
      'Prepare for post-secondary or vocational paths.'
    ],
    next_steps: [
      'Review subject requirements for this pathway.',
      'Build a small portfolio or project.',
      'Find a mentor or teacher for guidance.'
    ]
  };
};

const resolveDetails = (cluster: Cluster) => {
  const fallback = fallbackDetails(cluster.id);
  return {
    subjects: cluster.subjects && cluster.subjects.length > 0 ? cluster.subjects : fallback.subjects,
    skills: cluster.skills && cluster.skills.length > 0 ? cluster.skills : fallback.skills,
    what_they_do: cluster.what_they_do && cluster.what_they_do.length > 0 ? cluster.what_they_do : fallback.what_they_do,
    next_steps: cluster.next_steps && cluster.next_steps.length > 0 ? cluster.next_steps : fallback.next_steps
  };
};

export default function CareerDetail() {
  const { clusterId } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);

  useEffect(() => {
    getPublishedConfig().then(setConfig);
  }, []);

  const cluster = useMemo(() => {
    if (!config || !clusterId) return null;
    return config.clusters.find((item) => item.id === clusterId) || null;
  }, [config, clusterId]);

  if (!config) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-2xl font-bold text-slate-300 animate-pulse">Loading pathway...</div>
        </div>
      </AppShell>
    );
  }

  if (!cluster) {
    return (
      <AppShell>
        <SectionTitle title="Pathway not found" subtitle="This career or direction is not available." />
        <Button onClick={() => navigate('/student/pathways')}>Browse pathways</Button>
      </AppShell>
    );
  }

  const details = resolveDetails(cluster);
  const modeLabel = cluster.id.startsWith('JSS_') ? 'JSS Direction' : 'SSS Career Cluster';

  return (
    <AppShell>
      <SectionTitle title={cluster.label} subtitle={cluster.description} />

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Badge>{modeLabel}</Badge>
        {cluster.track_bias.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cluster.track_bias.map((track) => (
              <Badge key={track} className="!bg-secondary/10 !text-secondary">{track}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">What you will do</div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {details.what_they_do.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary/60"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Required subjects</div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {details.subjects.map((subject) => (
              <li key={subject} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-300"></span>
                <span>{subject}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core skills</div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {details.skills.map((skill) => (
              <li key={skill} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-secondary/70"></span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next steps</div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {details.next_steps.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary/60"></span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button onClick={() => navigate(-1)} variant="outline">Back</Button>
        <Button onClick={() => navigate('/student/pathways')}>Browse pathways</Button>
      </div>
    </AppShell>
  );
}

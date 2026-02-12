import { useEffect, useState, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Badge, Button, LinkButton } from '../../components/ui';
import { db } from '../../lib/db';
import { getPublishedConfig } from '../../lib/config';
import { getReportBySessionId } from '../../lib/reportStore';
import type { AssessmentResult, ConfigSnapshot } from '../../lib/types';

const RICH_CONTENT: Record<string, { bgGradient: string }> = {
  'JSS_SCIENCE_ANALYTICAL': {
    bgGradient: 'from-blue-600 to-cyan-500'
  },
  'JSS_ARTS_HUMANITIES': {
    bgGradient: 'from-orange-500 to-pink-500'
  },
  'JSS_COMMERCIAL_BUSINESS': {
    bgGradient: 'from-indigo-600 to-purple-500'
  },
  'JSS_CREATIVE_DESIGN': {
    bgGradient: 'from-pink-500 to-rose-400'
  },
  'JSS_HYBRID': {
    bgGradient: 'from-emerald-500 to-teal-400'
  }
};

const GRADIENTS = [
  'from-blue-600 to-cyan-500',
  'from-orange-500 to-pink-500',
  'from-indigo-600 to-purple-500',
  'from-pink-500 to-rose-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-sky-500 to-indigo-400',
  'from-lime-500 to-green-400'
];

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

const downloadJson = (data: object, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function StudentResults() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState<AssessmentResult | null>(location.state as AssessmentResult | null);
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);

  useEffect(() => {
    if (result) return;
    if (!sessionId) {
      navigate('/student');
      return;
    }

    // Fallback load if state is missing (e.g. refresh)
    const load = async () => {
      const session = await db.sessions.get(sessionId);
      const report = await getReportBySessionId(sessionId);

      if (report) {
        setResult(report.result_json);
        return;
      }

      if (!session) {
        navigate('/student');
        return;
      }

      navigate('/student');
    };
    load();
  }, [sessionId, result, navigate]);

  useEffect(() => {
    getPublishedConfig().then(setConfig);
  }, []);

  const clusters = useMemo(() => {
    if (!result || !config) return [];
    return result.top_clusters.map((score, index) => {
      const def = config.clusters.find(c => c.id === score.clusterId);
      const fallback = fallbackDetails(score.clusterId);
      return {
        ...score,
        label: def?.label || score.clusterId,
        description: def?.description || 'Career pathway description.',
        trait_weights: def?.trait_weights || {},
        subjects: def?.subjects && def.subjects.length > 0 ? def.subjects : fallback.subjects,
        skills: def?.skills && def.skills.length > 0 ? def.skills : fallback.skills,
        next_steps: def?.next_steps && def.next_steps.length > 0 ? def.next_steps : fallback.next_steps,
        what_they_do: def?.what_they_do && def.what_they_do.length > 0 ? def.what_they_do : fallback.what_they_do,
        accent: RICH_CONTENT[score.clusterId]?.bgGradient || GRADIENTS[index % GRADIENTS.length]
      };
    });
  }, [result, config]);

  const engagement = result?.engagement || {
    level: 'MEDIUM' as const,
    disengagedCount: 0,
    answeredCount: 0,
    note: 'Engagement data not available yet.'
  };

  const primaryCluster = clusters[0];

  if (!result || !config) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
          <div className="text-2xl font-bold text-slate-300 animate-pulse">Loading results...</div>
        </div>
      </AppShell>
    );
  }



  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-16 pb-20">

        {/* 1. Hero Alignment Section */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>

          <div className="flex-1 space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
              ✨ Top Match
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-dark leading-tight">
              {config.clusters.find(c => c.id === result.primary_cluster)?.label}
            </h1>

            <div className="prose prose-lg text-slate-600">
              <p className="italic text-xl leading-relaxed">
                "{result.explanation.summary}"
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              {result.dominant_traits.map(trait => (
                <Badge key={trait} className="!bg-primary/5 !text-primary !text-sm !px-4 !py-2">
                  {trait.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/3 p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Match Strength</h3>
            <div className="flex flex-col gap-6">
              {clusters.slice(0, 3).map((cluster, i) => (
                <div key={cluster.clusterId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-bold ${i === 0 ? 'text-primary' : 'text-slate-600'}`}>
                      {cluster.label}
                    </span>
                    <span className="text-slate-400">{(cluster.score / 10).toFixed(1)}/10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, cluster.score * 5)}%` }}
                      className={`h-full rounded-full ${i === 0 ? 'bg-primary' : 'bg-slate-400'}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Primary Prep Summary */}
        {primaryCluster && (
          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key subjects</div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {primaryCluster.subjects.map((subject) => (
                  <li key={subject} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-slate-300"></span>
                    <span>{subject}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core skills</div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {primaryCluster.skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary/60"></span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prep steps</div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {primaryCluster.next_steps.map((step) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-secondary/70"></span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 3. Engagement Signal */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Engagement & Discipline</div>
            <div className="mt-4 flex items-center gap-3">
              <Badge className={`!px-4 !py-2 ${engagement.level === 'HIGH' ? '!bg-green-100 !text-green-700' : engagement.level === 'MEDIUM' ? '!bg-amber-100 !text-amber-700' : '!bg-ember/10 !text-ember'}`}>
                {engagement.level}
              </Badge>
              <span className="text-sm text-slate-500">
                {engagement.answeredCount > 0
                  ? `${engagement.disengagedCount} of ${engagement.answeredCount} low-effort responses`
                  : 'No engagement data yet'}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-600">{engagement.note}</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-white/60">Why it matters</div>
            <p className="mt-4 text-sm text-white/80">
              This signal helps us understand how carefully the answers were chosen. If engagement is low,
              the pathway results may be less accurate.
            </p>
          </div>
        </section>

        {/* 4. Pathways Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold font-display text-dark">Recommended Pathways</h2>
            <span className="text-slate-400 text-sm">Prioritized for you</span>
          </div>

          <div className="space-y-12">
            {clusters.slice(0, 3).map((cluster, index) => (
              <div key={cluster.clusterId} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 transition-transform hover:scale-[1.01] duration-500">
                {/* Header */}
                <div className="p-8 md:p-10 border-b border-slate-50">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-6">
                      <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br ${cluster.accent}`}>
                      {index + 1}
                    </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-dark mb-2">
                          {cluster.label}
                        </h3>
                        <p className="text-slate-500 text-lg max-w-2xl">
                          {cluster.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <LinkButton to={`/student/careers/${cluster.clusterId}`} variant="outline" className="!px-4 !py-2 text-xs">
                        View details
                      </LinkButton>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="md:grid md:grid-cols-12 bg-slate-50/50 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                  {/* Alignment (Left) */}
                  <div className="md:col-span-4 p-8 md:p-10 space-y-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Why it fits</h4>
                    <div className="space-y-4">
                      {result.dominant_traits.map(trait => {
                        // Mock logic: check if this trait is relevant to this cluster
                        const weight = cluster.trait_weights?.[trait] || 0;
                        if (weight < 0.5) return null;
                        return (
                          <div key={trait} className="flex gap-3">
                            <div className="h-6 w-1 rounded-full bg-green-400 flex-shrink-0 mt-1"></div>
                            <div>
                              <span className="block font-bold text-slate-700 capitalize">{trait}</span>
                              <span className="text-sm text-slate-500">Matches your natural style.</span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex gap-3">
                        <div className="h-6 w-1 rounded-full bg-blue-400 flex-shrink-0 mt-1"></div>
                        <div>
                          <span className="block font-bold text-slate-700">Track Interest</span>
                          <span className="text-sm text-slate-500">Aligned with your preferred subjects.</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Core skills</div>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {cluster.skills.map((skill) => (
                          <li key={skill} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary/60"></span>
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* What You'll Do (Center) */}
                  <div className="md:col-span-4 p-8 md:p-10 space-y-6 bg-white">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What you will do</h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      {cluster.what_they_do.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-secondary/70"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Required subjects</div>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {cluster.subjects.map((subject) => (
                          <li key={subject} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 rounded-full bg-slate-300"></span>
                            <span>{subject}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Learning Recommendations (Right) */}
                  <div className="md:col-span-4 p-8 md:p-10 space-y-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Learning recommendations</h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      {cluster.next_steps.map((step) => (
                        <li key={step} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary/60"></span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Footer Actions */}
        <section className="bg-night rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-secondary/50 opacity-20"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold">Ready to start, {location.state?.name || 'student'}?</h2>
            <p className="text-white/70">
              Explore these courses and professional bodies to begin building your professional foundation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => downloadJson(result, 'avenir-results.json')}
                className="bg-primary hover:bg-primary-light text-white text-lg px-8 py-4"
              >
                Download Strategy PDF
              </Button>
              <LinkButton
                to="/student/pathways"
                variant="outline"
                className="!border-white/20 !text-white hover:!bg-white/10 text-lg px-8 py-4"
              >
                Browse all pathways
              </LinkButton>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="!border-white/20 !text-white hover:!bg-white/10 text-lg px-8 py-4"
              >
                Back Home
              </Button>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}

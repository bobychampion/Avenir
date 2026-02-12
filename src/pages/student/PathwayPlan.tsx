import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Badge, Button, Card, LinkButton, SectionTitle, Textarea } from '../../components/ui';
import { getPublishedConfig } from '../../lib/config';
import { buildPathwayPlan, type PathwayPlan, type ResourceCategory, type TaskCadence } from '../../lib/pathwayPlan';
import { getReportBySessionId } from '../../lib/reportStore';
import { loadProgress, saveProgress, type TaskStatus } from '../../lib/progressStore';
import { getClusterImage } from '../../lib/pathwayImages';
import type { ConfigSnapshot } from '../../lib/types';

const categoryMeta: Record<ResourceCategory, { title: string; description: string; icon: string }> = {
  courses: { title: 'Courses', description: 'Short lessons that build your foundation.', icon: '🎓' },
  readings: { title: 'Readings & Books', description: 'Guides and articles to deepen understanding.', icon: '📚' },
  practicals: { title: 'Practicals', description: 'Hands-on activities to apply what you learn.', icon: '🧪' },
  audio: { title: 'Audio & Video', description: 'Listen, watch, and reflect on short content.', icon: '🎧' },
  events: { title: 'Events & Clubs', description: 'Meet people and practice in real settings.', icon: '🎯' }
};

const statusOrder: TaskStatus[] = ['not_started', 'in_progress', 'done'];

type StoredProgress = {
  tasks: Record<string, TaskStatus>;
  reflection: string;
  updatedAt: string;
};

const emptyProgress = (): StoredProgress => ({
  tasks: {},
  reflection: '',
  updatedAt: new Date().toISOString()
});

const localFallbackKey = (clusterId: string) => `avenir:pathway-progress:local:${clusterId}`;

const loadLocalFallback = (clusterId: string): StoredProgress => {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = window.localStorage.getItem(localFallbackKey(clusterId));
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as StoredProgress;
    return {
      tasks: parsed.tasks || {},
      reflection: parsed.reflection || '',
      updatedAt: parsed.updatedAt || new Date().toISOString()
    };
  } catch {
    return emptyProgress();
  }
};

const cadenceLabel = (cadence: TaskCadence) => (cadence === 'weekly' ? 'Weekly' : 'Monthly');

export default function PathwayPlan() {
  const { clusterId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);
  const [progress, setProgress] = useState<StoredProgress>(() => emptyProgress());
  const [reportCode, setReportCode] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getPublishedConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (!clusterId) return;
    const sessionId = searchParams.get('sessionId');
    const queryReportCode = searchParams.get('reportCode');
    const stored = typeof window === 'undefined' ? null : window.localStorage.getItem('avenir:last_report_code');
    if (queryReportCode) {
      setReportCode(queryReportCode);
      return;
    }
    if (sessionId) {
      getReportBySessionId(sessionId).then((report) => {
        if (report?.result_json?.report_code) {
          setReportCode(report.result_json.report_code);
          return;
        }
        if (stored) setReportCode(stored);
      });
      return;
    }
    if (stored) {
      setReportCode(stored);
      return;
    }
    setReportCode(null);
  }, [clusterId, searchParams]);

  useEffect(() => {
    if (!clusterId) return;
    setIsLoaded(false);
    if (!reportCode) {
      setProgress(loadLocalFallback(clusterId));
      setIsLoaded(true);
      return;
    }
    loadProgress(reportCode, clusterId).then((remote) => {
      setProgress({
        tasks: remote.tasks,
        reflection: remote.reflection,
        updatedAt: remote.updated_at
      });
      setIsLoaded(true);
    });
  }, [clusterId, reportCode]);

  useEffect(() => {
    if (!clusterId) return;
    if (!isLoaded) return;
    if (!reportCode) {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(localFallbackKey(clusterId), JSON.stringify({
        ...progress,
        updatedAt: new Date().toISOString()
      }));
      return;
    }
    const next = { ...progress, updatedAt: new Date().toISOString() };
    const handle = window.setTimeout(() => {
      saveProgress({
        report_code: reportCode,
        cluster_id: clusterId,
        tasks: next.tasks,
        reflection: next.reflection,
        updated_at: next.updatedAt
      });
    }, 600);
    return () => window.clearTimeout(handle);
  }, [clusterId, reportCode, progress, isLoaded]);

  useEffect(() => {
    if (!reportCode || typeof window === 'undefined') return;
    window.localStorage.setItem('avenir:last_report_code', reportCode);
  }, [reportCode]);

  const cluster = useMemo(() => {
    if (!config || !clusterId) return null;
    return config.clusters.find((item) => item.id === clusterId) || null;
  }, [config, clusterId]);

  const clusterImage = useMemo(() => getClusterImage(cluster?.id), [cluster]);

  const plan: PathwayPlan | null = useMemo(() => {
    if (!cluster) return null;
    return buildPathwayPlan(cluster);
  }, [cluster]);

  if (!config) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-2xl font-bold text-slate-300 animate-pulse">Loading pathway plan...</div>
        </div>
      </AppShell>
    );
  }

  if (!cluster || !plan) {
    return (
      <AppShell>
        <SectionTitle title="Pathway plan not found" subtitle="This plan is not available yet." />
        <Button onClick={() => navigate('/student/pathways')}>Browse pathways</Button>
      </AppShell>
    );
  }

  const totalTasks = plan.tasks.length;
  const completedTasks = plan.tasks.filter((task) => progress.tasks[task.id] === 'done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const updateTaskStatus = (taskId: string) => {
    setProgress((prev) => {
      const current = prev.tasks[taskId] ?? 'not_started';
      const nextIndex = (statusOrder.indexOf(current) + 1) % statusOrder.length;
      const next = statusOrder[nextIndex];
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: next
        }
      };
    });
  };

  const statusBadge = (status: TaskStatus) => {
    if (status === 'done') return 'bg-green-100 text-green-700';
    if (status === 'in_progress') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  };

  const resetProgress = () => {
    setProgress(emptyProgress());
  };

  const modeLabel = cluster.id.startsWith('JSS_') ? 'JSS Direction' : 'SSS Career Cluster';

  return (
    <AppShell>
      <SectionTitle
        title={`Pathway Dashboard: ${cluster.label}`}
        subtitle="Your personalized action plan and progress tracker."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="space-y-6">
          {clusterImage && (
            <img
              src={clusterImage}
              alt={cluster.label}
              className="h-44 w-full rounded-2xl object-cover"
            />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{modeLabel}</Badge>
            {cluster.track_bias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cluster.track_bias.map((track) => (
                  <Badge key={track} className="!bg-secondary/10 !text-secondary">{track}</Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Summary</div>
            <p className="mt-3 text-sm text-slate-600">{plan.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Focus subjects</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.subjects.map((subject) => (
                  <Badge key={subject} className="!bg-primary/10 !text-primary">{subject}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Key skills</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.skills.map((skill) => (
                  <Badge key={skill} className="!bg-slate-100 !text-slate-600">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LinkButton to={`/student/careers/${cluster.id}`} variant="outline" className="!px-4 !py-2 text-xs">
              View pathway details
            </LinkButton>
            <Button variant="outline" className="!px-4 !py-2 text-xs" onClick={resetProgress}>
              Reset progress
            </Button>
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Progress tracker</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="text-3xl font-bold text-dark">{progressPercent}%</div>
              <div className="text-sm text-slate-500">{completedTasks} of {totalTasks} tasks complete</div>
            </div>
            <div className="mt-4 h-3 w-full rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            {plan.tasks.map((task) => {
              const status = progress.tasks[task.id] ?? 'not_started';
              return (
                <div key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{task.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{task.description}</div>
                      <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {cadenceLabel(task.cadence)} focus
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateTaskStatus(task.id)}
                      className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider ${statusBadge(status)}`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {plan.milestones.map((milestone) => (
          <Card key={milestone.id} className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{milestone.timeframe}</div>
            <div className="text-xl font-semibold text-dark">{milestone.title}</div>
            <ul className="space-y-2 text-sm text-slate-600">
              {milestone.outcomes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary/60"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <SectionTitle title="Learning plan" subtitle="Pick one or two items per week and keep moving forward." />
        <div className="grid gap-6 md:grid-cols-2">
          {(Object.keys(categoryMeta) as ResourceCategory[]).map((category) => (
            <Card key={category} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{categoryMeta[category].icon}</div>
                <div>
                  <div className="text-lg font-semibold text-dark">{categoryMeta[category].title}</div>
                  <p className="text-sm text-slate-500">{categoryMeta[category].description}</p>
                </div>
              </div>
              <div className="space-y-3">
                {plan.resources[category].map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="text-sm font-semibold text-slate-700">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.detail}</div>
                    <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">{item.effort}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="space-y-4">
          <div className="text-lg font-semibold text-dark">Reflection journal</div>
          <p className="text-sm text-slate-500">
            Write a few lines each week about what you tried, what was hard, and what you want to improve next.
          </p>
          <Textarea
            rows={5}
            value={progress.reflection}
            onChange={(event) => setProgress((prev) => ({ ...prev, reflection: event.target.value }))}
            placeholder="Today I learned..."
          />
        </Card>

        <Card className="space-y-4">
          <div className="text-lg font-semibold text-dark">Next best action</div>
          <p className="text-sm text-slate-500">
            Pick one task below and complete it today.
          </p>
          <ul className="space-y-3 text-sm text-slate-600">
            {plan.tasks.slice(0, 3).map((task) => (
              <li key={task.id} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-secondary/70"></span>
                <span>{task.title}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}

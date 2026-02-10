import { useEffect, useState } from 'react';
import { AppShell, AdminNav } from '../../components/layout';
import { Card, SectionTitle } from '../../components/ui';
import { db } from '../../lib/db';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ questions: 0, reports: 0, published: 'v1' });

  useEffect(() => {
    const load = async () => {
      const [questions, reports, published] = await Promise.all([
        db.questions.count(),
        db.reports.count(),
        db.config_versions.where('status').equals('published').first()
      ]);
      setStats({ questions, reports, published: published?.version || '--' });
    };
    load();
  }, []);

  return (
    <AppShell>
      <SectionTitle title="Admin Dashboard" subtitle="Manage content, branching, and publishing." />
      <AdminNav />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Question Bank</div>
          <div className="mt-3 text-2xl font-semibold text-night">{stats.questions}</div>
          <p className="mt-2 text-sm text-slate-500">Active questions across JSS and SSS.</p>
        </Card>
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Published Version</div>
          <div className="mt-3 text-2xl font-semibold text-night">{stats.published}</div>
          <p className="mt-2 text-sm text-slate-500">Current live assessment configuration.</p>
        </Card>
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Reports</div>
          <div className="mt-3 text-2xl font-semibold text-night">{stats.reports}</div>
          <p className="mt-2 text-sm text-slate-500">Results stored on this device.</p>
        </Card>
      </div>
    </AppShell>
  );
}

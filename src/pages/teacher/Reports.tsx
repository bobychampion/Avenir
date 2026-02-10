import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Card, SectionTitle } from '../../components/ui';
import { db } from '../../lib/db';
import type { Report } from '../../lib/types';

export default function TeacherReports() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    db.reports.toArray().then((items) => setReports(items));
  }, []);

  return (
    <AppShell>
      <SectionTitle title="Teacher Reports" subtitle="Results generated on this device." />
      <div className="mt-6 grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">No reports yet</div>
            <p className="mt-2 text-sm text-slate-500">Complete a student assessment to generate reports.</p>
          </Card>
        ) : (
          reports.map((report) => (
            <Link key={report.id} to={`/teacher/${report.id}`}>
              <Card className="transition hover:-translate-y-1 hover:shadow-lift">
                <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Report</div>
                <div className="mt-2 text-lg font-semibold text-night">
                  {report.result_json.primary_cluster}
                </div>
                <div className="mt-1 text-sm text-slate-500">Code: {report.result_json.report_code}</div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}

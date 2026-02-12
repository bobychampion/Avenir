import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Badge, Card, SectionTitle } from '../../components/ui';
import { getReportById } from '../../lib/reportStore';
import type { Report } from '../../lib/types';

export default function ReportView() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!id) return;
    getReportById(id).then((item) => setReport(item || null));
  }, [id]);

  if (!report) {
    return (
      <AppShell>
        <SectionTitle title="Report not found" />
      </AppShell>
    );
  }

  const result = report.result_json;

  return (
    <AppShell>
      <SectionTitle title="Report Detail" subtitle={`Report code: ${result.report_code}`} />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Primary Cluster</div>
          <div className="mt-3 text-2xl font-semibold text-night">{result.primary_cluster}</div>
          <div className="mt-2 text-sm text-slate-500">Confidence: {result.confidence}</div>
          {result.engagement && (
            <div className="mt-2 text-sm text-slate-500">
              Engagement: {result.engagement.level}
              {result.engagement.answeredCount > 0
                ? ` (${result.engagement.disengagedCount}/${result.engagement.answeredCount} low-effort)`
                : ''}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {result.dominant_traits.map((trait) => (
              <Badge key={trait}>{trait}</Badge>
            ))}
          </div>
        </Card>
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Summary</div>
          <p className="mt-3 text-sm text-slate-600">{result.explanation.summary}</p>
          <div className="mt-4 text-sm font-semibold text-night">Next steps</div>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {result.explanation.next_steps.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}

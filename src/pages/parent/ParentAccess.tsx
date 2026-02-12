import { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout';
import { Button, Card, Input, SectionTitle } from '../../components/ui';
import { getReportByCode, listReports } from '../../lib/reportStore';
import type { Report } from '../../lib/types';

export default function ParentAccess() {
  const [code, setCode] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);

  useEffect(() => {
    listReports().then(setReports);
  }, []);

  const findReport = async () => {
    if (!code.trim()) {
      setSelected(null);
      return;
    }
    const match = await getReportByCode(code);
    setSelected(match || null);
  };

  return (
    <AppShell>
      <SectionTitle
        title="Parent Viewer"
        subtitle="Enter a report code or browse reports available locally and from Supabase."
      />

      <Card className="max-w-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Enter report code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <Button onClick={findReport}>Find Report</Button>
        </div>
        {selected ? (
          <div className="mt-4 text-sm text-slate-600">
            Found: {selected.result_json.primary_cluster} (Confidence {selected.result_json.confidence})
          </div>
        ) : (
          code && <div className="mt-4 text-sm text-ember">No report found for this code.</div>
        )}
      </Card>

      {selected && (
        <Card className="mt-6">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Report Detail</div>
          <div className="mt-2 text-lg font-semibold text-night">
            {selected.result_json.primary_cluster}
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Dominant traits: {selected.result_json.dominant_traits.join(', ')}
          </div>
          {selected.result_json.engagement && (
            <div className="mt-2 text-sm text-slate-500">
              Engagement: {selected.result_json.engagement.level}
              {selected.result_json.engagement.answeredCount > 0
                ? ` (${selected.result_json.engagement.disengagedCount}/${selected.result_json.engagement.answeredCount} low-effort)`
                : ''}
            </div>
          )}
          <div className="mt-4 text-sm text-slate-600">{selected.result_json.explanation.summary}</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {selected.result_json.explanation.next_steps.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-6 grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Report</div>
            <div className="mt-2 text-lg font-semibold text-night">
              {report.result_json.primary_cluster}
            </div>
            <div className="mt-1 text-sm text-slate-500">Code: {report.result_json.report_code}</div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

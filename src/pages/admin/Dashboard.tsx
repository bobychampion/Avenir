import { useEffect, useState } from 'react';
import { AppShell, AdminNav } from '../../components/layout';
import { Badge, Card, SectionTitle, Select } from '../../components/ui';
import { countQuestions, getPublishedConfigVersion } from '../../lib/configStore';
import { listReports } from '../../lib/reportStore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ questions: 0, reports: 0, published: 'v1' });
  const [engagement, setEngagement] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    avgLowEffort: 0
  });
  const [engagementTrend, setEngagementTrend] = useState({
    lowEffort: { currentAvg: 0, previousAvg: 0, delta: 0, currentCount: 0, previousCount: 0 },
    lowEngagement: { currentAvg: 0, previousAvg: 0, delta: 0, currentCount: 0, previousCount: 0 }
  });
  const [trendMetric, setTrendMetric] = useState<'low_engagement_share' | 'low_effort_ratio'>('low_engagement_share');

  useEffect(() => {
    const load = async () => {
      const [questions, published, reportRows] = await Promise.all([
        countQuestions(),
        getPublishedConfigVersion(),
        listReports()
      ]);
      setStats({ questions, reports: reportRows.length, published: published?.version || '--' });
      const engagementReports = reportRows.filter((report) => Boolean(report.result_json.engagement));
      const aggregate = engagementReports.reduce(
        (acc, report) => {
          const signal = report.result_json.engagement!;
          acc.total += 1;
          if (signal.level === 'HIGH') acc.high += 1;
          if (signal.level === 'MEDIUM') acc.medium += 1;
          if (signal.level === 'LOW') acc.low += 1;
          if (signal.answeredCount > 0) {
            acc.lowEffortTotal += signal.disengagedCount / signal.answeredCount;
            acc.lowEffortCount += 1;
          }
          return acc;
        },
        { total: 0, high: 0, medium: 0, low: 0, lowEffortTotal: 0, lowEffortCount: 0 }
      );

      setEngagement({
        total: aggregate.total,
        high: aggregate.high,
        medium: aggregate.medium,
        low: aggregate.low,
        avgLowEffort: aggregate.lowEffortCount > 0 ? aggregate.lowEffortTotal / aggregate.lowEffortCount : 0
      });

      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const startCurrent = now - weekMs;
      const startPrevious = now - 2 * weekMs;
      const currentRatios: number[] = [];
      const previousRatios: number[] = [];
      let currentLow = 0;
      let previousLow = 0;
      let currentTotal = 0;
      let previousTotal = 0;

      engagementReports.forEach((report) => {
        const createdAt = Date.parse(report.created_at);
        if (Number.isNaN(createdAt)) return;
        const signal = report.result_json.engagement!;
        const isCurrent = createdAt >= startCurrent;
        const isPrevious = createdAt >= startPrevious && createdAt < startCurrent;
        if (!isCurrent && !isPrevious) return;

        if (isCurrent) currentTotal += 1;
        if (isPrevious) previousTotal += 1;
        if (signal.level === 'LOW') {
          if (isCurrent) currentLow += 1;
          if (isPrevious) previousLow += 1;
        }

        if (signal.answeredCount > 0) {
          const ratio = signal.disengagedCount / signal.answeredCount;
          if (isCurrent) currentRatios.push(ratio);
          if (isPrevious) previousRatios.push(ratio);
        }
      });

      const average = (items: number[]) =>
        items.length === 0 ? 0 : items.reduce((sum, value) => sum + value, 0) / items.length;
      const currentRatioAvg = average(currentRatios);
      const previousRatioAvg = average(previousRatios);
      const currentLowShare = currentTotal > 0 ? currentLow / currentTotal : 0;
      const previousLowShare = previousTotal > 0 ? previousLow / previousTotal : 0;

      setEngagementTrend({
        lowEffort: {
          currentAvg: currentRatioAvg,
          previousAvg: previousRatioAvg,
          delta: currentRatioAvg - previousRatioAvg,
          currentCount: currentRatios.length,
          previousCount: previousRatios.length
        },
        lowEngagement: {
          currentAvg: currentLowShare,
          previousAvg: previousLowShare,
          delta: currentLowShare - previousLowShare,
          currentCount: currentTotal,
          previousCount: previousTotal
        }
      });
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
          <p className="mt-2 text-sm text-slate-500">Results stored locally and synced to Supabase.</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Engagement / Discipline</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="!bg-green-100 !text-green-700">High: {engagement.high}</Badge>
            <Badge className="!bg-amber-100 !text-amber-700">Medium: {engagement.medium}</Badge>
            <Badge className="!bg-ember/10 !text-ember">Low: {engagement.low}</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Based on {engagement.total} reports with engagement signals.
          </p>
        </Card>
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Low-effort Ratio (Avg)</div>
          <div className="mt-3 text-2xl font-semibold text-night">
            {(engagement.avgLowEffort * 100).toFixed(1)}%
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Average share of low-effort responses per report.
          </p>
        </Card>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Weekly Trend</div>
              <div className="mt-1 text-xs text-slate-400">Compare engagement by week</div>
            </div>
            <Select
              value={trendMetric}
              onChange={(event) => setTrendMetric(event.target.value as typeof trendMetric)}
              className="!w-auto"
            >
              <option value="low_engagement_share">LOW engagement share</option>
              <option value="low_effort_ratio">Low-effort ratio</option>
            </Select>
          </div>

          {(() => {
            const metric = trendMetric === 'low_engagement_share'
              ? engagementTrend.lowEngagement
              : engagementTrend.lowEffort;
            return (
              <>
                <div className="mt-4 text-2xl font-semibold text-night">
                  {(metric.currentAvg * 100).toFixed(1)}%
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  This week ({metric.currentCount} reports)
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className={`font-semibold ${metric.delta > 0 ? 'text-ember' : metric.delta < 0 ? 'text-moss' : 'text-slate-500'}`}>
                    {metric.previousCount === 0
                      ? 'No prior data'
                      : `${metric.delta > 0 ? '+' : ''}${(metric.delta * 100).toFixed(1)}%`}
                  </span>
                  {metric.previousCount > 0 && (
                    <span className="text-slate-500">vs last week ({(metric.previousAvg * 100).toFixed(1)}%)</span>
                  )}
                </div>
              </>
            );
          })()}
        </Card>
      </div>
    </AppShell>
  );
}

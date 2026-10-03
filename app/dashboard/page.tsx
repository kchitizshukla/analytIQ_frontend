"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Columns3, Database, Gauge, Rows3, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/primitives";
import { NoDataset } from "@/components/ui/NoDataset";
import { DataTable } from "@/components/datasets/DataTable";
import { DownloadButton } from "@/components/datasets/DownloadButton";
import { InsightsGrid } from "@/components/dashboard/InsightsGrid";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { ChartCard } from "@/components/charts/ChartCard";
import { useDatasetContext } from "@/hooks/useDatasetContext";
import { useProfile } from "@/hooks/useDatasetData";
import { generateVisualization } from "@/lib/api";
import type { VisualizationResult } from "@/types";
import { formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { activeId, activeDataset, loading } = useDatasetContext();
  const { profile } = useProfile(activeId);
  const [charts, setCharts] = useState<VisualizationResult[]>([]);

  useEffect(() => {
    if (!activeId || !profile) return;
    const cat = profile.categorical_columns[0];
    const num = profile.numeric_columns[0];
    const date = profile.datetime_columns[0];
    const num2 = profile.numeric_columns[1];
    const reqs: Promise<VisualizationResult>[] = [];
    if (cat && num)
      reqs.push(generateVisualization({ dataset_id: activeId, chart_type: "bar", dimension: cat, measures: [num], aggregation: { [num]: "sum" }, filters: [], sort: "desc", limit: 8 }));
    if (date && num)
      reqs.push(generateVisualization({ dataset_id: activeId, chart_type: "line", dimension: date, measures: [num], aggregation: { [num]: "sum" }, filters: [] }));
    if (cat && num2)
      reqs.push(generateVisualization({ dataset_id: activeId, chart_type: "bar", dimension: cat, measures: [num2], aggregation: { [num2]: "sum" }, filters: [], sort: "desc", limit: 8 }));
    if (num && num2)
      reqs.push(generateVisualization({ dataset_id: activeId, chart_type: "scatter", dimension: num, measures: [num2], aggregation: {}, filters: [], limit: 300 }));
    Promise.allSettled(reqs).then((res) =>
      setCharts(res.filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<VisualizationResult>).value)),
    );
  }, [activeId, profile]);

  if (loading) {
    return (
      <AppShell>
        <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      </AppShell>
    );
  }

  if (!activeId || !activeDataset) {
    return <AppShell><NoDataset /></AppShell>;
  }

  return (
    <AppShell>
      <PageHeader
        title={activeDataset.name}
        description={`${activeDataset.file_type.toUpperCase()} · ${activeDataset.original_filename}`}
        action={
          <div className="flex items-center gap-2">
            <DownloadButton datasetId={activeId} filename={activeDataset.original_filename} />
            <Link href="/assistant" className="btn-primary">Ask the AI <ArrowRight className="h-4 w-4" /></Link>
          </div>
        }
      />

      {/* summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Rows" value={formatNumber(activeDataset.row_count)} icon={Rows3} tone="brand" />
        <StatCard index={1} label="Columns" value={activeDataset.column_count} icon={Columns3} tone="violet" />
        <StatCard index={2} label="Data Quality" value={profile ? `${profile.quality_score}` : "—"} sub="score" icon={ShieldCheck} tone="emerald" />
        <StatCard index={3} label="Missing Values" value={profile ? formatNumber(profile.missing_values) : "—"} sub={profile ? `${profile.missing_percentage}%` : ""} icon={Gauge} tone="amber" />
      </div>

      {/* insights */}
      <section className="mt-8"><InsightsGrid datasetId={activeId} /></section>

      {/* analytics charts */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-900">Analytics</h2>
        {charts.length === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {charts.map((c, i) => <ChartCard key={i} viz={c} index={i} />)}
          </div>
        )}
      </section>

      {/* data preview */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-900">Data preview</h2>
        <div className="card p-5"><DataTable datasetId={activeId} /></div>
      </section>

      {/* assistant */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-ink-900">AnalytIQ Assistant</h2>
        <div className="h-[560px]">
          <AssistantPanel datasetId={activeId} datasetName={activeDataset.name} compact />
        </div>
      </section>
    </AppShell>
  );
}

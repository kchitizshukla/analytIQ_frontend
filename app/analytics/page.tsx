"use client";

import { useState } from "react";
import { BarChart3, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { VisualizationBuilder } from "@/components/visualization/VisualizationBuilder";
import { DataQuality } from "@/components/dashboard/DataQuality";
import { NoDataset } from "@/components/ui/NoDataset";
import { Skeleton } from "@/components/ui/primitives";
import { useDatasetContext } from "@/hooks/useDatasetContext";
import { useProfile } from "@/hooks/useDatasetData";
import { cn } from "@/lib/utils";

type Tab = "builder" | "quality";

export default function AnalyticsPage() {
  const { activeId, activeDataset } = useDatasetContext();
  const { profile, loading } = useProfile(activeId);
  const [tab, setTab] = useState<Tab>("builder");

  if (!activeId || !activeDataset) return <AppShell><NoDataset /></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Analytics" description={`Explore and visualize ${activeDataset.name}`} />

      <div className="mb-6 inline-flex rounded-xl border border-ink-200 bg-surface p-1">
        {([["builder", "Visualization Builder", BarChart3], ["quality", "Data Quality", ShieldCheck]] as const).map(
          ([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                tab === key ? "bg-brand-600 text-white shadow-sm" : "text-ink-600 hover:bg-elevated",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ),
        )}
      </div>

      {tab === "builder" && <VisualizationBuilder datasetId={activeId} />}
      {tab === "quality" &&
        (loading || !profile ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <DataQuality profile={profile} />
        ))}
    </AppShell>
  );
}

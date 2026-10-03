"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight, Clock, Database, FileSpreadsheet, FileText, FileType2, RefreshCw,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { EmptyState, Skeleton, TypeBadge } from "@/components/ui/primitives";
import { DownloadButton } from "@/components/datasets/DownloadButton";
import { useDatasetContext } from "@/hooks/useDatasetContext";
import { cn, formatBytes, formatDate, formatNumber } from "@/lib/utils";
import type { DatasetSummary } from "@/types";

const FILE_ICON: Record<string, React.ElementType> = {
  xlsx: FileSpreadsheet, xls: FileSpreadsheet, csv: FileType2, pdf: FileText,
};

const STATUS_STYLE: Record<string, string> = {
  ready: "bg-emerald-50 text-emerald-700",
  processing: "bg-amber-50 text-amber-700",
  pending: "bg-ink-100 text-ink-600",
  failed: "bg-red-50 text-red-700",
};

export default function HistoryPage() {
  const { datasets, activeId, loading, setActiveId, refresh } = useDatasetContext();
  const router = useRouter();

  function open(id: string) {
    setActiveId(id);
    router.push("/dashboard");
  }

  return (
    <AppShell>
      <PageHeader
        title="Upload history"
        description="Every file you've uploaded and analyzed, newest first."
        action={
          <button onClick={() => refresh()} className="btn-ghost" disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
          </button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : datasets.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No upload history yet"
          description="Files you upload will appear here so you can revisit or download them anytime."
          action={<button onClick={() => router.push("/datasets")} className="btn-primary">Upload a file</button>}
        />
      ) : (
        <>
          {/* Desktop / tablet: full-width table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-ink-200 bg-surface sm:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-ink-200 bg-ink-50/60">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-3">Dataset</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Rows</th>
                  <th className="px-4 py-3 text-right">Columns</th>
                  <th className="px-4 py-3 text-right">Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                    className={cn("border-t border-ink-100 transition hover:bg-brand-50/40", d.id === activeId && "bg-brand-50/50")}
                  >
                    <td className="px-5 py-3">
                      <button onClick={() => open(d.id)} className="flex items-center gap-3 text-left">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                          {(() => { const Icon = FILE_ICON[d.file_type] ?? Database; return <Icon className="h-4 w-4" />; })()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-ink-900">{d.name}</span>
                          <span className="block truncate text-xs text-ink-400">{d.original_filename}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={d.file_type} /></td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-700">{formatNumber(d.row_count)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-700">{d.column_count}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-700">{formatBytes(d.file_size)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("chip capitalize", STATUS_STYLE[d.status] ?? STATUS_STYLE.pending)}>{d.status}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-600">{formatDate(d.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => open(d.id)} className="btn-ghost px-3 py-1.5 text-xs" title="Open in dashboard">
                          Open <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                        <DownloadButton datasetId={d.id} filename={d.original_filename} variant="icon" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="space-y-3 sm:hidden">
            {datasets.map((d) => <HistoryCard key={d.id} ds={d} active={d.id === activeId} onOpen={() => open(d.id)} />)}
          </div>
        </>
      )}
    </AppShell>
  );
}

function HistoryCard({ ds, active, onOpen }: { ds: DatasetSummary; active: boolean; onOpen: () => void }) {
  const Icon = FILE_ICON[ds.file_type] ?? Database;
  return (
    <div className={cn("rounded-2xl border bg-surface p-4", active ? "border-brand-300 shadow-glow" : "border-ink-200")}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-ink-900">{ds.name}</h3>
          <p className="truncate text-xs text-ink-400">{ds.original_filename}</p>
          <p className="mt-1 text-xs text-ink-500">
            {formatNumber(ds.row_count)} rows · {ds.column_count} cols · {formatBytes(ds.file_size)}
          </p>
          <p className="mt-0.5 text-xs text-ink-400">{formatDate(ds.created_at)}</p>
        </div>
        <span className={cn("chip capitalize", STATUS_STYLE[ds.status] ?? STATUS_STYLE.pending)}>{ds.status}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={onOpen} className="btn-ghost flex-1 px-3 py-1.5 text-xs">Open <ArrowUpRight className="h-3.5 w-3.5" /></button>
        <DownloadButton datasetId={ds.id} filename={ds.original_filename} variant="ghost" label="Download" className="flex-1 px-3 py-1.5 text-xs" />
      </div>
    </div>
  );
}

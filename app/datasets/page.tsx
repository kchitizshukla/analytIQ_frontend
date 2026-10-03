"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Database, FileSpreadsheet, FileText, FileType2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { UploadDropzone } from "@/components/datasets/UploadDropzone";
import { EmptyState, Skeleton, TypeBadge } from "@/components/ui/primitives";
import { useDatasetContext } from "@/hooks/useDatasetContext";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import type { DatasetSummary } from "@/types";

const FILE_ICON: Record<string, React.ElementType> = {
  xlsx: FileSpreadsheet, xls: FileSpreadsheet, csv: FileType2, pdf: FileText,
};

export default function DatasetsPage() {
  const { datasets, activeId, loading, setActiveId, refresh } = useDatasetContext();
  const router = useRouter();

  async function onUploaded(id: string) {
    await refresh();
    setActiveId(id);
    router.push("/dashboard");
  }

  return (
    <AppShell>
      <PageHeader title="Datasets" description="Upload a file to ingest, profile, and analyze it." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <UploadDropzone onComplete={(ds) => onUploaded(ds.id)} />
          <p className="mt-3 text-xs text-ink-400">
            Files are parsed on the backend — columns and types are detected automatically.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Your datasets</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
          ) : datasets.length === 0 ? (
            <EmptyState icon={Database} title="No datasets yet" description="Upload your first file to get started." />
          ) : (
            <div className="space-y-3">
              {datasets.map((d, i) => (
                <DatasetRow key={d.id} ds={d} active={d.id === activeId} index={i}
                  onSelect={() => { setActiveId(d.id); router.push("/dashboard"); }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function DatasetRow({ ds, active, index, onSelect }: { ds: DatasetSummary; active: boolean; index: number; onSelect: () => void }) {
  const Icon = FILE_ICON[ds.file_type] ?? Database;
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border bg-surface p-4 text-left transition hover:shadow-soft",
        active ? "border-brand-300 shadow-glow" : "border-ink-200",
      )}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-ink-900">{ds.name}</h3>
          <TypeBadge type={ds.file_type} />
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {ds.row_count.toLocaleString()} rows · {ds.column_count} columns · {formatBytes(ds.file_size)} · {formatDate(ds.created_at)}
        </p>
      </div>
      {active && <span className="chip bg-brand-50 text-brand-700">Active</span>}
    </motion.button>
  );
}

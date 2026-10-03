"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { DatasetPreview } from "@/types";
import { getPreview } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { Skeleton, EmptyState } from "@/components/ui/primitives";

const PAGE_SIZE = 25;

export function DataTable({ datasetId }: { datasetId: string }) {
  const [data, setData] = useState<DatasetPreview | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setPage(1);
  }, [datasetId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPreview(datasetId, page, PAGE_SIZE)
      .then((d) => active && setData(d))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [datasetId, page]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data.rows;
    const q = query.toLowerCase();
    return data.rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [data, query]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total_rows / PAGE_SIZE)) : 1;

  if (loading && !data) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (!data || !data.columns.length) {
    return <EmptyState title="No data to preview" description="This dataset has no rows." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this page…"
            className="input pl-9"
          />
        </div>
        <span className="text-xs text-ink-500">{data.total_rows.toLocaleString()} total rows</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-ink-50">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-ink-400">#</th>
              {data.columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-ink-600">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-t border-ink-100 transition hover:bg-brand-50/40">
                <td className="px-3 py-2 text-xs text-ink-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                {data.columns.map((c) => (
                  <td key={c} className="whitespace-nowrap px-3 py-2 text-ink-700">
                    {typeof row[c] === "number" ? formatNumber(row[c] as number) : String(row[c] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-ghost px-3 py-1.5">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-ghost px-3 py-1.5">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

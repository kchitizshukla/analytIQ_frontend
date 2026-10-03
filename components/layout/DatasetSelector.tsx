"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Database } from "lucide-react";
import { useDatasetContext } from "@/hooks/useDatasetContext";
import { cn } from "@/lib/utils";

export function DatasetSelector() {
  const { datasets, activeId, activeDataset, setActiveId } = useDatasetContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!datasets.length) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-400">
        <Database className="h-4 w-4" />
        No datasets
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-w-[200px] items-center justify-between gap-2 rounded-xl border border-ink-200 bg-surface px-3 py-2 text-sm font-medium text-ink-800 transition hover:border-brand-300 hover:shadow-sm"
      >
        <span className="flex items-center gap-2 truncate">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-50 text-brand-600">
            <Database className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">{activeDataset?.name ?? "Select dataset"}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-ink-400 transition", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-xl border border-ink-200 bg-surface p-1.5 shadow-glow"
          >
            {datasets.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setActiveId(d.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-elevated",
                  d.id === activeId && "bg-brand-50",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink-900">{d.name}</span>
                  <span className="block text-xs text-ink-400">
                    {d.row_count.toLocaleString()} rows · {d.column_count} cols
                  </span>
                </span>
                {d.id === activeId && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

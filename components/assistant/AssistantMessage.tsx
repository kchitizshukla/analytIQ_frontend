"use client";

import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import type { KpiCard, VisualizationResult } from "@/types";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { cn, formatNumber } from "@/lib/utils";

export interface UiMessage {
  role: "user" | "assistant";
  content: string;
  responseType?: string;
  kpis?: KpiCard[];
  viz?: VisualizationResult | null;
  data?: Record<string, any>;
  error?: boolean;
}

function DataTable({ rows }: { rows: Record<string, any>[] }) {
  if (!rows?.length) return null;
  const cols = Object.keys(rows[0]);
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-ink-200">
      <table className="w-full text-sm">
        <thead className="bg-ink-50">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left text-xs font-semibold text-ink-600">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((r, i) => (
            <tr key={i} className="border-t border-ink-100">
              {cols.map((c) => (
                <td key={c} className="px-3 py-2 text-ink-700">
                  {typeof r[c] === "number" ? formatNumber(r[c]) : String(r[c] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KpiRow({ kpis }: { kpis: KpiCard[] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {kpis.map((k, i) => (
        <div key={i} className="rounded-xl border border-ink-200 bg-surface px-3 py-2.5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{k.label}</div>
          <div className="mt-0.5 text-lg font-bold text-ink-900">{k.value}</div>
        </div>
      ))}
    </div>
  );
}

export function AssistantMessage({ msg }: { msg: UiMessage }) {
  const isUser = msg.role === "user";
  const tableRows: Record<string, any>[] | undefined =
    msg.data?.rows || msg.data?.anomaly?.rows || msg.data?.correlation?.pairs;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
          isUser ? "bg-ink-200 text-ink-600" : "bg-gradient-to-br from-brand-600 to-accent-500 text-white",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div className={cn("min-w-0 max-w-[85%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-elevated text-ink-900"
              : msg.error
                ? "border border-red-200 bg-red-50 text-red-700"
                : "border border-ink-200 bg-surface text-ink-800",
          )}
        >
          {msg.content}
        </div>
        {!isUser && (
          <div className="w-full">
            {msg.kpis && msg.kpis.length > 0 && <KpiRow kpis={msg.kpis} />}
            {msg.viz && (
              <div className="mt-3 rounded-2xl border border-ink-200 bg-surface p-4">
                <div className="mb-1 text-xs font-semibold text-ink-700">{msg.viz.title}</div>
                <ChartRenderer viz={msg.viz} height={260} />
              </div>
            )}
            {!msg.viz && tableRows && <DataTable rows={tableRows} />}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 text-white">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl border border-ink-200 bg-surface px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-ink-300"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowUpRight, Lightbulb, RefreshCw, TrendingUp, GitCompare, Activity,
} from "lucide-react";
import type { Insight } from "@/types";
import { generateInsights, errorMessage } from "@/lib/api";
import { Skeleton, ErrorState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  trend: TrendingUp, comparison: GitCompare, correlation: Activity,
  anomaly: AlertTriangle, summary: Lightbulb, quality: AlertTriangle,
};
const SEVERITY: Record<string, string> = {
  info: "from-brand-50 to-surface text-brand-700 border-brand-100",
  positive: "from-emerald-50 to-surface text-emerald-700 border-emerald-200",
  warning: "from-amber-50 to-surface text-amber-700 border-amber-200",
  critical: "from-red-50 to-surface text-red-700 border-red-200",
};

export function InsightsGrid({ datasetId }: { datasetId: string }) {
  const toast = useToast();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [withAi, setWithAi] = useState(false);

  async function load(refresh = false) {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await generateInsights(datasetId, refresh);
      setInsights(res.insights);
      setWithAi(res.generated_with_ai);
    } catch (e) {
      const msg = errorMessage(e, "Unable to generate insights.");
      setError(msg);
      toast.error("Unable to generate insights.", { description: msg });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-ink-900">Key insights</h2>
          <span className={cn("chip", withAi ? "bg-accent-400/10 text-accent-600" : "bg-ink-100 text-ink-500")}>
            {withAi ? "AI-generated" : "Deterministic"}
          </span>
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className="btn-ghost px-3 py-1.5 text-xs">
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Regenerate
        </button>
      </div>

      {error && <ErrorState message={error} />}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((ins, i) => {
            const Icon = ICONS[ins.insight_type] ?? Lightbulb;
            return (
              <motion.div
                key={ins.id ?? i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className={cn("rounded-2xl border bg-gradient-to-br p-5 shadow-soft", SEVERITY[ins.severity] ?? SEVERITY.info)}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface/80 shadow-sm">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 opacity-40" />
                </div>
                <h3 className="mt-3 font-semibold text-ink-900">{ins.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{ins.description}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

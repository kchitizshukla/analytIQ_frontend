"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
  icon: Icon,
  delta,
  trend,
  index = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "brand" | "emerald" | "amber" | "violet";
  icon?: React.ElementType;
  delta?: string | null;
  trend?: string | null;
  index?: number;
}) {
  const tones: Record<string, string> = {
    default: "text-ink-900",
    brand: "text-brand-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    violet: "text-violet-700",
  };
  const iconBg: Record<string, string> = {
    default: "bg-ink-100 text-ink-500",
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {Icon && (
          <span className={cn("grid h-8 w-8 place-items-center rounded-lg", iconBg[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className={cn("mt-3 text-2xl font-bold tracking-tight", tones[tone])}>{value}</div>
      <div className="mt-1 flex items-center gap-2">
        {sub && <span className="text-xs text-ink-500">{sub}</span>}
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              trend === "down" ? "text-red-600" : "text-emerald-600",
            )}
          >
            {trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
    </motion.div>
  );
}

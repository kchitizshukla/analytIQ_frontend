import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined, opts?: { compact?: boolean }): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (opts?.compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export function titleCase(s: string): string {
  return s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Remove a trailing file extension (e.g. "Sales 2026.xlsx" -> "Sales 2026"). */
export function stripExtension(name: string | null | undefined): string {
  if (!name) return "";
  return name.replace(/\.[^.\/\\]+$/, "");
}

/** Compact relative timestamp: "Just now", "5 minutes ago", "Yesterday", "Sep 28". */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 45) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return m <= 1 ? "1 minute ago" : `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return h <= 1 ? "1 hour ago" : `${h} hours ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// Coordinated chart palette (Deep Purple + Lavender theme). Distinct hues so
// multi-series charts stay distinguishable against the dark background.
export const CHART_COLORS = [
  "#9B7AE8", // primary purple
  "#55B7A4", // teal
  "#D6A84F", // gold
  "#D97870", // coral
  "#7167B5", // indigo
  "#BFA9F4", // lavender
  "#7E65C5", // soft purple
  "#82908A", // slate
];

// Shared chart chrome (axes, grid, tooltip) — one per theme. The data-series
// palette (CHART_COLORS) stays the same across themes so series remain
// recognizable; only the chrome adapts for readability.
export const CHART_THEME_DARK = {
  axis: "#9992A8",
  axisLine: "#2B2635",
  grid: "#2B2635",
  tooltipBg: "#211C2B",
  tooltipBorder: "#3A3347",
  tooltipText: "#F5F2FA",
  cursor: "rgba(155,122,232,.10)",
};
export const CHART_THEME_LIGHT = {
  axis: "#777080",
  axisLine: "#E4DFEC",
  grid: "#E4DFEC",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#D5CDE1",
  tooltipText: "#211C2B",
  cursor: "rgba(118,85,199,.08)",
};
export type ChartTheme = typeof CHART_THEME_DARK;

export const TYPE_BADGE: Record<string, string> = {
  numeric: "bg-brand-50 text-brand-700",
  currency: "bg-emerald-50 text-emerald-700",
  percentage: "bg-amber-50 text-amber-700",
  datetime: "bg-violet-50 text-violet-700",
  boolean: "bg-ink-100 text-ink-600",
  categorical: "bg-ink-200 text-ink-700",
  text: "bg-ink-100 text-ink-500",
};

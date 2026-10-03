"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

const SLIDE_MS = 5000;

const STEPS = ["Upload", "Understand", "Visualize", "Ask AI", "Discover"] as const;

/** Animated count-up that respects reduced motion. */
function CountUp({ to, decimals = 0, prefix = "", suffix = "" }: { to: number; decimals?: number; prefix?: string; suffix?: string }) {
  const reduced = useReducedMotion();
  const [val, setVal] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reduced]);
  return <span>{prefix}{val.toFixed(decimals)}{suffix}</span>;
}

/* ----------------------------- Slide 1: chart ---------------------------- */
function VisualizeSlide() {
  const reduced = useReducedMotion();
  const bars = [38, 52, 44, 66, 58, 78, 72, 92];
  const points = [60, 48, 54, 36, 42, 26, 30, 14]; // y-coords (lower = higher value)
  const line = points.map((y, i) => `${8 + i * 12},${y}`).join(" ");
  return (
    <SlideShell title="Visualize your data" subtitle="Charts rendered live from your dataset">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-white/40">Revenue</div>
            <div className="text-base font-semibold text-white lg:text-lg">$1.48M this year</div>
          </div>
          <span className="chip bg-emerald-500/15 text-sm text-emerald-300">+24.8%</span>
        </div>
        <svg viewBox="0 0 104 72" className="h-56 w-full lg:h-72" preserveAspectRatio="none">
          {/* bars */}
          {bars.map((h, i) => (
            <motion.rect
              key={i}
              x={8 + i * 12}
              width={7}
              rx={1.5}
              fill="url(#barGrad)"
              initial={reduced ? false : { height: 0, y: 70 }}
              animate={{ height: h * 0.7, y: 70 - h * 0.7 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: "easeOut" }}
            />
          ))}
          {/* trend line */}
          <motion.polyline
            points={line}
            fill="none"
            stroke="#BFA9F4"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AD91F0" />
              <stop offset="100%" stopColor="#9B7AE8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </SlideShell>
  );
}

/* --------------------------- Slide 2: ask AI ----------------------------- */
function AskAiSlide() {
  const reduced = useReducedMotion();
  return (
    <SlideShell title="Ask your data anything" subtitle="Natural-language questions, grounded answers">
      <div className="space-y-4">
        <motion.div
          initial={reduced ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-5 py-3.5 text-base text-white lg:text-lg"
        >
          Which region generated the highest profit?
        </motion.div>
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="flex items-start gap-3"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-5 py-3.5 text-base text-white/90 lg:text-lg">
            <span className="font-semibold text-white">North</span> generated the highest profit at{" "}
            <span className="font-semibold text-emerald-300">$424K</span> — 9% ahead of South.
          </div>
        </motion.div>
      </div>
    </SlideShell>
  );
}

/* ------------------------- Slide 3: discover ----------------------------- */
function DiscoverSlide() {
  const reduced = useReducedMotion();
  const kpis = [
    { label: "Revenue", to: 24.8 },
    { label: "Profit", to: 18.3 },
  ];
  return (
    <SlideShell title="Discover hidden insights" subtitle="Trends and anomalies surfaced automatically">
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:p-6"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-white/40">{k.label}</div>
            <div className="mt-1.5 text-3xl font-bold text-white lg:text-4xl">
              +<CountUp to={k.to} decimals={1} suffix="%" />
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-sm text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" /> vs. last year
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-4 flex items-center gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-300">
          <ArrowUpRight className="h-5 w-5" />
        </span>
        <div>
          <div className="text-base font-semibold text-white lg:text-lg">Anomaly detected</div>
          <div className="text-sm text-white/60">7 transactions sit far outside the normal range.</div>
        </div>
      </motion.div>
    </SlideShell>
  );
}

/* ------------------------ Slide 4: understand ---------------------------- */
function UnderstandSlide() {
  const reduced = useReducedMotion();
  const rows = [
    { label: "Revenue", value: "$1.48M", delta: "+24.8%" },
    { label: "Profit", value: "$0.62M", delta: "+18.3%" },
    { label: "Customers", value: "1,240", delta: "+12.7%" },
  ];
  return (
    <SlideShell title="Understand your numbers" subtitle="Every metric, moving in the right direction">
      <div className="space-y-3">
        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            initial={reduced ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4"
          >
            <span className="text-base text-white/70 lg:text-lg">{r.label}</span>
            <span className="flex items-center gap-3">
              <span className="text-base font-semibold text-white lg:text-lg">{r.value}</span>
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-300">
                <TrendingUp className="h-3.5 w-3.5" /> {r.delta}
              </span>
            </span>
          </motion.div>
        ))}
      </div>
    </SlideShell>
  );
}

function SlideShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl xl:max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">{title}</h2>
      <p className="mt-2 text-base text-white/50">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

const SLIDES = [VisualizeSlide, AskAiSlide, DiscoverSlide, UnderstandSlide];

export function AuthAnalyticsVisual({ compact = false }: { compact?: boolean }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (reduced) return; // honour reduced-motion: no auto-advance
    const id = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const Slide = SLIDES[index];

  return (
    <div
      className={cn(
        "relative flex w-full flex-col justify-between overflow-hidden",
        compact ? "min-h-[380px] px-6 py-10" : "px-14 py-12",
      )}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {/* ambient brand glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
      </div>

      {/* top: wordmark + workflow */}
      <div className="relative">
        <div className="flex items-center gap-2 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/analytiq-logo.png" alt={APP_NAME} className="h-7 w-auto object-contain" draggable={false} />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-white/40">
          {STEPS.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className={cn(i === 2 && "text-accent-300")}>{s}</span>
              {i < STEPS.length - 1 && <span className="text-white/20">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* middle: carousel */}
      <div className="relative flex flex-1 items-center py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <Slide />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* bottom: dots */}
      <div className="relative flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}

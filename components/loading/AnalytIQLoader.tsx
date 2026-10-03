"use client";

import { LOGO_MARK_SRC } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { box: number; logo: number; radius: number }> = {
  sm: { box: 40, logo: 18, radius: 10 },
  md: { box: 60, logo: 26, radius: 14 },
  lg: { box: 88, logo: 38, radius: 20 },
};

/**
 * Branded diamond/kite loader with the AnalytIQ mark upright inside it.
 * Subtle float + lavender glow pulse (CSS only). Theme-aware via CSS variables.
 */
export function AnalytIQLoader({
  size = "md",
  message,
  className,
}: {
  size?: Size;
  message?: string;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      <div
        className="relative"
        style={{ width: s.box, height: s.box, animation: "aiq-float 2.4s ease-in-out infinite" }}
      >
        {/* diamond frame */}
        <div
          className="absolute inset-0 rotate-45"
          style={{
            borderRadius: s.radius,
            border: "2px solid var(--loader-diamond)",
            background: "var(--loader-bg)",
            boxShadow: "0 0 0 1px var(--loader-glow), 0 10px 28px var(--loader-glow)",
          }}
        />
        {/* pulsing glow */}
        <div
          className="absolute inset-0 rotate-45"
          style={{
            borderRadius: s.radius,
            boxShadow: "0 0 22px 4px var(--loader-glow)",
            animation: "aiq-pulse 1.4s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        {/* upright logo */}
        <div className="absolute inset-0 grid place-items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_MARK_SRC}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{ width: s.logo, height: s.logo, objectFit: "contain" }}
          />
        </div>
      </div>
      {message && <p className="text-sm font-medium text-ink-600">{message}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
}

"use client";

import { Sparkles } from "lucide-react";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/branding";

/**
 * Subtle demo-account card shown near the login form. "Use demo account" only
 * populates the fields — it never auto-submits and there is no frontend login
 * bypass; the backend validates these credentials like any other account.
 */
export function DemoCredentials({
  onUse,
}: {
  onUse: (email: string, password: string) => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-ink-200 bg-ink-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-50 text-brand-600">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Demo account
          </span>
        </div>
        <button
          type="button"
          onClick={() => onUse(DEMO_EMAIL, DEMO_PASSWORD)}
          className="btn-soft px-3 py-1.5 text-xs"
        >
          Use demo account
        </button>
      </div>
      <dl className="mt-3 space-y-1 text-xs text-ink-500">
        <div className="flex items-center gap-2">
          <dt className="w-16 shrink-0 text-ink-400">Email</dt>
          <dd className="font-mono text-ink-700">{DEMO_EMAIL}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="w-16 shrink-0 text-ink-400">Password</dt>
          <dd className="font-mono text-ink-700">{DEMO_PASSWORD}</dd>
        </div>
      </dl>
    </div>
  );
}

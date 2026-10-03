"use client";

import { Check, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "light", label: "Light", desc: "White UI · purple accents", icon: Sun },
  { value: "dark", label: "Dark", desc: "Deep purple · lavender", icon: Moon },
];

/** A small static preview of each theme's palette. */
function Preview({ value }: { value: Theme }) {
  const dark = value === "dark";
  const bg = dark ? "#100E15" : "#F7F6FA";
  const surface = dark ? "#191621" : "#FFFFFF";
  const border = dark ? "#2B2635" : "#E4DFEC";
  const text = dark ? "#C9C3D3" : "#514A5F";
  const primary = dark ? "#9B7AE8" : "#7655C7";
  return (
    <div className="flex h-20 gap-1.5 rounded-lg p-2" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex w-1/3 flex-col gap-1 rounded-md p-1.5" style={{ background: surface, border: `1px solid ${border}` }}>
        <span className="h-1.5 w-full rounded-full" style={{ background: primary }} />
        <span className="h-1 w-3/4 rounded-full" style={{ background: text, opacity: 0.4 }} />
        <span className="h-1 w-2/3 rounded-full" style={{ background: text, opacity: 0.25 }} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex gap-1.5">
          {[0, 1].map((i) => (
            <div key={i} className="flex-1 rounded-md p-1.5" style={{ background: surface, border: `1px solid ${border}` }}>
              <span className="block h-1 w-1/2 rounded-full" style={{ background: text, opacity: 0.35 }} />
              <span className="mt-1 block h-1.5 w-2/3 rounded-full" style={{ background: primary }} />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1 rounded-md p-1.5" style={{ background: surface, border: `1px solid ${border}` }}>
          {[6, 10, 7, 12, 9].map((h, i) => (
            <span key={i} className="w-full rounded-sm" style={{ height: h, background: primary, opacity: 0.55 + i * 0.09 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Theme" className="grid gap-4 sm:grid-cols-2">
      {OPTIONS.map(({ value, label, desc, icon: Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={cn(
              "group relative rounded-2xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
              selected ? "border-brand-500 ring-2 ring-brand-500/30" : "border-ink-200 hover:border-ink-300",
            )}
          >
            <Preview value={value} />
            <div className="mt-3 flex items-center gap-2 px-1">
              <Icon className={cn("h-4 w-4", selected ? "text-brand-600" : "text-ink-400")} />
              <span className="text-sm font-semibold text-ink-900">{label}</span>
              {selected && (
                <span className="ml-auto grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </div>
            <p className="mt-0.5 px-1 text-xs text-ink-500">{desc}</p>
          </button>
        );
      })}
    </div>
  );
}

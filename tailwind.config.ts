import type { Config } from "tailwindcss";

/**
 * AnalytIQ design system. Color tokens resolve to CSS variables (RGB channel
 * triplets) defined in app/globals.css, so the same utility classes render in
 * both Dark (default) and Light themes via the [data-theme] attribute. The
 * `<alpha-value>` placeholder keeps Tailwind opacity modifiers (e.g.
 * `bg-brand-500/15`) working.
 */
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const scale = (fam: string, shades: number[]) =>
  Object.fromEntries(shades.map((s) => [s, v(`--c-${fam}-${s}`)]));

const NEUTRAL = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SEM = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: v("--c-background"),
        surface: v("--c-surface"),
        elevated: v("--c-elevated"),
        hover: v("--c-hover"),
        sidebar: v("--c-sidebar"),

        brand: scale("brand", NEUTRAL),
        accent: scale("accent", [400, 500, 600]),
        ink: scale("ink", NEUTRAL),

        emerald: scale("emerald", SEM),
        amber: scale("amber", SEM),
        red: scale("red", SEM),
        violet: scale("violet", SEM),

        success: v("--c-success"),
        warning: v("--c-warning"),
        error: v("--c-error"),
        info: v("--c-info"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        glow: "var(--shadow-glow)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { DatasetSelector } from "./DatasetSelector";

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;
  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initials || "U"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border border-ink-200 bg-surface p-1.5 shadow-glow"
          >
            <div className="px-3 py-2">
              <div className="truncate text-sm font-semibold text-ink-900">{user.name}</div>
              <div className="truncate text-xs text-ink-500">{user.email}</div>
            </div>
            <div className="my-1 h-px bg-ink-100" />
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push("/settings");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-elevated"
            >
              <Settings className="h-4 w-4" /> Settings
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-elevated"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Slim application top bar: mobile menu + dataset selector + account. */
export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200/70 bg-surface/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* mobile: menu button + compact logo (sidebar is hidden) */}
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-600 transition hover:bg-elevated lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link href="/dashboard" className="lg:hidden" aria-label="AnalytIQ home">
        <LogoMark className="h-8 w-8" />
      </Link>

      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
        <DatasetSelector />
        <UserMenu />
      </div>
    </header>
  );
}

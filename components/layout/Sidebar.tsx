"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Clock, Database, LayoutDashboard, MessagesSquare, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { APP_TAGLINE } from "@/lib/branding";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/assistant", label: "AI Assistant", icon: MessagesSquare },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand-500/[0.14] text-brand-800"
                : "text-ink-400 hover:bg-elevated hover:text-ink-600",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active && "text-brand-600")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop rail + mobile slide-in drawer. Pure navigation chrome. */
export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Desktop rail — only takes the width it needs */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-200 bg-sidebar lg:flex">
        <div className="flex h-16 items-center px-5">
          <Link href="/dashboard" aria-label="AnalytIQ home">
            <Logo />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks />
        </div>
        <div className="border-t border-ink-100 px-5 py-4">
          <p className="text-xs text-ink-400">{APP_TAGLINE}</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80%] flex-col border-r border-ink-200 bg-sidebar lg:hidden"
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Link href="/dashboard" onClick={onClose} aria-label="AnalytIQ home">
                  <Logo />
                </Link>
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-elevated"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <NavLinks onNavigate={onClose} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

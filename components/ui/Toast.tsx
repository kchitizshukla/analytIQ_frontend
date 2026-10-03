"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

type ToastInput = Omit<Toast, "id" | "type"> & { duration?: number };

interface ToastContextValue {
  show: (type: ToastType, title: string, opts?: Partial<ToastInput>) => string;
  success: (title: string, opts?: Partial<ToastInput>) => string;
  error: (title: string, opts?: Partial<ToastInput>) => string;
  warning: (title: string, opts?: Partial<ToastInput>) => string;
  info: (title: string, opts?: Partial<ToastInput>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
};

const ICON_TONE: Record<ToastType, string> = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-brand-500",
};

const DEFAULT_DURATION = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const timer = timers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback(
    (type: ToastType, title: string, opts?: Partial<ToastInput>) => {
      const id = Math.random().toString(36).slice(2);
      const duration = opts?.duration ?? DEFAULT_DURATION;
      setToasts((t) => {
        // de-duplicate identical messages that are still visible
        if (t.some((x) => x.type === type && x.title === title && x.description === opts?.description)) {
          return t;
        }
        return [...t, { id, type, title, description: opts?.description, duration }];
      });
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const t = timers.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (title, opts) => show("success", title, opts),
      error: (title, opts) => show("error", title, opts),
      warning: (title, opts) => show("warning", title, opts),
      info: (title, opts) => show("info", title, opts),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Live region: errors/warnings are assertive, the rest polite. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 py-4 sm:items-end sm:px-6"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-soft",
                  STYLES[t.type],
                )}
                role={t.type === "error" || t.type === "warning" ? "alert" : "status"}
                aria-live={t.type === "error" || t.type === "warning" ? "assertive" : "polite"}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", ICON_TONE[t.type])} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-xs opacity-90">{t.description}</p>}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded-md p-1 opacity-60 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

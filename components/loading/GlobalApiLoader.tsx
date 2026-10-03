"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { subscribeGlobalLoading } from "@/lib/api";
import { AnalytIQLoader } from "./AnalytIQLoader";

const SHOW_DELAY_MS = 180; // don't flash for fast requests
const MIN_VISIBLE_MS = 500; // once shown, keep it long enough to read

/**
 * App-wide branded loading overlay. Visible while one or more requests flagged
 * `{ global: true }` are in flight (after a short delay). Backdrop + loader
 * adapt to the active theme via CSS variables.
 */
export function GlobalApiLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let shownAt = 0;

    const clearShow = () => {
      if (showTimer) {
        clearTimeout(showTimer);
        showTimer = null;
      }
    };

    const unsub = subscribeGlobalLoading((count) => {
      if (count > 0) {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        if (!showTimer) {
          showTimer = setTimeout(() => {
            showTimer = null;
            shownAt = Date.now();
            setVisible(true);
          }, SHOW_DELAY_MS);
        }
      } else {
        clearShow();
        // enforce a minimum on-screen time so it doesn't flicker off
        setVisible((wasVisible) => {
          if (!wasVisible) return false;
          const elapsed = Date.now() - shownAt;
          if (elapsed >= MIN_VISIBLE_MS) return false;
          hideTimer = setTimeout(() => setVisible(false), MIN_VISIBLE_MS - elapsed);
          return true;
        });
      }
    });

    return () => {
      unsub();
      clearShow();
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] grid place-items-center backdrop-blur-sm"
          style={{ background: "var(--overlay)" }}
          role="alertdialog"
          aria-busy="true"
          aria-label="Loading"
        >
          <AnalytIQLoader size="lg" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

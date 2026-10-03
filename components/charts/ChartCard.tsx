"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import type { VisualizationResult } from "@/types";
import { ChartRenderer } from "./ChartRenderer";

export function ChartCard({
  viz,
  subtitle,
  index = 0,
}: {
  viz: VisualizationResult;
  subtitle?: string;
  index?: number;
}) {
  const [full, setFull] = useState(false);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: index * 0.08 }}
        className="card p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{viz.title}</h3>
            {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
          </div>
          <button
            onClick={() => setFull(true)}
            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label="Expand chart"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <ChartRenderer viz={viz} />
      </motion.div>

      {full && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={() => setFull(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card max-h-[90vh] w-full max-w-5xl overflow-auto p-6 xl:max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{viz.title}</h3>
              <button onClick={() => setFull(false)} className="rounded-lg p-1.5 hover:bg-ink-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ChartRenderer viz={viz} height={460} />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

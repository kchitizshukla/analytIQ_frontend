"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileSpreadsheet, FileText, UploadCloud, X } from "lucide-react";
import type { DatasetDetail } from "@/types";
import { uploadDataset, errorMessage } from "@/lib/api";
import { cn, formatBytes } from "@/lib/utils";
import { Spinner } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/Toast";

type Phase = "idle" | "uploading" | "processing" | "done" | "error";

const ACCEPT = ".xlsx,.xls,.csv,.pdf";
const ALLOWED_EXT = ["xlsx", "xls", "csv", "pdf"];
const MAX_BYTES = 50 * 1024 * 1024;

export function UploadDropzone({ onComplete }: { onComplete?: (ds: DatasetDetail) => void }) {
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>("idle");
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<DatasetDetail | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    // Client-side guards for clearer, faster feedback (backend re-validates).
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) {
      const msg = "The selected file type is not supported. Use Excel, CSV, or PDF.";
      setFile(f);
      setError(msg);
      setPhase("error");
      toast.error(msg);
      return;
    }
    if (f.size > MAX_BYTES) {
      const msg = "That file is too large. The maximum size is 50 MB.";
      setFile(f);
      setError(msg);
      setPhase("error");
      toast.error(msg);
      return;
    }
    setFile(f);
    setError("");
    setPhase("uploading");
    try {
      // brief processing state for UX continuity
      const promise = uploadDataset(f);
      setTimeout(() => setPhase((p) => (p === "uploading" ? "processing" : p)), 500);
      const ds = await promise;
      setResult(ds);
      setPhase("done");
      toast.success("Dataset uploaded.", { description: `${ds.name} is ready to explore.` });
      onComplete?.(ds);
    } catch (e) {
      const msg = errorMessage(e, "Unable to process the dataset.");
      setError(msg);
      setPhase("error");
      toast.error("Unable to upload the file.", { description: msg });
    }
  }

  function reset() {
    setPhase("idle");
    setFile(null);
    setError("");
    setResult(null);
  }

  if (phase === "done" && result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <div>
            <h3 className="font-semibold text-ink-900">{result.name}</h3>
            <p className="text-sm text-ink-500">Processed successfully</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Rows", result.row_count.toLocaleString()],
            ["Columns", String(result.column_count)],
            ["File type", result.file_type.toUpperCase()],
            ["Size", formatBytes(result.file_size)],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-ink-50 px-3 py-2.5">
              <div className="label">{l}</div>
              <div className="mt-0.5 text-lg font-bold text-ink-900">{v}</div>
            </div>
          ))}
        </div>
        <button onClick={reset} className="btn-ghost mt-5">Upload another file</button>
      </motion.div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center px-6 py-14 text-center transition",
          drag ? "bg-brand-50" : "bg-surface",
        )}
      >
        {phase === "uploading" || phase === "processing" ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner className="h-8 w-8 text-brand-600" />
            <p className="text-sm font-medium text-ink-700">
              {phase === "uploading" ? "Uploading…" : "Processing dataset…"}
            </p>
            {file && <p className="text-xs text-ink-400">{file.name} · {formatBytes(file.size)}</p>}
          </div>
        ) : (
          <>
            <motion.div
              animate={drag ? { y: -4 } : { y: 0 }}
              className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-accent-400/10 text-brand-600"
            >
              <UploadCloud className="h-7 w-7" />
            </motion.div>
            <h3 className="text-base font-semibold text-ink-900">
              Drop your file here, or{" "}
              <button onClick={() => inputRef.current?.click()} className="text-brand-600 hover:underline">
                browse
              </button>
            </h3>
            <p className="mt-1 text-sm text-ink-500">Excel (.xlsx, .xls), CSV, or PDF — up to 50&nbsp;MB</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-ink-400">
              <span className="flex items-center gap-1.5"><FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Spreadsheets</span>
              <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-red-500" /> PDF tables</span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </>
        )}
      </div>
      {phase === "error" && (
        <div className="flex items-center justify-between gap-3 border-t border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={reset} className="rounded-lg p-1 hover:bg-red-100"><X className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}

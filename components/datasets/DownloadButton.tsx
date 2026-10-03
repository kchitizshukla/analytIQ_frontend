"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { downloadDataset, errorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

/**
 * Downloads a dataset's original uploaded file. `variant` controls styling so
 * the same logic works as a primary header button or a compact icon action.
 */
export function DownloadButton({
  datasetId,
  filename,
  variant = "ghost",
  label = "Download",
  className,
}: {
  datasetId: string;
  filename: string;
  variant?: "primary" | "ghost" | "icon";
  label?: string;
  className?: string;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handle(e: React.MouseEvent) {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await downloadDataset(datasetId, filename);
      toast.success("Download started.", { description: filename });
    } catch (err) {
      toast.error("Unable to download the file.", { description: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const Icon = busy ? Loader2 : Download;
  const icon = <Icon className={cn("h-4 w-4", busy && "animate-spin")} />;

  if (variant === "icon") {
    return (
      <button
        onClick={handle}
        disabled={busy}
        aria-label={`Download ${filename}`}
        title="Download original file"
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-200 bg-surface text-ink-600 transition hover:bg-elevated hover:text-ink-900 disabled:opacity-50",
          className,
        )}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      disabled={busy}
      className={cn(variant === "primary" ? "btn-primary" : "btn-ghost", className)}
    >
      {icon}
      {label}
    </button>
  );
}

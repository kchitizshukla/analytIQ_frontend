"use client";

import Link from "next/link";
import { Database } from "lucide-react";
import { EmptyState } from "./primitives";

export function NoDataset() {
  return (
    <EmptyState
      icon={Database}
      title="Upload a dataset to start analyzing"
      description="No dataset selected yet. Upload an Excel, CSV, or PDF file to explore it here."
      action={
        <Link href="/datasets" className="btn-primary">
          Go to Datasets
        </Link>
      }
    />
  );
}

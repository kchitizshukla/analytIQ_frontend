"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { DatasetSummary } from "@/types";
import { getDatasets, errorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface DatasetContextValue {
  datasets: DatasetSummary[];
  activeId: string | null;
  activeDataset: DatasetSummary | null;
  loading: boolean;
  setActiveId: (id: string | null) => void;
  refresh: () => Promise<void>;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);
const STORAGE_KEY = "analytiq.activeDataset";

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setActiveId = useCallback((id: string | null) => {
    setActiveIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDatasets();
      setDatasets(data);
      setActiveIdState((current) => {
        let stored: string | null = current;
        try {
          stored = current || localStorage.getItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        if (stored && data.some((d) => d.id === stored)) return stored;
        return data[0]?.id ?? null;
      });
    } catch (e) {
      setDatasets([]);
      // Don't nag on the unauthenticated auth landing page.
      if (pathRef.current !== "/") {
        toast.error("Unable to load datasets.", { description: errorMessage(e) });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeDataset = datasets.find((d) => d.id === activeId) ?? null;

  return (
    <DatasetContext.Provider
      value={{ datasets, activeId, activeDataset, loading, setActiveId, refresh }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDatasetContext() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDatasetContext must be used within DatasetProvider");
  return ctx;
}

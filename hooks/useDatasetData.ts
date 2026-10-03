"use client";

import { useEffect, useState } from "react";
import type { DataProfile, DatasetDetail } from "@/types";
import { getDataset, getProfile } from "@/lib/api";

export function useDatasetDetail(datasetId: string | null) {
  const [detail, setDetail] = useState<DatasetDetail | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!datasetId) {
      setDetail(null);
      return;
    }
    let active = true;
    setLoading(true);
    getDataset(datasetId)
      .then((d) => active && setDetail(d))
      .catch(() => active && setDetail(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [datasetId]);
  return { detail, loading };
}

export function useProfile(datasetId: string | null) {
  const [profile, setProfile] = useState<DataProfile | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!datasetId) {
      setProfile(null);
      return;
    }
    let active = true;
    setLoading(true);
    getProfile(datasetId)
      .then((p) => active && setProfile(p))
      .catch(() => active && setProfile(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [datasetId]);
  return { profile, loading };
}

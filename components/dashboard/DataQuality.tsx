"use client";

import type { DataProfile } from "@/types";
import { ProgressBar, TypeBadge } from "@/components/ui/primitives";
import { formatNumber } from "@/lib/utils";

export function DataQuality({ profile }: { profile: DataProfile }) {
  const qualityTone = profile.quality_score >= 90 ? "emerald" : profile.quality_score >= 70 ? "amber" : "red";
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="label">Completeness</div>
          <div className="mt-2 text-2xl font-bold text-ink-900">{profile.completeness}%</div>
          <div className="mt-2"><ProgressBar value={profile.completeness} tone="emerald" /></div>
        </div>
        <div className="card p-5">
          <div className="label">Quality Score</div>
          <div className="mt-2 text-2xl font-bold text-ink-900">{profile.quality_score}</div>
          <div className="mt-2"><ProgressBar value={profile.quality_score} tone={qualityTone} /></div>
        </div>
        <div className="card p-5">
          <div className="label">Issues</div>
          <div className="mt-2 flex gap-4">
            <div>
              <div className="text-xl font-bold text-ink-900">{formatNumber(profile.missing_values)}</div>
              <div className="text-xs text-ink-500">missing</div>
            </div>
            <div>
              <div className="text-xl font-bold text-ink-900">{formatNumber(profile.duplicate_rows)}</div>
              <div className="text-xs text-ink-500">duplicates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-ink-900">Column quality</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50">
              <tr className="text-xs font-semibold text-ink-500">
                <th className="px-5 py-2.5 text-left">Column</th>
                <th className="px-3 py-2.5 text-left">Type</th>
                <th className="px-3 py-2.5 text-right">Unique</th>
                <th className="px-3 py-2.5 text-right">Nulls</th>
                <th className="px-5 py-2.5 text-left">Completeness</th>
              </tr>
            </thead>
            <tbody>
              {profile.columns.map((c) => (
                <tr key={c.name} className="border-t border-ink-100">
                  <td className="px-5 py-2.5 font-medium text-ink-800">{c.name}</td>
                  <td className="px-3 py-2.5"><TypeBadge type={c.type} /></td>
                  <td className="px-3 py-2.5 text-right text-ink-600">{formatNumber(c.unique_count)}</td>
                  <td className="px-3 py-2.5 text-right text-ink-600">
                    {c.null_count} <span className="text-ink-400">({c.null_percentage}%)</span>
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="w-32"><ProgressBar value={100 - c.null_percentage} tone={c.null_percentage > 10 ? "amber" : "emerald"} /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

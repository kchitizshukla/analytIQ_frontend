"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Plus, Sparkles, X } from "lucide-react";
import type { ChartType, ColumnsResponse, DatasetColumn, VisualizationResult } from "@/types";
import { generateVisualization, getColumns, errorMessage } from "@/lib/api";
import { TypeBadge, Spinner, ErrorState, EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/Toast";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { cn, titleCase } from "@/lib/utils";

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "grouped_bar", label: "Grouped Bar" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "pie", label: "Pie" },
  { value: "scatter", label: "Scatter" },
  { value: "histogram", label: "Histogram" },
];
const AGGS = ["sum", "mean", "count", "min", "max", "median"];

const isNumeric = (c: DatasetColumn) => ["numeric", "currency", "percentage"].includes(c.type);

export function VisualizationBuilder({ datasetId }: { datasetId: string }) {
  const toast = useToast();
  const [columns, setColumns] = useState<DatasetColumn[]>([]);
  const [loadingCols, setLoadingCols] = useState(true);

  const [chartType, setChartType] = useState<ChartType>("bar");
  const [dimension, setDimension] = useState<string>("");
  const [measures, setMeasures] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string>("");
  const [aggregation, setAggregation] = useState<string>("sum");

  const [result, setResult] = useState<VisualizationResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadingCols(true);
    setResult(null);
    getColumns(datasetId)
      .then((res: ColumnsResponse) => {
        setColumns(res.columns);
        const firstCat = res.columns.find((c) => !isNumeric(c) && c.type !== "datetime");
        const firstNum = res.columns.find(isNumeric);
        setDimension(firstCat?.name ?? res.columns[0]?.name ?? "");
        setMeasures(firstNum ? [firstNum.name] : []);
        setGroupBy("");
      })
      .catch((e) => {
        setColumns([]);
        toast.error("Unable to load dataset columns.", { description: errorMessage(e) });
      })
      .finally(() => setLoadingCols(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  const numericCols = useMemo(() => columns.filter(isNumeric), [columns]);
  const dimCols = columns;

  function toggleMeasure(name: string) {
    setMeasures((m) => (m.includes(name) ? m.filter((x) => x !== name) : [...m, name]));
  }

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const res = await generateVisualization({
        dataset_id: datasetId,
        chart_type: chartType,
        dimension: dimension || null,
        measures,
        group_by: groupBy || null,
        aggregation: Object.fromEntries(measures.map((m) => [m, aggregation])),
        default_aggregation: aggregation,
        filters: [],
        limit: 100,
        sort: "desc",
      }, { global: true });
      setResult(res);
      if (res.recommended_chart && res.recommended_chart !== chartType) {
        // keep user choice, but surface recommendation via notes
      }
    } catch (e) {
      const msg = errorMessage(e, "Unable to generate this visualization.");
      setError(msg);
      setResult(null);
      toast.error("Unable to generate visualization.", { description: msg });
    } finally {
      setGenerating(false);
    }
  }

  if (loadingCols) {
    return <div className="flex items-center gap-2 text-sm text-ink-500"><Spinner /> Loading columns…</div>;
  }
  if (!columns.length) {
    return <EmptyState title="No columns available" description="Upload a dataset to build visualizations." />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      {/* builder controls */}
      <div className="card space-y-4 p-5">
        <div>
          <label className="label">X-Axis / Dimension</label>
          <select value={dimension} onChange={(e) => setDimension(e.target.value)} className="input mt-1.5">
            <option value="">— none —</option>
            {dimCols.map((c) => (
              <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Measures</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {measures.map((m) => (
              <span key={m} className="chip bg-brand-50 text-brand-700">
                {m}
                <button onClick={() => toggleMeasure(m)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            {!measures.length && <span className="text-xs text-ink-400">Select one or more numeric columns</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {numericCols.filter((c) => !measures.includes(c.name)).map((c) => (
              <button key={c.name} onClick={() => toggleMeasure(c.name)}
                className="chip border border-dashed border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-600">
                <Plus className="h-3 w-3" /> {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Group By</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="input mt-1.5">
            <option value="">— none —</option>
            {columns.filter((c) => !isNumeric(c) && c.name !== dimension).map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Aggregation</label>
            <select value={aggregation} onChange={(e) => setAggregation(e.target.value)} className="input mt-1.5">
              {AGGS.map((a) => <option key={a} value={a}>{titleCase(a)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Chart</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value as ChartType)} className="input mt-1.5">
              {CHART_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={generating} className="btn-primary w-full">
          {generating ? <Spinner /> : <BarChart3 className="h-4 w-4" />}
          Generate Visualization
        </button>
        {error && <ErrorState message={error} />}
      </div>

      {/* result */}
      <div className="card p-5">
        {result ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-ink-900">{result.title}</h3>
              {result.recommended_chart && (
                <span className="chip bg-accent-400/10 text-accent-600">
                  <Sparkles className="h-3 w-3" /> Suggested: {titleCase(result.recommended_chart)}
                </span>
              )}
            </div>
            <ChartRenderer viz={result} height={360} />
            {result.notes?.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-ink-500">
                {result.notes.map((n, i) => <li key={i}>• {n}</li>)}
              </ul>
            )}
          </>
        ) : (
          <div className="flex h-full min-h-[360px] items-center justify-center">
            <EmptyState
              icon={BarChart3}
              title="Build a visualization"
              description="Pick a dimension and measures, then generate a chart from your live data."
            />
          </div>
        )}
      </div>
    </div>
  );
}

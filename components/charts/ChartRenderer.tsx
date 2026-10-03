"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip,
  XAxis, YAxis, ZAxis,
} from "recharts";
import type { VisualizationResult } from "@/types";
import { CHART_COLORS, CHART_THEME_DARK, CHART_THEME_LIGHT, formatNumber, type ChartTheme } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

function axisPropsFor(ct: ChartTheme) {
  return {
    tick: { fontSize: 11, fill: ct.axis },
    tickLine: false,
    axisLine: { stroke: ct.axisLine },
  };
}

function tooltipStyleFor(ct: ChartTheme) {
  return {
    contentStyle: {
      borderRadius: 12,
      border: `1px solid ${ct.tooltipBorder}`,
      backgroundColor: ct.tooltipBg,
      color: ct.tooltipText,
      boxShadow: "0 8px 30px rgba(0,0,0,.25)",
      fontSize: 12,
    },
    labelStyle: { color: ct.tooltipText },
    itemStyle: { color: ct.tooltipText },
  };
}

function toRows(viz: VisualizationResult): Record<string, any>[] {
  return viz.categories.map((cat, i) => {
    const row: Record<string, any> = { __cat: String(cat) };
    viz.series.forEach((s) => {
      row[s.name] = s.data[i] as number;
    });
    return row;
  });
}

export function ChartRenderer({ viz, height = 300 }: { viz: VisualizationResult; height?: number }) {
  const { theme } = useTheme();
  const ct = theme === "light" ? CHART_THEME_LIGHT : CHART_THEME_DARK;
  const axisProps = axisPropsFor(ct);
  const tt = tooltipStyleFor(ct);
  const data = toRows(viz);
  const seriesNames = viz.series.map((s) => s.name);

  if (viz.chart_type === "pie") {
    const pieData = data.map((r) => ({ name: r.__cat, value: r[seriesNames[0]] as number }));
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
               innerRadius={60} outerRadius={100} paddingAngle={2}>
            {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip {...tt} formatter={(v: number) => formatNumber(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (viz.chart_type === "scatter") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis type="number" dataKey="x" name={viz.dimension ?? "x"} {...axisProps} />
          <YAxis type="number" dataKey="y" name={seriesNames[0]} {...axisProps} />
          <ZAxis range={[40, 40]} />
          <Tooltip {...tt} cursor={{ strokeDasharray: "3 3" }} />
          {viz.series.map((s, i) => (
            <Scatter key={s.name} name={s.name}
              data={(s.data as number[][]).map(([x, y]) => ({ x, y }))}
              fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.7} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (viz.chart_type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
          <XAxis dataKey="__cat" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={(v) => formatNumber(v, { compact: true })} />
          <Tooltip {...tt} formatter={(v: number) => formatNumber(v)} />
          {seriesNames.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {seriesNames.map((name, i) => (
            <Line key={name} type="monotone" dataKey={name} strokeWidth={2.5}
              stroke={CHART_COLORS[i % CHART_COLORS.length]} dot={false} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (viz.chart_type === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <defs>
            {seriesNames.map((name, i) => (
              <linearGradient key={name} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
          <XAxis dataKey="__cat" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={(v) => formatNumber(v, { compact: true })} />
          <Tooltip {...tt} formatter={(v: number) => formatNumber(v)} />
          {seriesNames.map((name, i) => (
            <Area key={name} type="monotone" dataKey={name} strokeWidth={2}
              stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={`url(#grad-${i})`} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // bar + grouped_bar + histogram
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
        <XAxis dataKey="__cat" {...axisProps} interval={0} angle={data.length > 7 ? -25 : 0}
          textAnchor={data.length > 7 ? "end" : "middle"} height={data.length > 7 ? 60 : 30} />
        <YAxis {...axisProps} tickFormatter={(v) => formatNumber(v, { compact: true })} />
        <Tooltip {...tt} formatter={(v: number) => formatNumber(v)} cursor={{ fill: ct.cursor }} />
        {seriesNames.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {seriesNames.map((name, i) => (
          <Bar key={name} dataKey={name} radius={[6, 6, 0, 0]} maxBarSize={56}
            fill={CHART_COLORS[i % CHART_COLORS.length]}>
            {seriesNames.length === 1 &&
              data.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

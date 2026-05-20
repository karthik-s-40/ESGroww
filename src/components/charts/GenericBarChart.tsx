"use client";

import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface GenericBarChartProps {
  data: Array<Record<string, any>>;
  dataKeys: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  margin?: { top: number; right: number; left: number; bottom: number };
  valueFormatter?: (value: any) => string;
  compact?: boolean;
  showLegend?: boolean;
}

const CustomTooltip = ({ active, payload, label, valueFormatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg border-2 border-blue-200 shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-800">{payload[0]?.payload?.["name"] || label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-medium" style={{ color: entry.fill }}>
            {entry.name}: <span className="font-bold">{valueFormatter(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GenericBarChart({
  data,
  dataKeys,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  margin = { top: 10, right: 10, left: -10, bottom: 10 },
  valueFormatter = (value) => `${value}%`,
  compact = false,
  showLegend = true,
}: GenericBarChartProps) {
  // Clamp all numeric values to prevent chart overflow
  const safeData = data.map((item) => ({
    ...item,
    [xAxisKey]: (item[xAxisKey] as string).substring(0, 12),
    ...dataKeys.reduce(
      (acc, { key }) => ({
        ...acc,
        [key]: Math.min(100, Math.max(0, item[key] || 0)),
      }),
      {}
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height={compact ? 210 : 250}>
      <RechartsBarChart data={safeData} margin={margin}>
        <defs>
          {dataKeys.map(({ color }, idx) => (
            <linearGradient key={`gradient-${idx}`} id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.9} />
              <stop offset="95%" stopColor={color} stopOpacity={0.5} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          stroke="#9ca3af"
          tick={{ fontSize: compact ? 11 : 12, fontWeight: 500, fill: "#6b7280" }}
          interval={0}
          axisLine={{ strokeWidth: 1.5 }}
        />
        <YAxis
          stroke="#9ca3af"
          tick={{ fontSize: compact ? 11 : 12, fill: "#6b7280" }}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
          axisLine={{ strokeWidth: 1.5 }}
        />
        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
        {showLegend ? (
          <Legend
            wrapperStyle={{ fontSize: compact ? "12px" : "13px", fontWeight: 500, paddingTop: "15px" }}
            iconType="square"
            height={30}
          />
        ) : null}
        {dataKeys.map(({ key, label, color }, idx) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`url(#color-${idx})`}
            name={label}
            radius={[8, 8, 0, 0]}
            animationDuration={800}
            isAnimationActive={true}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

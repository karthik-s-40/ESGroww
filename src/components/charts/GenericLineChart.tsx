"use client";

import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GenericLineChartProps {
  data: Array<Record<string, any>>;
  dataKeys: Array<{
    key: string;
    label: string;
    color: string;
    strokeWidth?: number;
  }>;
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  margin?: { top: number; right: number; left: number; bottom: number };
  valueFormatter?: (value: any) => string;
  domain?: [number, number];
}

const CustomLineTooltip = ({ active, payload, label, valueFormatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg border-2 border-blue-200 shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-800">{payload[0]?.payload?.["name"] || label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{valueFormatter(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GenericLineChart({
  data,
  dataKeys,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  margin = { top: 10, right: 10, left: -10, bottom: 10 },
  valueFormatter = (value) => `${value}%`,
  domain,
}: GenericLineChartProps) {
  // Clamp all numeric values
  const safeData = data.map((item) => ({
    ...item,
    [xAxisKey]: (item[xAxisKey] as string).substring(0, 10),
    ...dataKeys.reduce(
      (acc, { key }) => ({
        ...acc,
        [key]: Math.min(100, Math.max(0, item[key] || 0)),
      }),
      {}
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsLineChart data={safeData} margin={margin}>
        <defs>
          {dataKeys.map(({ color }, idx) => (
            <linearGradient key={`line-gradient-${idx}`} id={`lineGradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          stroke="#9ca3af"
          tick={{ fontSize: 12, fontWeight: 500, fill: "#6b7280" }}
          interval={0}
          axisLine={{ strokeWidth: 1.5 }}
        />
        <YAxis
          stroke="#9ca3af"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          domain={domain || [0, 100]}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
          axisLine={{ strokeWidth: 1.5 }}
        />
        <Tooltip content={<CustomLineTooltip valueFormatter={valueFormatter} />} cursor={{ stroke: "#3b82f6", strokeWidth: 2 }} />
        <Legend
          wrapperStyle={{ fontSize: "13px", fontWeight: 500, paddingTop: "15px" }}
          iconType="line"
          height={30}
        />
        {dataKeys.map(({ key, label, color, strokeWidth = 2.5 }) => (
          <Line
            key={key}
            type="natural"
            dataKey={key}
            stroke={color}
            name={label}
            dot={{ fill: color, r: 4, strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 6, fill: color }}
            strokeWidth={strokeWidth}
            animationDuration={800}
            animationEasing="ease-in-out"
            isAnimationActive={true}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

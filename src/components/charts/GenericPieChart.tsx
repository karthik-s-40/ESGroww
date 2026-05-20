"use client";

import React from "react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface GenericPieChartDataItem {
  name: string;
  value: number;
  fill: string;
}

interface GenericPieChartProps {
  data: GenericPieChartDataItem[];
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  valueFormatter?: (value: number) => string;
}

const CustomPieTooltip = ({ active, payload, valueFormatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg border-2 border-blue-200 shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-800">{payload[0]?.name}</p>
        <p className="text-sm font-bold" style={{ color: payload[0]?.fill }}>
          {valueFormatter(payload[0]?.value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function GenericPieChart({
  data,
  innerRadius = 50,
  outerRadius = 80,
  paddingAngle = 2,
  valueFormatter = (value) => `${value}%`,
}: GenericPieChartProps) {
  // Clamp all values to prevent overflow
  const safeData = data
    .map((item) => ({
      ...item,
      value: Math.min(100, Math.max(0, item.value || 0)),
    }))
    .filter((item) => item.value > 0);

  // If all values are zero, show placeholder
  const chartData = safeData.length > 0 ? safeData : [{ name: "No Data", value: 100, fill: "#e5e7eb" }];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsPieChart>
        <defs>
          {chartData.map((entry, idx) => (
            <filter key={`filter-${idx}`} id={`shadow-${idx}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          ))}
        </defs>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          dataKey="value"
          animationDuration={800}
          animationEasing="ease-out"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              opacity={0.9}
              filter={`url(#shadow-${index})`}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip valueFormatter={valueFormatter} />} />
        <Legend
          wrapperStyle={{ fontSize: "13px", fontWeight: 500, paddingTop: "20px" }}
          iconType="circle"
          verticalAlign="bottom"
          height={30}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

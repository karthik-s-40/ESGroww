"use client";

import React from "react";
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GenericSpiderChartProps {
  data: Array<Record<string, any>>;
  dataKeys: Array<{
    key: string;
    label: string;
    color: string;
    fillOpacity?: number;
  }>;
  angleAxisKey: string;
  radiusAxisLabel?: string;
  valueFormatter?: (value: number) => string;
  compact?: boolean;
  showScaleReference?: boolean;
}

const CustomSpiderTooltip = ({ active, payload, valueFormatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border-2 border-indigo-400 shadow-2xl p-5 backdrop-blur-sm">
        <p className="text-base font-bold text-white mb-3">{payload[0]?.payload?.name}</p>
        <div className="space-y-2.5 border-t border-gray-700 pt-3">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-3 h-3 rounded-full shadow-lg" 
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span className="text-sm font-medium text-gray-100">{entry.name}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: entry.fill }}>
                {valueFormatter(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function GenericSpiderChart({
  data,
  dataKeys,
  angleAxisKey,
  radiusAxisLabel,
  valueFormatter = (value) => `${value.toFixed(0)}`,
  compact = false,
  showScaleReference = true,
}: GenericSpiderChartProps) {
  const chartHeight = compact ? 320 : 540;
  const chartMargin = compact
    ? { top: 8, right: 12, bottom: 8, left: 12 }
    : { top: 70, right: 90, bottom: 95, left: 120 };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RechartsRadarChart data={data} margin={chartMargin}>
          <defs>
            {/* Gradients for better visual depth */}
            {dataKeys.map(({ color }, idx) => (
              <linearGradient
                key={`spider-gradient-${idx}`}
                id={`spiderGradient-${idx}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                <stop offset="50%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0.65} />
              </linearGradient>
            ))}
            
            {/* Glow filter for dots */}
            <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Shadow filter */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Clean Background Grid */}
          <PolarGrid
            stroke="#e5e7eb"
            strokeDasharray="0"
            strokeOpacity={0.25}
            radialLines={false}
          />

          {/* Metric Labels - Prominent and Clear */}
          <PolarAngleAxis
            dataKey={angleAxisKey}
            tick={{
              fontSize: compact ? 10 : 15,
              fontWeight: 700,
              fill: "#1f2937",
              textAnchor: "middle",
            }}
            tickLine={{ stroke: "#d1d5db", strokeOpacity: 0.3 }}
            axisLine={{ stroke: "#d1d5db", strokeOpacity: 0.2 }}
          />

          {/* Radius Axis - Score Scale (0-100) */}
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={{ stroke: "#d1d5db", strokeOpacity: 0.2 }}
            label={
              radiusAxisLabel
                ? { value: radiusAxisLabel, angle: 90, position: "insideBottomRight", offset: 20 }
                : undefined
            }
          />

          {/* Premium Tooltip */}
          <Tooltip
            content={<CustomSpiderTooltip valueFormatter={valueFormatter} />}
            cursor={{ stroke: "#6366f1", strokeWidth: 3, strokeDasharray: "8 4", opacity: 0.6 }}
            wrapperStyle={{ outline: "none" }}
          />

          {/* Radar Lines - Your Performance is Primary */}
          {dataKeys.map(({ key, label, color, fillOpacity = 0.6 }, idx) => (
            <Radar
              key={key}
              name={label}
              dataKey={key}
              stroke={color}
              fill={`url(#spiderGradient-${idx})`}
              fillOpacity={idx === 0 ? 0.5 : 0.25}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-in-out"
              strokeWidth={idx === 0 ? 3.5 : 2.5}
              dot={{
                r: idx === 0 ? 6.5 : 4.5,
                fill: color,
                strokeWidth: 2.5,
                stroke: "#fff",
                filter: "url(#glowFilter)",
              }}
              activeDot={{
                r: idx === 0 ? 8.5 : 6.5,
                fill: color,
                strokeWidth: 2.5,
                stroke: "#fff",
                filter: "url(#glowFilter)",
              }}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>

      {showScaleReference ? (
        /* Performance Scale Reference - Enhanced Design */
        <div className={compact ? "mt-5 grid grid-cols-2 gap-3" : "mt-8 grid grid-cols-4 gap-4"}>
        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-xl p-4 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-black text-green-700 uppercase tracking-widest">Excellent</p>
          <p className="text-2xl font-black text-green-900 mt-2">80-100</p>
          <p className="text-xs text-green-700 mt-2 font-semibold">Outstanding</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Good</p>
          <p className="text-2xl font-black text-blue-900 mt-2">60-79</p>
          <p className="text-xs text-blue-700 mt-2 font-semibold">Strong</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Fair</p>
          <p className="text-2xl font-black text-amber-900 mt-2">40-59</p>
          <p className="text-xs text-amber-700 mt-2 font-semibold">Moderate</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-black text-red-700 uppercase tracking-widest">Needs Work</p>
          <p className="text-2xl font-black text-red-900 mt-2">0-39</p>
          <p className="text-xs text-red-700 mt-2 font-semibold">Urgent</p>
        </div>
        </div>
      ) : null}
    </div>
  );
}

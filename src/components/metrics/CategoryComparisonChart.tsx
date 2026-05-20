"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CategoryComparisonChartProps {
  data: Array<{
    name: string;
    score: number;
    completeness: number;
  }>;
}

export default function CategoryComparisonChart({
  data,
}: CategoryComparisonChartProps) {
  // Clamp all values to 0-100 to prevent chart overflow
  const safeData = data.map((item) => ({
    name: item.name.substring(0, 12), // Truncate long category names
    score: Math.min(100, Math.max(0, item.score || 0)),
    completeness: Math.min(100, Math.max(0, item.completeness || 0)),
  }));

  return (
    <div className="overflow-hidden">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Category Performance
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={safeData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} interval={0} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            formatter={(value) => `${value}%`}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Bar dataKey="score" fill="#10b981" radius={[2, 2, 0, 0]} />
          <Bar dataKey="completeness" fill="#f59e0b" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

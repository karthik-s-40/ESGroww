"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OverallMetricsChartProps {
  categoryScores: {
    energy?: number;
    water?: number;
    waste?: number;
    governance?: number;
  };
}

export default function OverallMetricsChart({
  categoryScores,
}: OverallMetricsChartProps) {
  // Build pie chart data from category scores
  const categories = [
    { name: "Energy", value: Math.min(100, Math.max(0, categoryScores.energy || 0)), fill: "#f59e0b" },
    { name: "Water", value: Math.min(100, Math.max(0, categoryScores.water || 0)), fill: "#3b82f6" },
    { name: "Waste", value: Math.min(100, Math.max(0, categoryScores.waste || 0)), fill: "#8b5cf6" },
    { name: "Governance", value: Math.min(100, Math.max(0, categoryScores.governance || 0)), fill: "#10b981" },
  ];

  // Filter out zero values for cleaner pie
  const data = categories.filter((c) => c.value > 0);
  
  // If all values are zero, show a placeholder
  if (data.length === 0) {
    data.push({ name: "No Data", value: 100, fill: "#e2e8f0" });
  }

  return (
    <div className="overflow-hidden">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        ESG Category Scores
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

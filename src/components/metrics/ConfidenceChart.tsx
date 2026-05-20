"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ConfidenceChartProps {
  data: Array<{
    category: string;
    confidence: number;
  }>;
}

export default function ConfidenceChart({ data }: ConfidenceChartProps) {
  // Clamp confidence values to 0-100 to prevent chart overflow
  const chartData = data.map((item) => ({
    category: item.category.substring(0, 10), // Truncate long category names
    confidence: Math.min(100, Math.max(0, Math.round((item.confidence || 0) * 100))),
  }));

  return (
    <div className="overflow-hidden">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Confidence by Category
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} interval={0} />
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
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="#3b82f6"
            dot={{ fill: "#3b82f6", r: 3 }}
            activeDot={{ r: 5 }}
            strokeWidth={1.5}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

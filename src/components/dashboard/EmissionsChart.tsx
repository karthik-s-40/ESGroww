"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EmissionsData {
  scope2Emissions: string;
  dieselEmissions: string;
  transportEmissions: string;
  refrigerantEmissions: string;
  totalEmissions: string;
}

interface Props {
  emissions: EmissionsData;
}

export function EmissionsChart({ emissions }: Props) {
  const data = [
    {
      name: "Scope 2",
      value: parseFloat(emissions.scope2Emissions),
      color: "#10b981",
    },
    {
      name: "Diesel",
      value: parseFloat(emissions.dieselEmissions),
      color: "#0ea5e9",
    },
    {
      name: "Transport",
      value: parseFloat(emissions.transportEmissions),
      color: "#f59e0b",
    },
    {
      name: "Refrigerants",
      value: parseFloat(emissions.refrigerantEmissions),
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-5">
        Carbon Emissions Breakdown
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "CO₂e (kg)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              formatter={(value) => [`${Number(value ?? 0).toFixed(2)} kg CO₂e`, ""]}
              labelStyle={{ color: "#374151" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey="value"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        Total Emissions: {emissions.totalEmissions} kg CO₂e
      </div>
    </div>
  );
}
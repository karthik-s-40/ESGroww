"use client";

import { Card, CardContent } from "@/components/ui/card";

export function KeyPerformanceIndicators() {
  const kpis = [
    { title: "Energy Intensity", val: "15.09", unit: "kWh/sqft/year", bench: "16 - 22", color: "text-emerald-600" },
    { title: "Water Intensity", val: "0.24", unit: "KL/sqft/year", bench: "0.20 - 0.35", color: "text-emerald-600" },
    { title: "Renewable Energy", val: "0%", unit: "Of Total Energy", bench: ">10%", color: "text-slate-900" },
    { title: "Waste Recycling", val: "58.3%", unit: "Recycling Rate", bench: ">60%", color: "text-slate-900" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">4. Key Performance Indicators</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-1 text-center">
               <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
               <div className="flex items-baseline justify-center gap-1">
                 <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.val}</p>
               </div>
               <p className="text-xs text-slate-500">{kpi.unit}</p>
               <div className="pt-2 mt-2 border-t text-xs text-slate-500">
                 Benchmark: {kpi.bench}
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RegulatoryReadiness() {
  const regs = [
    { name: "Biomedical Waste Comp.", read: "Strong", risk: "Low", riskColor: "text-emerald-600" },
    { name: "ESG Disclosure Prep.", read: "Moderate", risk: "Medium", riskColor: "text-amber-600" },
    { name: "Energy Monitoring", read: "Moderate", risk: "Medium", riskColor: "text-amber-600" },
    { name: "Water Reuse Expectations", read: "Foundational", risk: "Medium", riskColor: "text-amber-600" }
  ];

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2 border-b mb-3">
        <CardTitle className="text-lg flex justify-between items-center text-slate-900">
          Regulatory Readiness
          <span className="text-sm text-emerald-600 font-normal cursor-pointer hover:underline">View Details &gt;</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {regs.map((reg, i) => (
            <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
              <div className="font-medium text-slate-900 flex-1">{reg.name}</div>
              <div className="w-24 text-slate-600">{reg.read}</div>
              <div className={`w-20 text-right font-medium ${reg.riskColor}`}>{reg.risk}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

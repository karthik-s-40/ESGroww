"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function StrengthsWidget() {
  const strengths = ["Strong waste segregation & tracking", "Full year water monitoring", "Healthy power factor", "Structured utility tracking"];
  return (
    <Card className="border-slate-200 bg-emerald-50/50">
      <CardHeader className="pb-3 border-b border-emerald-100">
        <CardTitle className="text-emerald-900 text-base">Strengths</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {strengths.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CriticalGapsWidget() {
  const gaps = ["No renewable energy integration", "No centralized monitoring", "Indoor air quality not monitored", "Scope 3 tracking incomplete"];
  return (
    <Card className="border-slate-200 bg-amber-50/50">
      <CardHeader className="pb-3 border-b border-amber-100">
        <CardTitle className="text-amber-900 text-base">Critical Gaps</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {gaps.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ActionRoadmapWidget() {
  const actions = [
    { time: "Immediate", action: "Appoint sustainability governance owner" },
    { time: "0-3 Months", action: "Increase LED coverage to >80%" },
    { time: "3-6 Months", action: "Implement centralized energy monitoring" },
    { time: "6-12 Months", action: "Install rooftop solar system" }
  ];
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-slate-900 text-base flex justify-between">
          Priority Action Roadmap
          <span className="text-xs text-emerald-600 font-normal cursor-pointer hover:underline">View Roadmap</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {actions.map((item, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <div className="w-20 shrink-0 text-slate-500 font-medium text-xs pt-0.5">{item.time}</div>
            <div className="text-slate-700">{item.action}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

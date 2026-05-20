"use client";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function ValidationResults() {
  const items = [
    { label: "Negative Values", status: "Passed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { label: "Missing Months", status: "Partial", sub: "3 Categories", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "Abnormal Spikes", status: "Passed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { label: "Duplicate Entries", status: "Passed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { label: "Unit Consistency", status: "Passed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">2. Validation Results</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item, i) => (
          <div key={i} className={`p-4 border rounded-lg ${item.bg} ${item.border} flex items-center gap-3`}>
            <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
            <div>
              <p className="text-xs font-medium text-slate-600">{item.label}</p>
              <p className={`text-sm font-semibold ${item.color}`}>
                {item.status}
                {item.sub && <span className="block text-[10px] bg-amber-100 text-amber-800 px-1 rounded inline-block ml-1">{item.sub}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

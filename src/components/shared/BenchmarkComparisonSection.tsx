"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface BenchmarkRange {
  min?: number;
  max?: number;
  label: string;
  color: "green" | "amber" | "orange";
}

interface BenchmarkComparisonSectionProps {
  title: string;
  currentValue: number | null;
  unit: string;
  icon?: LucideIcon;
  benchmarkRanges: BenchmarkRange[];
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const colorMap = {
  green: { bg: "bg-green-50", text: "text-green-700", label: "text-green-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", label: "text-amber-700" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", label: "text-orange-700" },
};

export default function BenchmarkComparisonSection({
  title,
  currentValue,
  unit,
  icon: Icon,
  benchmarkRanges,
  description,
  children,
  className = "",
}: BenchmarkComparisonSectionProps) {
  return (
    <div className={`border rounded-lg p-4 bg-white shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-5 h-5" />}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Current Value Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded p-3 mb-4">
        <div className="text-sm text-gray-600">Current Value</div>
        <div className="text-3xl font-bold text-gray-900">
          {currentValue !== null ? currentValue.toFixed(2) : "N/A"}
        </div>
        <div className="text-xs text-gray-700 mt-1">{unit}</div>
      </div>

      {/* Benchmark Ranges */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-semibold text-gray-700 uppercase">Benchmark Ranges</div>
        <div className="space-y-1">
          {benchmarkRanges.map((range, idx) => {
            const colors = colorMap[range.color];
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${colors.label}`}>
                  {range.color === "green" && "✓ "}
                  {range.color === "amber" && "~ "}
                  {range.color === "orange" && "⚠ "}
                  {range.label}
                </span>
                <span className={colors.label}>
                  {range.min !== undefined && range.max !== undefined
                    ? `${range.min} - ${range.max}`
                    : range.min !== undefined
                      ? `≥ ${range.min}`
                      : range.max !== undefined
                        ? `≤ ${range.max}`
                        : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Description */}
      {description && <p className="text-xs text-gray-600 mb-4">{description}</p>}

      {/* Custom children (charts, etc.) */}
      {children}
    </div>
  );
}

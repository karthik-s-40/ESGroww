"use client";

import React from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  height?: number;
}

export default function ChartCard({
  title,
  description,
  children,
  className = "",
  height = 200,
}: ChartCardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg p-3 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
        {description && <p className="text-xs text-gray-600 mt-0.5">{description}</p>}
      </div>

      {/* Chart container */}
      <div style={{ height: `${height}px` }} className="w-full">
        {children}
      </div>
    </div>
  );
}

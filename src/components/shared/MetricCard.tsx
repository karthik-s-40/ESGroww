"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string | null;
  unit?: string;
  icon?: LucideIcon;
  status?: "good" | "acceptable" | "warning" | "danger" | "neutral";
  statusLabel?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const statusStyles = {
  good: {
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-700",
    badge: "bg-green-200 text-green-900",
  },
  acceptable: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    badge: "bg-amber-200 text-amber-900",
  },
  warning: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    badge: "bg-orange-200 text-orange-900",
  },
  danger: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    badge: "bg-red-200 text-red-900",
  },
  neutral: {
    bg: "bg-slate-50",
    border: "border-slate-300",
    text: "text-slate-700",
    badge: "bg-slate-200 text-slate-900",
  },
};

export default function MetricCard({
  title,
  value,
  unit = "",
  icon: Icon,
  status = "neutral",
  statusLabel,
  description,
  children,
  className = "",
}: MetricCardProps) {
  const styles = statusStyles[status];

  return (
    <div
      className={`border rounded-lg p-3 shadow-sm ${styles.bg} ${styles.border} ${className}`}
    >
      {/* Header with title and icon */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className={`w-5 h-5 flex-shrink-0 ${styles.text}`} />}
          <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
        </div>
        {statusLabel && (
          <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap flex-shrink-0 ${styles.badge}`}>
            {statusLabel}
          </span>
        )}
      </div>

      {/* Value display */}
      <div className="mb-2">
        <div className={`text-2xl font-bold ${styles.text}`}>
          {value !== null ? value : "N/A"}
          {unit && <span className="text-sm ml-1">{unit}</span>}
        </div>
        {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
      </div>

      {/* Custom children content */}
      {children && <div className="text-xs space-y-1">{children}</div>}
    </div>
  );
}

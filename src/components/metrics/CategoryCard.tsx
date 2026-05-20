"use client";

import { getReportForMonths, getValidationStatus, truncateText, clampPercentage } from "@/lib/metricsUtils";

interface CategoryCardProps {
  title: string;
  score: number | null | undefined;
  monthsUploaded: number | undefined | null;
  confidence: number;
  confidenceMonths: number | undefined;
  message?: string;
}

export default function CategoryCard({
  title,
  score,
  monthsUploaded,
  confidence,
  confidenceMonths,
  message,
}: CategoryCardProps) {
  const validation = getValidationStatus(monthsUploaded);
  const report = getReportForMonths(monthsUploaded);

  const safeScore = clampPercentage(score);
  const safeConfidence = clampPercentage(confidence * 100);
  const completenessWidth = validation.completeness.replace("%", "");
  const clampedWidth = Math.min(100, Math.max(0, parseFloat(completenessWidth)));

  return (
    <article className={`rounded-lg border p-3 shadow-sm overflow-hidden ${validation.color}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 min-w-0 gap-2">
        <h3 className="text-xs font-semibold truncate text-slate-900">{title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${validation.badgeColor}`}>
          {truncateText(validation.status, 12)}
        </span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        {/* Completeness bar */}
        <div>
          <div className="flex items-center justify-between mb-0.5 text-slate-600">
            <span>Completeness</span>
            <span className="font-semibold tabular-nums">{validation.completeness}</span>
          </div>
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${clampedWidth}%` }}
              className="h-1 rounded-full bg-emerald-500 transition-all duration-500"
            />
          </div>
        </div>

        {/* Score + Confidence row */}
        <div className="flex items-center justify-between pt-0.5 text-slate-600">
          <span>Score</span>
          <span className="font-semibold tabular-nums text-slate-800">{safeScore}%</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span>Confidence</span>
          <span className="font-semibold tabular-nums text-slate-700">
            {Math.round(safeConfidence)}%{confidenceMonths != null ? ` · ${confidenceMonths} mo` : ""}
          </span>
        </div>

        {/* Validation note */}
        <p className="pt-1.5 border-t border-slate-200/60 text-[10px] leading-snug text-slate-500 line-clamp-2">
          {truncateText(validation.meaning, 70)}
        </p>

        {/* Report message */}
        {report.message && (
          <p className="text-[10px] leading-snug text-slate-500 line-clamp-2">
            {truncateText(report.message, 70)}
          </p>
        )}

        {/* Custom message */}
        {message && (
          <p className="text-[10px] leading-snug text-slate-400 line-clamp-1">
            {truncateText(message, 60)}
          </p>
        )}
      </div>
    </article>
  );
}

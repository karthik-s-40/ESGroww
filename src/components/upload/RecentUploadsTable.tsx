"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, FileSpreadsheet, MoreVertical } from "lucide-react";

import { getRecentUploads } from "@/actions/uploadProgress.actions";
import { cn } from "@/lib/utils";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type UploadRow = {
  id: string;
  fileUrl: string;
  sourceFile?: string | null;
  category: string;
  month: string;
  year: number;
  createdAt: Date | string;
  status?: string;
  rowCount?: number | null;
  version?: number | null;
  uploadBatch?: {
    batchVersion: number;
    resolutionStrategy: string | null;
    isSuperseded: boolean;
    distinctMonthCount: number | null;
    rowCount: number | null;
  } | null;
};

function getFileName(fileUrl: string, sourceFile?: string | null): string {
  const raw = sourceFile || fileUrl;
  try {
    const parts = raw.split(/[/\\]/);
    return parts[parts.length - 1] || raw;
  } catch {
    return raw;
  }
}

function StatusBadge({ status, compact }: { status: string; compact?: boolean }) {
  const pill = compact ? "gap-1 px-1.5 py-0 text-[10px]" : "gap-1.5 px-2.5 py-1 text-xs";
  const icon = compact ? "size-2.5" : "h-3 w-3";

  if (status === "error") {
    return (
      <span
        role="status"
        aria-label="Error"
        className={cn(
          "inline-flex items-center rounded-full border border-rose-100 bg-rose-50 font-medium text-rose-700",
          pill
        )}
      >
        <AlertCircle className={icon} aria-hidden />
        {compact ? <span aria-hidden>Err</span> : <span>Error</span>}
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span
        role="status"
        aria-label="Processing"
        className={cn(
          "inline-flex items-center rounded-full border border-amber-100 bg-amber-50 font-medium text-amber-700",
          pill
        )}
      >
        <Clock className={icon} aria-hidden />
        {compact ? <span aria-hidden>…</span> : <span>Processing</span>}
      </span>
    );
  }
  return (
    <span
      role="status"
      aria-label="Uploaded"
      className={cn(
        "inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 font-medium text-emerald-700",
        pill
      )}
    >
      <CheckCircle2 className={icon} aria-hidden />
      {compact ? <span aria-hidden className="text-[9px] font-semibold">OK</span> : <span>Uploaded</span>}
    </span>
  );
}

type Props = {
  limit?: number;
  refreshKey?: number;
  showViewAllLink?: boolean;
  showTitle?: boolean;
  /** Dense table + header for dashboard rail */
  compact?: boolean;
  /** Optional max-height cap on scroll body (compact mode), e.g. max-h-40 */
  maxBodyHeightClass?: string;
};

export default function RecentUploadsTable({
  limit = 10,
  refreshKey = 0,
  showViewAllLink = false,
  showTitle = true,
  compact = false,
  maxBodyHeightClass,
}: Props) {
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadUploads() {
      setLoading(true);
      const data = await getRecentUploads(limit);
      if (!cancelled) {
        setRows((data as UploadRow[]) || []);
        setLoading(false);
      }
    }
    loadUploads();
    return () => {
      cancelled = true;
    };
  }, [limit, refreshKey]);

  const monthLabel = (month: number | string, year: number | string) => {
    if (typeof month === "string" && Number.isNaN(Number(month))) {
      return `${month} ${year}`;
    }
    const m = Number(month);
    const name = MONTH_NAMES[m - 1] ?? `M${month}`;
    return `${name} ${year}`;
  };

  const tableWrap = (
    <table
      className={cn(
        "w-full text-left",
        compact ? "table-fixed text-[10px] leading-tight" : "text-sm"
      )}
    >
      <thead
        className={cn(
          "sticky top-0 z-10 border-b border-slate-200 bg-slate-50 font-medium text-slate-500",
          compact ? "text-[9px] uppercase tracking-wide" : "text-xs"
        )}
      >
        <tr>
          <th className={cn(compact ? "w-[32%] px-2 py-1.5" : "px-5 py-3")}>File</th>
          <th className={cn(compact ? "w-[18%] px-1 py-1.5" : "hidden px-5 py-3 sm:table-cell")}>Cat.</th>
          <th className={cn(compact ? "w-[16%] px-1 py-1.5" : "hidden px-5 py-3 md:table-cell")}>Period</th>
          <th className={cn(compact ? "w-[18%] px-1 py-1.5" : "hidden px-5 py-3 lg:table-cell")}>Uploaded</th>
          <th className={cn(compact ? "w-[12%] px-1 py-1.5" : "px-5 py-3")}>St.</th>
          <th className={cn(compact ? "w-8 px-0.5 py-1.5" : "w-12 px-3 py-3 text-right")} aria-label="Actions">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 text-slate-700">
        {loading ? (
          <tr>
            <td colSpan={6} className={cn("text-center text-slate-400", compact ? "px-2 py-6 text-[10px]" : "px-5 py-10")}>
              <div className="flex items-center justify-center gap-2">
                <Clock className={cn(compact ? "size-3 animate-pulse" : "h-4 w-4 animate-pulse")} /> Loading…
              </div>
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={6} className={cn("text-center text-slate-400", compact ? "px-2 py-6 text-[10px]" : "px-5 py-10")}>
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className={cn(compact ? "size-6 text-slate-300" : "h-8 w-8 text-slate-300")} />
                <span>No uploads yet.</span>
              </div>
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-slate-50/80">
              <td className={cn(compact ? "px-2 py-1" : "px-5 py-3.5")}>
                <div className="flex min-w-0 items-center gap-1">
                  <FileSpreadsheet
                    className={cn("shrink-0 text-emerald-500", compact ? "size-3" : "h-4 w-4")}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "truncate font-medium text-slate-800",
                      compact ? "text-[10px]" : "max-w-[200px]"
                    )}
                    title={getFileName(row.fileUrl, row.sourceFile)}
                  >
                    {getFileName(row.fileUrl, row.sourceFile)}
                  </span>
                </div>
              </td>
              <td
                className={cn(
                  "truncate capitalize text-slate-700",
                  compact ? "px-1 py-1" : "hidden px-5 py-3.5 sm:table-cell"
                )}
                title={row.category}
              >
                {compact ? row.category.slice(0, 4) : row.category}
              </td>
              <td
                className={cn(
                  "truncate text-slate-600",
                  compact ? "px-1 py-1" : "hidden px-5 py-3.5 md:table-cell"
                )}
              >
                {row.uploadBatch?.distinctMonthCount != null ? (
                  <span title="Distinct months in batch">
                    Batch {row.uploadBatch.batchVersion} · {row.uploadBatch.distinctMonthCount} mo
                  </span>
                ) : (
                  monthLabel(row.month, row.year)
                )}
              </td>
              <td
                className={cn(
                  "truncate text-slate-500",
                  compact ? "px-1 py-1" : "hidden px-5 py-3.5 lg:table-cell"
                )}
              >
                {new Date(row.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })}
              </td>
              <td className={cn(compact ? "px-1 py-1" : "px-5 py-3.5")}>
                <StatusBadge status={row.status ?? "uploaded"} compact={compact} />
              </td>
              <td className={cn("relative text-right", compact ? "px-0.5 py-1" : "px-2 py-3.5")}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700",
                    compact ? "size-6" : "h-8 w-8"
                  )}
                  aria-expanded={menuId === row.id}
                  aria-haspopup="true"
                  aria-label="Row actions"
                  onClick={() => setMenuId((id) => (id === row.id ? null : row.id))}
                >
                  <MoreVertical className={compact ? "size-3.5" : "h-4 w-4"} />
                </button>
                {menuId === row.id && (
                  <div
                    className={cn(
                      "absolute right-0 z-20 mt-1 rounded-lg border border-slate-200 bg-white p-2 text-left shadow-lg",
                      compact ? "w-48 text-[10px]" : "right-2 top-full w-56 p-3 text-xs"
                    )}
                  >
                    <p className="font-semibold text-slate-800">Upload record</p>
                    <dl className="mt-2 space-y-1 text-slate-600">
                      <div>
                        <dt className="text-slate-400">ID</dt>
                        <dd className="break-all font-mono text-[10px] text-slate-700">{row.id}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">File</dt>
                        <dd className="break-all">{getFileName(row.fileUrl, row.sourceFile)}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Category</dt>
                        <dd className="capitalize">{row.category}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Period</dt>
                        <dd>{monthLabel(row.month, row.year)}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className={cn("flex min-h-0 flex-col", compact && "h-full")}>
      {(showTitle || showViewAllLink) && (
        <div
          className={cn(
            "flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 bg-white",
            compact ? "px-2 py-1.5" : "px-0 pb-4",
            !showTitle && showViewAllLink ? "justify-end" : "justify-between"
          )}
        >
          {showTitle && (
            <h2 className={cn("font-semibold text-slate-900", compact ? "text-[11px]" : "text-lg")}>
              Recent uploads
            </h2>
          )}
          {showViewAllLink && (
            <Link
              href="/upload/history"
              className={cn(
                "shrink-0 font-medium text-emerald-700 hover:text-emerald-800",
                compact ? "text-[10px]" : "text-sm"
              )}
            >
              View all →
            </Link>
          )}
        </div>
      )}

      {compact ? (
        <div
          className={cn(
            "min-h-0 flex-1 overflow-auto overscroll-contain",
            maxBodyHeightClass
          )}
        >
          {tableWrap}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {tableWrap}
        </div>
      )}
    </div>
  );
}

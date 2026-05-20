"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, GitMerge, Copy, X } from "lucide-react";
import {
  uploadElectricityExcel,
  uploadWaterExcel,
  uploadFuelExcel,
  uploadWasteExcel,
  uploadRefrigerantsExcel,
  uploadTransportExcel,
} from "@/actions/excelUpload.actions";
import type { MergePreviewPayload } from "@/lib/upload/uploadTypes";
import type { MergeStrategy } from "@/lib/upload/mergeStrategies";
import { cn } from "@/lib/utils";

interface Props {
  category: "electricity" | "water" | "fuel" | "waste" | "refrigerants" | "transport";
  onUploadSuccess?: () => void;
  /** Tighter layout for bento / dashboard cards */
  dense?: boolean;
}

type UploadStatus = "idle" | "loading" | "success" | "error";

const ACTION_MAP = {
  electricity: uploadElectricityExcel,
  water: uploadWaterExcel,
  fuel: uploadFuelExcel,
  waste: uploadWasteExcel,
  refrigerants: uploadRefrigerantsExcel,
  transport: uploadTransportExcel,
};

type MergeModalState = {
  preview: MergePreviewPayload;
  pendingFile: File;
} | null;

type DuplicateModalState = {
  fileContentHash: string;
  duplicateBatchId: string | null;
  pendingFile: File;
} | null;

export default function ExcelUploadButton({ category, onUploadSuccess, dense }: Props) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [mergeModal, setMergeModal] = useState<MergeModalState>(null);
  const [duplicateModal, setDuplicateModal] = useState<DuplicateModalState>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetIdle = useCallback(() => {
    setStatus("idle");
    setMessage("");
  }, []);

  const runAction = useCallback(
    async (formData: FormData) => {
      const action = ACTION_MAP[category];
      return action(formData);
    },
    [category]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? "");
    resetIdle();
    setMergeModal(null);
    setDuplicateModal(null);
  };

  const handleUpload = async (formData: FormData) => {
    const strategyRaw = formData.get("mergeStrategy");
    const isDuplicateResolution =
      strategyRaw === "SKIP_DUPLICATE_DATASET" || strategyRaw === "FORCE_DUPLICATE_REAUDIT";

    const file = formData.get("file") as File;
    if (!isDuplicateResolution && (!file || file.size === 0)) {
      setStatus("error");
      setMessage("Please select an Excel file first.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await runAction(formData);

      if (result.success) {
        setStatus("success");
        const parts: string[] = [];
        if (result.rowsUploaded > 0) {
          parts.push(
            `${result.rowsUploaded} row${result.rowsUploaded !== 1 ? "s" : ""} written (${result.distinctMonthsTotal} distinct month${
              result.distinctMonthsTotal !== 1 ? "s" : ""
            } on record)`
          );
        } else {
          parts.push("No new rows written");
        }
        parts.push(
          `${result.remainingMonthsForReadiness} month${
            result.remainingMonthsForReadiness !== 1 ? "s" : ""
          } remaining until readiness gate (${result.readinessMinMonths} min)`
        );
        parts.push(`Confidence: ${result.confidenceLabel} (${Math.round(result.confidence * 100)}%)`);
        if (result.mergeSummary) parts.push(result.mergeSummary);
        setMessage(parts.join(" · "));
        if (result.warnings && result.warnings.length > 0) {
          console.warn("Upload warnings:", result.warnings);
        }
        setMergeModal(null);
        setDuplicateModal(null);
        await onUploadSuccess?.();
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFileName("");
      } else if (result.code === "MERGE_REQUIRED") {
        setStatus("idle");
        setMergeModal({ preview: result.mergePreview, pendingFile: file });
        setMessage("Overlapping months detected — choose a merge strategy.");
      } else if (result.code === "DUPLICATE_DATASET") {
        setStatus("idle");
        setDuplicateModal({
          fileContentHash: result.fileContentHash,
          duplicateBatchId: result.duplicateBatchId,
          pendingFile: file,
        });
        setMessage(result.message);
      } else {
        setStatus("error");
        setMessage(result.error ?? "Upload failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Unexpected error. Please try again.");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await handleUpload(formData);
  }

  async function commitMerge(strategy: MergeStrategy) {
    if (!mergeModal) return;
    const fd = new FormData();
    fd.append("file", mergeModal.pendingFile);
    fd.append("mergeStrategy", strategy);
    setMergeModal(null);
    await handleUpload(fd);
  }

  async function resolveDuplicate(strategy: "SKIP_DUPLICATE_DATASET" | "FORCE_DUPLICATE_REAUDIT") {
    if (!duplicateModal) return;
    const fd = new FormData();
    fd.append("mergeStrategy", strategy);
    fd.append("fileContentHash", duplicateModal.fileContentHash);
    fd.append("sourceFileName", duplicateModal.pendingFile.name);
    setDuplicateModal(null);
    await handleUpload(fd);
  }

  const inputId = `excel-upload-${category}`;

  const mergeOverlay = mergeModal && (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${inputId}-merge-title`}
    >
      <div
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl",
          dense ? "max-w-lg p-3" : "max-w-xl p-4"
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h3 id={`${inputId}-merge-title`} className="text-sm font-semibold text-slate-900">
              Resolve overlapping months
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {mergeModal.preview.category} · {mergeModal.preview.incomingRowCount} incoming rows · hash{" "}
              <span className="font-mono text-[10px]">{mergeModal.preview.fileContentHash.slice(0, 12)}…</span>
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
            onClick={() => setMergeModal(null)}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-2 space-y-2 text-[11px] text-slate-600">
          <p>
            <span className="font-medium text-slate-800">Overlaps:</span>{" "}
            {mergeModal.preview.overlappingMonthKeys.length
              ? mergeModal.preview.overlappingMonthKeys.join(", ")
              : "—"}
          </p>
          <p>
            <span className="font-medium text-slate-800">New only:</span>{" "}
            {mergeModal.preview.newOnlyMonthKeys.length
              ? mergeModal.preview.newOnlyMonthKeys.join(", ")
              : "—"}
          </p>
        </div>

        {mergeModal.preview.comparisons.length > 0 && (
          <div className="mt-3 max-h-40 overflow-auto rounded-lg border border-slate-100 bg-slate-50/80">
            <table className="w-full text-left text-[10px]">
              <thead className="sticky top-0 bg-slate-100 font-medium text-slate-600">
                <tr>
                  <th className="px-2 py-1">Period</th>
                  <th className="px-2 py-1">Existing</th>
                  <th className="px-2 py-1">Incoming</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mergeModal.preview.comparisons.slice(0, 12).map((c) => (
                  <tr key={c.monthKey}>
                    <td className="px-2 py-1 font-medium text-slate-800">
                      {c.month} {c.year}
                    </td>
                    <td className="px-2 py-1 font-mono text-slate-600">{JSON.stringify(c.existing)}</td>
                    <td className="px-2 py-1 font-mono text-slate-800">{JSON.stringify(c.incoming)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mergeModal.preview.comparisons.length > 12 && (
              <p className="px-2 py-1 text-[10px] text-slate-500">Showing first 12 overlap rows…</p>
            )}
          </div>
        )}

        <div className={cn("mt-3 grid gap-2", dense ? "grid-cols-1" : "sm:grid-cols-3")}>
          <button
            type="button"
            onClick={() => void commitMerge("REPLACE_EXISTING")}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-[11px] font-semibold text-rose-900 hover:bg-rose-100"
          >
            Replace overlaps
          </button>
          <button
            type="button"
            onClick={() => void commitMerge("KEEP_EXISTING_ADD_NEW")}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            Keep existing + add missing
          </button>
          <button
            type="button"
            onClick={() => void commitMerge("ADD_TO_EXISTING")}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-[11px] font-semibold text-blue-900 hover:bg-blue-100"
          >
            <GitMerge className="size-3.5 shrink-0" />
            Add incoming to existing
          </button>
        </div>
      </div>
    </div>
  );

  const duplicateOverlay = duplicateModal && (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${inputId}-dup-title`}
    >
      <div className={cn("w-full rounded-xl border border-slate-200 bg-white shadow-xl", dense ? "max-w-md p-3" : "max-w-md p-4")}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 id={`${inputId}-dup-title`} className="text-sm font-semibold text-slate-900">
              Duplicate dataset detected
            </h3>
            <p className="mt-1 text-[11px] leading-snug text-slate-600">
              Content hash matches the last successful upload for this category. You can skip safely or record an audit-only batch.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
            onClick={() => setDuplicateModal(null)}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void resolveDuplicate("SKIP_DUPLICATE_DATASET")}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700"
          >
            <Copy className="size-3.5" />
            Skip (no change)
          </button>
          <button
            type="button"
            onClick={() => void resolveDuplicate("FORCE_DUPLICATE_REAUDIT")}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            Record audit trail
          </button>
        </div>
      </div>
    </div>
  );

  if (dense) {
    return (
      <>
        {mergeOverlay}
        {duplicateOverlay}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-stretch">
            <label htmlFor={inputId} className="group flex min-w-0 flex-1 cursor-pointer items-center">
              <div className="min-w-0 flex-1 rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-1 transition-all group-hover:border-emerald-400 group-hover:bg-emerald-50/50">
                <span className="block truncate text-[10px] text-slate-500">{fileName || ".xlsx / .xls"}</span>
              </div>
              <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                name="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading" || !fileName}
              className="inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md bg-emerald-600 px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:min-w-[7.5rem]"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span className="hidden sm:inline">…</span>
                </>
              ) : (
                <>
                  <UploadCloud className="size-3.5" />
                  Upload
                </>
              )}
            </button>
          </div>
          {status === "success" && (
            <div className="flex items-start gap-1 rounded border border-emerald-100 bg-emerald-50 px-1.5 py-1 text-[10px] text-emerald-800">
              <CheckCircle2 className="mt-0.5 size-3 shrink-0" />
              <span className="leading-snug">{message}</span>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-start gap-1 rounded border border-rose-100 bg-rose-50 px-1.5 py-1 text-[10px] text-rose-800">
              <AlertCircle className="mt-0.5 size-3 shrink-0" />
              <span className="leading-snug">{message}</span>
            </div>
          )}
          {status === "idle" && message && !mergeModal && !duplicateModal && (
            <div className="flex items-start gap-1 rounded border border-amber-100 bg-amber-50 px-1.5 py-1 text-[10px] text-amber-900">
              <AlertCircle className="mt-0.5 size-3 shrink-0" />
              <span className="leading-snug">{message}</span>
            </div>
          )}
        </form>
      </>
    );
  }

  return (
    <>
      {mergeOverlay}
      {duplicateOverlay}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-2.5">
        <label htmlFor={inputId} className="group flex w-full cursor-pointer items-center gap-2">
          <div className="min-w-0 flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 transition-all group-hover:border-emerald-400 group-hover:bg-emerald-50/40">
            <span className="block truncate text-xs text-slate-400">{fileName || "Choose .xlsx or .xls file"}</span>
          </div>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            name="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading" || !fileName}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              Upload Excel
            </>
          )}
        </button>

        {status === "success" && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
            {message}
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {message}
          </div>
        )}
        {status === "idle" && message && !mergeModal && !duplicateModal && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {message}
          </div>
        )}
      </form>
    </>
  );
}

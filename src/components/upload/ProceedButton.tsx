"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { getUploadProgress } from "@/actions/uploadProgress.actions";
import { BRD_MIN_MONTHS_FOR_READINESS_GATE } from "@/lib/upload/brdConstants";

export default function ProceedButton({
  refreshKey = 0,
  compact = false,
}: {
  refreshKey?: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [canProceed, setCanProceed] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    async function check() {
      const data = await getUploadProgress();
      if (!data) return;

      setMissing(data.readiness.mandatoryGaps.map((g) => g.category));
      setCanProceed(data.readiness.overallReadinessUnlocked);
    }
    check();
  }, [refreshKey]);

  if (compact) {
    if (canProceed) {
      return (
        <button
          type="button"
          onClick={() => router.push("/summary")}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          Continue
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
      );
    }
    return (
      <div className="flex min-w-0 flex-col items-end gap-1 text-right">
        <button
          type="button"
          disabled
          className="inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-md bg-slate-200 px-3 text-[11px] font-semibold text-slate-400"
        >
          <Lock className="size-3.5" aria-hidden />
          Locked
        </button>
        {missing.length > 0 && (
          <p className="max-w-[14rem] text-[9px] leading-snug text-slate-500">
            Readiness locked · need {BRD_MIN_MONTHS_FOR_READINESS_GATE} distinct mo:{" "}
            {missing.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}
          </p>
        )}
      </div>
    );
  }

  if (canProceed) {
    return (
      <button
        onClick={() => router.push("/summary")}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Continue to Summary
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        disabled
        className="flex items-center gap-2 bg-slate-200 text-slate-400 cursor-not-allowed px-6 py-3 rounded-xl font-medium text-sm"
      >
        <Lock className="w-4 h-4" />
        Continue to Summary
      </button>
      {missing.length > 0 && (
        <p className="text-xs text-slate-500">
          Readiness locked — need {BRD_MIN_MONTHS_FOR_READINESS_GATE} distinct months each for:{" "}
          {missing.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}
        </p>
      )}
    </div>
  );
}
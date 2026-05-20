"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import { getUploadProgress, type UploadProgressPayload } from "@/actions/uploadProgress.actions";
import { BRD_MIN_MONTHS_FOR_READINESS_GATE } from "@/lib/upload/brdConstants";
import { cn } from "@/lib/utils";

const MONTH_KEYS = ["electricity", "water", "fuel", "waste", "refrigerants", "transport"] as const;

type SlotState = "complete" | "partial" | "notStarted";

function slotForMonths(months: number): SlotState {
  if (months >= 12) return "complete";
  if (months > 0) return "partial";
  return "notStarted";
}

function slotForGovernance(g: UploadProgressPayload["governance"]): SlotState {
  if (g.isComplete) return "complete";
  if (g.answeredCount > 0) return "partial";
  return "notStarted";
}

function buildOverview(data: UploadProgressPayload) {
  const slots: SlotState[] = [
    ...MONTH_KEYS.map((k) => slotForMonths(data[k])),
    slotForGovernance(data.governance),
  ];

  const completed = slots.filter((s) => s === "complete").length;
  const partial = slots.filter((s) => s === "partial").length;
  const notStarted = slots.filter((s) => s === "notStarted").length;

  const monthScores = MONTH_KEYS.map((k) => Math.min(data[k] / 12, 1));
  const govScore = data.governance.answeredCount / Math.max(data.governance.totalCount, 1);
  const overallPct = Math.round(
    ((monthScores.reduce((a, b) => a + b, 0) + govScore) / (MONTH_KEYS.length + 1)) * 100
  );

  return {
    completed,
    partial,
    notStarted,
    overallPct: Math.min(100, Math.max(0, overallPct)),
    chartData: [
      { name: "Completed", value: completed, fill: "#00673f" },
      { name: "Partial", value: partial, fill: "#f59e0b" },
      { name: "Not started", value: notStarted, fill: "#cbd5e1" },
    ].filter((d) => d.value > 0),
  };
}

type Props = {
  refreshKey?: number;
  variant?: "default" | "compact";
};

export default function UploadOverviewPanel({ refreshKey = 0, variant = "default" }: Props) {
  const [payload, setPayload] = useState<UploadProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const data = await getUploadProgress();
      if (!cancelled) {
        setPayload(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Build overview from real data, or fall back to a zero-state if null
  const overview = useMemo(() => {
    if (payload) return buildOverview(payload);
    // Zero-state: no data yet
    return {
      completed: 0,
      partial: 0,
      notStarted: 7,
      overallPct: 0,
      chartData: [] as { name: string; value: number; fill: string }[],
    };
  }, [payload]);

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-card shadow-sm",
          variant === "compact" ? "p-2.5" : "p-6"
        )}
      >
        <h2 className={cn("font-semibold text-foreground", variant === "compact" ? "text-xs" : "text-lg")}>
          Upload overview
        </h2>
        <p className={cn("text-center text-muted-foreground", variant === "compact" ? "mt-3 text-[10px]" : "mt-8 text-sm")}>
          Loading…
        </p>
      </div>
    );
  }

  const { chartData, completed, partial, notStarted, overallPct } = overview;
  const barWidth = overallPct;
  const sliceData =
    chartData.length > 0 ? chartData : [{ name: "Not started", value: 1, fill: "#e2e8f0" }];

  if (variant === "compact") {
    return (
      <div className="shrink-0 rounded-lg border border-border bg-card p-2.5 shadow-sm">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Progress</h2>
        <div className="mt-2 flex items-center gap-3">
          <div className="relative h-[88px] w-[88px] shrink-0">
            <PieChart width={88} height={88}>
              <Pie
                data={sliceData}
                cx="50%"
                cy="50%"
                innerRadius={26}
                outerRadius={40}
                paddingAngle={chartData.length > 1 ? 1.5 : 0}
                dataKey="value"
                stroke="none"
              >
                {sliceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold leading-none text-foreground">{overallPct}%</span>
              <span className="text-[9px] font-medium text-muted-foreground">done</span>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5 text-[10px]">
            <div className="flex justify-between gap-2 text-muted-foreground">
              <span>Total</span>
              <span className="font-semibold text-foreground">8</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                Done
              </span>
              <span className="font-semibold tabular-nums text-foreground">{completed}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                Partial
              </span>
              <span className="font-semibold tabular-nums text-foreground">{partial}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="size-1.5 shrink-0 rounded-full bg-border" />
                Empty
              </span>
              <span className="font-semibold tabular-nums text-foreground">{notStarted}</span>
            </div>
            <div className="pt-0.5">
              <div className="mb-0.5 flex justify-between text-[9px] text-muted-foreground">
                <span>Overall</span>
                <span className="font-semibold text-foreground">{overallPct}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex gap-1.5 rounded-md border border-blue-100 bg-blue-50/90 px-2 py-1.5 text-[10px] leading-snug text-blue-900">
          <Check className="mt-0.5 size-3 shrink-0 text-blue-600" aria-hidden />
          <p>
            <span className="font-medium">Readiness:</span>{" "}
            {payload?.readiness?.overallReadinessUnlocked ? (
              <span>Unlocked — Electricity, Water, and Waste each have ≥{BRD_MIN_MONTHS_FOR_READINESS_GATE} distinct months.</span>
            ) : (
              <span className="text-blue-950/90">
                Locked until each of Electricity, Water, and Waste reaches {BRD_MIN_MONTHS_FOR_READINESS_GATE} distinct calendar months
                (incremental uploads count toward the total).
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Upload Overview</h2>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-[200px] w-full max-w-[220px]">
          <PieChart width={220} height={200}>
            <Pie
              data={sliceData}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={chartData.length > 1 ? 2 : 0}
              dataKey="value"
              stroke="none"
            >
              {sliceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1">
            <span className="text-3xl font-bold text-foreground">{overallPct}%</span>
            <span className="text-xs font-medium text-muted-foreground">Complete</span>
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5 text-sm">
        <li className="flex justify-between text-muted-foreground">
          <span>Total categories</span>
          <span className="font-semibold text-foreground">8</span>
        </li>
        <li className="flex justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Completed
          </span>
          <span className="font-semibold text-foreground">{completed}</span>
        </li>
        <li className="flex justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Partial
          </span>
          <span className="font-semibold text-foreground">{partial}</span>
        </li>
        <li className="flex justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-border" />
            Not started
          </span>
          <span className="font-semibold text-foreground">{notStarted}</span>
        </li>
        <li className="flex justify-between border-t border-border pt-2 text-muted-foreground">
          <span>Optional</span>
          <span className="font-medium text-muted-foreground">Additional data</span>
        </li>
      </ul>

      <div className="mt-6">
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span className="font-semibold text-foreground">{overallPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <p>
          Uploads can be incremental (any number of valid months per file). Readiness for summary unlocks when
          Electricity, Water, and Waste each reach{" "}
          <strong>{BRD_MIN_MONTHS_FOR_READINESS_GATE} distinct calendar months</strong> of operational data.
        </p>
      </div>
    </div>
  );
}

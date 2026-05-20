"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Zap, Droplets, Fuel, Trash2, Snowflake, Truck, ShieldCheck, FileText } from "lucide-react";

import { getUploadProgress, type CategoryReadinessSlice, type UploadProgressPayload } from "@/actions/uploadProgress.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExcelUploadButton from "./ExcelUploadButton";

type UploadCategory = "electricity" | "water" | "fuel" | "waste" | "refrigerants" | "transport";

interface CategoryConfig {
  name: string;
  key: UploadCategory;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  desc: string;
  template: string;
}

function getStatusStyle(
  uploaded: number,
  readiness?: CategoryReadinessSlice
): {
  bar: string;
  label: string;
  badge: string;
} {
  if (readiness && uploaded > 0 && !readiness.readinessUnlocked) {
    return {
      bar: "bg-border",
      label: "text-muted-foreground",
      badge: "border-border bg-muted text-muted-foreground",
    };
  }
  if (uploaded === 12)
    return {
      bar: "bg-primary",
      label: "text-primary",
      badge: "border-primary/30 bg-primary/10 text-primary",
    };
  if (uploaded >= 6)
    return {
      bar: "bg-amber-400",
      label: "text-amber-700",
      badge: "border-amber-200 bg-amber-50 text-amber-700",
    };
  if (uploaded >= 3)
    return {
      bar: "bg-rose-400",
      label: "text-rose-700",
      badge: "border-rose-200 bg-rose-50 text-rose-700",
    };
  return {
    bar: "bg-border",
    label: "text-muted-foreground",
    badge: "border-border bg-muted text-muted-foreground",
  };
}

function statusLabel(uploaded: number, readiness?: CategoryReadinessSlice): string {
  if (uploaded === 12) return "Complete";
  if (readiness && uploaded > 0 && !readiness.readinessUnlocked) {
    return `${uploaded}/${readiness.minReadinessMonths} mo`;
  }
  if (uploaded >= 6) return "Partial";
  if (uploaded >= 3) return "Low data";
  if (uploaded > 0) return "Insufficient";
  return "Not started";
}

const CATEGORIES: CategoryConfig[] = [
  {
    name: "Electricity",
    key: "electricity",
    icon: Zap,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    desc: "Monthly kWh, cost, peak demand, power factor",
    template: "/templates/electricity-template.xlsx",
  },
  {
    name: "Water",
    key: "water",
    icon: Droplets,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    desc: "Municipal, tanker, borewell, reuse volumes",
    template: "/templates/water-template.xlsx",
  },
  {
    name: "Fuel / DG",
    key: "fuel",
    icon: Fuel,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
    desc: "Diesel litres, runtime hours, PNG/CNG kg",
    template: "/templates/fuel-template.xlsx",
  },
  {
    name: "Waste",
    key: "waste",
    icon: Trash2,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
    desc: "Wet, dry, hazardous, biomedical, e-waste kg",
    template: "/templates/waste-template.xlsx",
  },
  {
    name: "Refrigerants",
    key: "refrigerants",
    icon: Snowflake,
    iconColor: "text-sky-500",
    iconBg: "bg-sky-50",
    desc: "R-22, R-410A, R-32 — type & quantity leaked",
    template: "/templates/refrigerants-template.xlsx",
  },
  {
    name: "Transport",
    key: "transport",
    icon: Truck,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    desc: "Fleet fuel, vehicle km, cargo tonnage",
    template: "/templates/transport-template.xlsx",
  },
];

interface CategoryCardProps {
  config: CategoryConfig;
  uploadedMonths: number;
  readiness?: CategoryReadinessSlice;
  onUploadSuccess: () => void;
  compact?: boolean;
}

function CategoryCard({ config, uploadedMonths, readiness, onUploadSuccess, compact }: CategoryCardProps) {
  const pct = Math.min((uploadedMonths / 12) * 100, 100);
  const style = getStatusStyle(uploadedMonths, readiness);
  const label = statusLabel(uploadedMonths, readiness);
  const Icon = config.icon;

  if (compact) {
    return (
      <Card className="rounded-lg border border-border/90 bg-white shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="space-y-2 p-2.5 sm:p-3">
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex min-w-0 items-start gap-2">
              <div className={`shrink-0 rounded-md p-1.5 ${config.iconBg}`}>
                <Icon className={`size-3.5 ${config.iconColor}`} aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-[11px] font-semibold leading-tight text-foreground sm:text-xs">{config.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground" title={config.desc}>
                  {config.desc}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full border px-1.5 py-0 text-[9px] font-semibold uppercase leading-none sm:text-[10px] ${style.badge}`}
            >
              {label}
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Months</span>
              <span className={`font-semibold tabular-nums ${style.label}`}>
                {uploadedMonths}/12
              </span>
            </div>
            {readiness && (
              <p className="text-[9px] leading-tight text-muted-foreground">
                Readiness: {readiness.distinctMonths}/{readiness.minReadinessMonths} · {readiness.confidenceLabel}
              </p>
            )}
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${style.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="space-y-1 pt-0.5">
            <ExcelUploadButton category={config.key} onUploadSuccess={onUploadSuccess} dense />
            <a href={config.template} download className="block">
              <Button
                variant="ghost"
                size="xs"
                className="h-6 w-full text-[10px] text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              >
                Download Template
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`flex-shrink-0 rounded-xl p-2.5 ${config.iconBg}`}>
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight text-foreground">{config.name}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{config.desc}</p>
            </div>
          </div>

          <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${style.badge}`}>
            {label}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Months uploaded</span>
            <span className={`text-xs font-semibold ${style.label}`}>{uploadedMonths} / 12</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <ExcelUploadButton category={config.key} onUploadSuccess={onUploadSuccess} />
          <a href={config.template} download className="block">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Download template
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function governanceBadgeClasses(g: UploadProgressPayload["governance"]) {
  if (g.isComplete) return "border-primary/30 bg-primary/10 text-primary";
  if (g.answeredCount > 0) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-border bg-muted text-muted-foreground";
}

function governanceStatusLabel(g: UploadProgressPayload["governance"]) {
  if (g.isComplete) return "Completed";
  if (g.answeredCount > 0) return "Partial";
  return "Not started";
}

function formatGovernanceDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function UploadCategoryGrid({
  onDataChanged,
  compact = false,
}: {
  onDataChanged?: () => void;
  compact?: boolean;
}) {
  const [payload, setPayload] = useState<UploadProgressPayload | null>(null);

  useEffect(() => {
    void (async () => {
      const data = await getUploadProgress();
      setPayload(data);
    })();
  }, []);

  const afterUpload = useCallback(async () => {
    const data = await getUploadProgress();
    setPayload(data);
    onDataChanged?.();
  }, [onDataChanged]);

  const activeCount = useMemo(() => {
    if (!payload) return 0;
    const dataActive = CATEGORIES.filter((c) => (payload[c.key] ?? 0) > 0).length;
    const gov = payload.governance.answeredCount > 0 ? 1 : 0;
    return dataActive + gov;
  }, [payload]);

  const g = payload?.governance;

  if (compact) {
    return (
      <div className="flex min-h-0 flex-col gap-2 pr-0.5">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Upload categories</h2>
          {payload !== null && (
            <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {activeCount}/8 active
            </span>
          )}
        </div>

        {/* Bento: 3×2 on wide laptop, 2×3 on md */}
        <div className="grid shrink-0 grid-cols-2 gap-1.5 min-[1200px]:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.key}
              config={cat}
              uploadedMonths={payload?.[cat.key] ?? 0}
              readiness={payload?.readiness?.categories[cat.key]}
              onUploadSuccess={afterUpload}
              compact
            />
          ))}
        </div>

        {/* Governance + Additional: side by side */}
        <div className="grid shrink-0 grid-cols-1 gap-1.5 sm:grid-cols-2">
          <Card className="rounded-lg border border-primary/30 bg-white shadow-sm">
            <CardContent className="space-y-2 p-2.5 sm:p-3">
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex min-w-0 items-start gap-2">
                  <div className="shrink-0 rounded-md bg-primary/15 p-1.5">
                    <ShieldCheck className="size-3.5 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-semibold text-foreground sm:text-xs">Governance</h3>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                      Policies, ESG owner, audit records, compliance register
                    </p>
                  </div>
                </div>
                {g && (
                  <span
                    className={`shrink-0 rounded-full border px-1.5 py-0 text-[9px] font-semibold uppercase sm:text-[10px] ${governanceBadgeClasses(g)}`}
                  >
                    {governanceStatusLabel(g)}
                  </span>
                )}
              </div>

              <div className="rounded-md border border-primary/15 bg-white px-2 py-1.5 text-[10px] text-muted-foreground">
                {g ? (
                  <>
                    <span className="font-medium text-foreground">
                      {g.answeredCount}/{g.totalCount} items
                    </span>
                    {g.lastUpdated && (
                      <span className="mt-0.5 block text-muted-foreground">Saved {formatGovernanceDate(g.lastUpdated)}</span>
                    )}
                    {!g.lastUpdated && g.answeredCount === 0 && (
                      <span className="mt-0.5 block text-muted-foreground">Not saved yet</span>
                    )}
                  </>
                ) : (
                  <span>Loading…</span>
                )}
              </div>

              <Link
                href="/upload/governance"
                className="flex h-7 w-full items-center justify-center rounded-md bg-primary text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                {g?.isComplete ? "Edit questionnaire →" : "Fill questionnaire →"}
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-dashed border-border bg-white shadow-sm">
            <CardContent className="space-y-2 p-2.5 sm:p-3">
              <div className="flex items-start gap-2">
                <div className="shrink-0 rounded-md bg-card p-1.5 ring-1 ring-border">
                  <FileText className="size-3.5 text-muted-foreground" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[11px] font-semibold text-foreground sm:text-xs">Additional data</h3>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                    IAQ reports, certifications, production output
                  </p>
                </div>
              </div>
              <span className="inline-block rounded-full bg-muted px-1.5 py-0 text-[9px] font-medium text-muted-foreground sm:text-[10px]">
                Optional
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled
                className="h-7 w-full cursor-not-allowed border-border text-[10px]"
              >
                Upload files
              </Button>
              <p className="text-[9px] leading-snug text-muted-foreground">Not enabled in this release.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Upload categories</h2>
        {payload !== null && (
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            {activeCount} of 8 categories active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.key}
            config={cat}
            uploadedMonths={payload?.[cat.key] ?? 0}
            readiness={payload?.readiness?.categories[cat.key]}
            onUploadSuccess={afterUpload}
          />
        ))}

        <Card className="rounded-2xl border border-primary/30 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-xl bg-primary/15 p-2.5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Governance</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Policies, ESG owner, audit records, compliance register
                  </p>
                </div>
              </div>
              {g && (
                <span
                  className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${governanceBadgeClasses(g)}`}
                >
                  {governanceStatusLabel(g)}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-xs text-muted-foreground">
              {g ? (
                <>
                  <span className="font-medium text-foreground">
                    {g.answeredCount}/{g.totalCount} questionnaire items
                  </span>
                  {g.lastUpdated && (
                    <span className="mt-1 block text-muted-foreground">
                      Last saved {formatGovernanceDate(g.lastUpdated)}
                    </span>
                  )}
                  {!g.lastUpdated && g.answeredCount === 0 && (
                    <span className="mt-1 block text-muted-foreground">Not saved yet</span>
                  )}
                </>
              ) : (
                <span>Loading governance status…</span>
              )}
            </div>

            <Link
              href="/upload/governance"
              className="inline-flex h-9 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {g?.isComplete ? "Edit questionnaire →" : "Fill questionnaire →"}
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-dashed border-border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-xl bg-card p-2.5 ring-1 ring-border">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Additional data</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  IAQ reports, certifications, production output
                </p>
              </div>
            </div>
            <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              Optional
            </span>
            <Button variant="outline" size="sm" disabled className="h-9 w-full cursor-not-allowed border-border text-sm">
              Upload files
            </Button>
            <p className="text-[11px] leading-snug text-muted-foreground">Optional uploads are not enabled in this release.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { adminGlassCard, AdminEmpty, AdminSectionTitle, ExportCsvButton } from "@/components/admin/admin-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type HospitalsOpt = { id: string; hospitalName: string };

type CalcPayload = {
  hospitals: HospitalsOpt[];
  hospitalId: string;
  hospitalName?: string;
  builtUpArea?: number;
  perHospital?: {
    hospitalId: string;
    hospitalName: string;
    categories: {
      category: string;
      months: number;
      completeness: number;
      confidenceLabel: string;
      confidenceModifier: number;
      annualizationEligible: boolean;
      readinessGateMet: boolean;
      status: string;
    }[];
  }[];
  categories?: {
    category: string;
    months: number;
    completeness: number;
    confidenceLabel: string;
    confidenceModifier: number;
    annualizationEligible: boolean;
    readinessGateMet: boolean;
    status: string;
  }[];
  formulas?: Record<string, string>;
  calculatedMetrics?: {
    id: string;
    metricName: string;
    rawValue: number | null;
    annualizedValue: number | null;
    unit: string;
    confidenceModifier: number;
    benchmarkStatus: string | null;
  }[];
  emissionsSummary?: { id: string; scope: string; source: string; kgCO2e: number; tCO2e: number; factorUsed: string | null }[];
  validationResults?: {
    id: string;
    checkType: string;
    status: string;
    category: string;
    affectedMonth: string | null;
    notes: string | null;
  }[];
  latestEsgScore?: {
    overallScore: number;
    energyScore: number;
    waterScore: number;
    wasteScore: number;
    governanceScore: number;
    emissionsScore: number;
  } | null;
};

export default function CalculationsAdminPage() {
  const [hid, setHid] = useState("all");
  const [data, setData] = useState<CalcPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/calculations?hospitalId=${encodeURIComponent(hid)}`);
        const json = await res.json();
        if (!cancelled) {
          if (!res.ok) setError(json.error ?? "Failed");
          else {
            setData(json);
            setError(null);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hid]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d5ddd6] border-t-[#00673F]" />
      </div>
    );
  }

  if (error || !data) {
    return <AdminEmpty title="Calculations engine unavailable" body={error ?? ""} />;
  }

  const rows =
    data.hospitalId === "all"
      ? (data.perHospital ?? []).flatMap((ph) =>
          ph.categories.map((c) => ({
            organization: ph.hospitalName,
            ...c,
          }))
        )
      : (data.categories ?? []).map((c) => ({
          organization: data.hospitalName ?? "",
          ...c,
        }));

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Analytics engine</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">Sustainability Intelligence Engine</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
            Transparency into category coverage, BRD confidence modifiers, annualization eligibility, calculated metrics,
            emissions factors applied, and persisted validation lineage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={hid} onValueChange={(value) => setHid(value ?? "all")}>
            <SelectTrigger className="h-9 min-w-[220px] border-[#d5ddd6] bg-white/80 text-sm">
              <SelectValue placeholder="Organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {data.hospitals.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.hospitalName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportCsvButton
            filename="esgroww-calculations-coverage.csv"
            rows={rows as unknown as Record<string, unknown>[]}
            columns={[
              { key: "organization", header: "Organization" },
              { key: "category", header: "Category" },
              { key: "months", header: "Months" },
              { key: "completeness", header: "Completeness %" },
              { key: "confidenceLabel", header: "Confidence" },
              { key: "confidenceModifier", header: "Modifier" },
              { key: "annualizationEligible", header: "Annualization eligible" },
              { key: "readinessGateMet", header: "Readiness gate" },
              { key: "status", header: "Status" },
            ]}
          />
        </div>
      </div>

      {data.formulas ? (
        <div>
          <AdminSectionTitle
            eyebrow="Traceability"
            title="Formula & lineage reference"
            description="Published transformations match assessment engine documentation — values below are definitions, not sample numbers."
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Object.entries(data.formulas).map(([k, v]) => (
              <div key={k} className={adminGlassCard("min-h-[100px]")}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#3d5248]">
                  {k.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-[#15221a]">{v}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.latestEsgScore && data.hospitalId !== "all" ? (
        <div className={adminGlassCard()}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3d5248]">Latest ESG score snapshot</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                ["Overall", data.latestEsgScore.overallScore],
                ["Energy", data.latestEsgScore.energyScore],
                ["Water", data.latestEsgScore.waterScore],
                ["Waste", data.latestEsgScore.wasteScore],
                ["Governance", data.latestEsgScore.governanceScore],
                ["Emissions", data.latestEsgScore.emissionsScore],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="rounded-lg bg-white/70 px-3 py-2 ring-1 ring-[#00673F]/10">
                <p className="text-[10px] font-semibold uppercase text-[#3d5248]">{label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-[#15221a]">{val.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <AdminSectionTitle
          eyebrow="Coverage"
          title="Category intelligence grid"
          description="Months reflect persisted operational rows per category; confidence pulled from ConfidenceThreshold master data."
        />
        <div className={adminGlassCard("p-0")}>
          <Table>
            <TableHeader className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
              <TableRow>
                {data.hospitalId === "all" ? (
                  <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Organization</TableHead>
                ) : null}
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Category</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Months</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Completeness</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Confidence</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Annualization</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Gate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-[#3d5248]">
                    No operational rows yet — upload Excel templates to populate the engine.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, idx) => (
                  <TableRow key={`${r.organization}-${r.category}-${idx}`} className="border-[#eceee8]">
                    {data.hospitalId === "all" ? (
                      <TableCell className="max-w-[160px] truncate text-xs font-medium text-[#15221a]">
                        {r.organization}
                      </TableCell>
                    ) : null}
                    <TableCell className="text-xs font-medium">{r.category}</TableCell>
                    <TableCell className="text-xs tabular-nums text-[#3d5248]">{r.months}</TableCell>
                    <TableCell className="text-xs tabular-nums">{r.completeness}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {r.confidenceLabel} ×{r.confidenceModifier.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{r.annualizationEligible ? "Eligible" : "Not eligible"}</TableCell>
                    <TableCell className="text-xs">{r.readinessGateMet ? "Met" : "Open"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {data.hospitalId !== "all" ? (
        <>
          <div>
            <AdminSectionTitle
              eyebrow="Calculated metrics"
              title="Engine output — CalculatedMetric"
              description="Raw vs annualized values, benchmark posture, and confidence modifiers as stored for the selected organization."
            />
            <div className={adminGlassCard("p-0")}>
              <Table>
                <TableHeader className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Metric</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Raw</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Annualized</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Unit</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Benchmark</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Modifier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.calculatedMetrics ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-[#3d5248]">
                        No calculated metrics persisted for this organization.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.calculatedMetrics!.map((m) => (
                      <TableRow key={m.id} className="border-[#eceee8]">
                        <TableCell className="text-xs font-medium text-[#15221a]">{m.metricName}</TableCell>
                        <TableCell className="text-xs tabular-nums text-[#3d5248]">{m.rawValue ?? "—"}</TableCell>
                        <TableCell className="text-xs tabular-nums text-[#3d5248]">{m.annualizedValue ?? "—"}</TableCell>
                        <TableCell className="text-xs">{m.unit}</TableCell>
                        <TableCell className="text-xs">{m.benchmarkStatus ?? "—"}</TableCell>
                        <TableCell className="text-xs tabular-nums">{m.confidenceModifier.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <AdminSectionTitle
              eyebrow="Emissions"
              title="EmissionsSummary by scope"
              description="kgCO₂e and tCO₂e with factorUsed string for audit defensibility."
            />
            <div className={adminGlassCard("p-0")}>
              <Table>
                <TableHeader className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Scope</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Source</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">tCO₂e</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Factor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.emissionsSummary ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-sm text-[#3d5248]">
                        No emissions summaries stored.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.emissionsSummary!.map((e) => (
                      <TableRow key={e.id} className="border-[#eceee8]">
                        <TableCell className="text-xs font-medium">{e.scope}</TableCell>
                        <TableCell className="text-xs text-[#3d5248]">{e.source}</TableCell>
                        <TableCell className="text-xs tabular-nums">{e.tCO2e.toFixed(3)}</TableCell>
                        <TableCell className="max-w-[220px] truncate text-[11px] text-[#3d5248]">
                          {e.factorUsed ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <AdminSectionTitle eyebrow="Validation" title="Persisted validation lineage" />
            <div className={adminGlassCard("p-0")}>
              <Table>
                <TableHeader className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Check</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Category</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Status</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Month</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.validationResults ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-[#3d5248]">
                        No validation rows for this hospital.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.validationResults!.map((v) => (
                      <TableRow key={v.id} className="border-[#eceee8]">
                        <TableCell className="text-xs">{v.checkType.replace(/_/g, " ")}</TableCell>
                        <TableCell className="text-xs">{v.category}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant={v.status === "Fail" ? "destructive" : "secondary"} className="text-[10px] uppercase">
                            {v.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{v.affectedMonth ?? "—"}</TableCell>
                        <TableCell className="max-w-[280px] truncate text-[11px] text-[#3d5248]">
                          {v.notes ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

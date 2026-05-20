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
import { Badge } from "@/components/ui/badge";

type Hospital = { id: string; hospitalName: string; sectorCode: string };

type RiskPayload = {
  hospitals: Hospital[];
  complianceRisks: {
    id: string;
    severity: string;
    title: string;
    hospitalName: string;
    sectorCode: string;
    notes: string | null;
    createdAt: string;
  }[];
  lowConfidenceAssessments: {
    id: string;
    hospitalName: string;
    confidenceScore: number | null;
    completenessPct: number | null;
    createdAt: string;
    risk: string;
  }[];
  benchmarkViolations: {
    id: string;
    hospitalName: string;
    metricName: string;
    benchmarkStatus: string | null;
    annualizedValue: number | null;
    unit: string;
  }[];
  certificationGaps: {
    id: string;
    hospitalName: string;
    certificationName: string;
    readinessPercent: number;
    statusLabel: string;
    majorGap: string | null;
  }[];
  governanceGaps: { hospitalName: string; missing: string[] }[];
  sectorValidationClusters: { sectorCode: string; openValidationSignals: number }[];
};

export default function RiskAnalysisPage() {
  const [hid, setHid] = useState("all");
  const [data, setData] = useState<RiskPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (hid !== "all") params.set("hospitalId", hid);
        const res = await fetch(`/api/admin/risk-analysis?${params.toString()}`);
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
    return <AdminEmpty title="Risk intelligence unavailable" body={error ?? ""} />;
  }

  const riskExport = data.complianceRisks.map((r) => ({
    ...r,
    createdAt: r.createdAt,
  }));

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Risk intelligence</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">ESG Risk Intelligence Center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
            Consolidated exposure from ValidationResult, confidence-degraded assessments, benchmark stress in
            CalculatedMetric, certification gaps, and governance documentation holes — no synthetic narratives.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={hid} onValueChange={(value) => setHid(value ?? "all") }>
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
            filename="esgroww-risk-validations.csv"
            rows={riskExport as unknown as Record<string, unknown>[]}
            columns={[
              { key: "createdAt", header: "Created" },
              { key: "hospitalName", header: "Organization" },
              { key: "sectorCode", header: "Sector" },
              { key: "severity", header: "Severity" },
              { key: "title", header: "Title" },
              { key: "notes", header: "Notes" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className={adminGlassCard()}>
          <p className="text-[11px] font-semibold uppercase text-[#3d5248]">Open validation signals</p>
          <p className="mt-2 text-3xl font-semibold text-[#15221a]">{data.complianceRisks.length}</p>
        </div>
        <div className={adminGlassCard()}>
          <p className="text-[11px] font-semibold uppercase text-[#3d5248]">Low confidence assessments</p>
          <p className="mt-2 text-3xl font-semibold text-[#15221a]">{data.lowConfidenceAssessments.length}</p>
        </div>
        <div className={adminGlassCard()}>
          <p className="text-[11px] font-semibold uppercase text-[#3d5248]">Benchmark stress rows</p>
          <p className="mt-2 text-3xl font-semibold text-[#15221a]">{data.benchmarkViolations.length}</p>
        </div>
        <div className={adminGlassCard()}>
          <p className="text-[11px] font-semibold uppercase text-[#3d5248]">Certification gaps (&lt;55%)</p>
          <p className="mt-2 text-3xl font-semibold text-[#15221a]">{data.certificationGaps.length}</p>
        </div>
      </div>

      <div>
        <AdminSectionTitle
          eyebrow="Clusters"
          title="Sector validation pressure"
          description="Count of open Partial/Fail validations grouped by organization sector code."
        />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {data.sectorValidationClusters.map((s) => (
            <div key={s.sectorCode} className={adminGlassCard("min-h-[88px]")}>
              <p className="text-[11px] font-semibold uppercase text-[#3d5248]">{s.sectorCode}</p>
              <p className="mt-2 text-xl font-semibold tabular-nums text-[#15221a]">{s.openValidationSignals}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <AdminSectionTitle eyebrow="Compliance" title="Validation anomalies" />
          <div className={adminGlassCard("max-h-[360px] space-y-2 overflow-y-auto p-3")}>
            {data.complianceRisks.length === 0 ? (
              <p className="text-sm text-[#3d5248]">No partial/fail validations in scope.</p>
            ) : (
              data.complianceRisks.map((r) => (
                <div key={r.id} className="rounded-lg border border-[#eceee8] bg-white/70 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#15221a]">{r.hospitalName}</span>
                    <Badge variant={r.severity === "High" ? "destructive" : "secondary"} className="text-[10px] uppercase">
                      {r.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-[#3d5248]">{r.title}</p>
                  {r.notes ? <p className="mt-1 text-[11px] text-[#004d7c]">{r.notes}</p> : null}
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <AdminSectionTitle eyebrow="Confidence" title="Low-confidence assessments" />
          <div className={adminGlassCard("max-h-[360px] space-y-2 overflow-y-auto p-3")}>
            {data.lowConfidenceAssessments.length === 0 ? (
              <p className="text-sm text-[#3d5248]">No low-confidence snapshots detected.</p>
            ) : (
              data.lowConfidenceAssessments.map((r) => (
                <div key={r.id} className="rounded-lg border border-[#eceee8] bg-white/70 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#15221a]">{r.hospitalName}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {r.risk}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-[#3d5248]">
                    Confidence {(r.confidenceScore ?? 0).toFixed(2)} · Completeness{" "}
                    {r.completenessPct != null ? `${Math.round(r.completenessPct)}%` : "—"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div>
        <AdminSectionTitle eyebrow="Performance" title="Benchmark stress — CalculatedMetric" />
        <div className={adminGlassCard("p-0")}>
          <div className="max-h-[360px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
                <tr className="border-b border-[#d5ddd6] text-left text-[11px] font-semibold uppercase text-[#3d5248]">
                  <th className="px-4 py-2">Organization</th>
                  <th className="px-4 py-2">Metric</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Annualized</th>
                </tr>
              </thead>
              <tbody>
                {data.benchmarkViolations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#3d5248]">
                      No benchmark-flagged metrics.
                    </td>
                  </tr>
                ) : (
                  data.benchmarkViolations.map((m) => (
                    <tr key={m.id} className="border-b border-[#eceee8]">
                      <td className="px-4 py-2 text-xs font-medium">{m.hospitalName}</td>
                      <td className="px-4 py-2 text-xs">{m.metricName}</td>
                      <td className="px-4 py-2 text-xs">{m.benchmarkStatus}</td>
                      <td className="px-4 py-2 text-xs tabular-nums">
                        {m.annualizedValue != null ? `${m.annualizedValue} ${m.unit}` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <AdminSectionTitle eyebrow="Certification" title="Readiness gaps" />
          <div className={adminGlassCard("max-h-[320px] space-y-2 overflow-y-auto p-3")}>
            {data.certificationGaps.map((c) => (
              <div key={c.id} className="rounded-lg border border-[#eceee8] bg-white/70 px-3 py-2 text-xs">
                <p className="font-semibold text-[#15221a]">
                  {c.hospitalName} · {c.certificationName}
                </p>
                <p className="mt-1 text-[11px] text-[#3d5248]">
                  {c.readinessPercent}% — {c.statusLabel}
                </p>
                {c.majorGap ? <p className="mt-1 text-[11px] text-[#b8860b]">{c.majorGap}</p> : null}
              </div>
            ))}
          </div>
        </div>
        <div>
          <AdminSectionTitle eyebrow="Governance" title="Documentation gaps" />
          <div className={adminGlassCard("max-h-[320px] space-y-2 overflow-y-auto p-3")}>
            {data.governanceGaps.length === 0 ? (
              <p className="text-sm text-[#3d5248]">No governance gaps detected in filter scope.</p>
            ) : (
              data.governanceGaps.map((g, i) => (
                <div key={i} className="rounded-lg border border-[#eceee8] bg-white/70 px-3 py-2 text-xs">
                  <p className="font-semibold text-[#15221a]">{g.hospitalName}</p>
                  <ul className="mt-1 list-inside list-disc text-[11px] text-[#3d5248]">
                    {g.missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

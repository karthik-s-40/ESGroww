"use client";

import { useEffect, useState } from "react";
import { adminGlassCard, AdminEmpty, AdminSectionTitle, ExportCsvButton } from "@/components/admin/admin-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Report = {
  id: string;
  createdAt: string;
  hospitalName: string;
  sectorCode: string;
  completenessPct: number | null;
  confidenceScore: number | null;
  readinessStage: string | null;
  hasAnnualized: boolean;
  hasBenchmarks: boolean;
  hasCertification: boolean;
  hasGap: boolean;
};

export default function ReportsAdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/reports");
        const json = await res.json();
        if (!cancelled) {
          if (!res.ok) setError(json.error ?? "Failed");
          else setReports(json.reports ?? []);
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
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d5ddd6] border-t-[#00673F]" />
      </div>
    );
  }

  if (error) {
    return <AdminEmpty title="Reports unavailable" body={error} />;
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Reporting</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">Assessment & reporting</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
          AssessmentHistory captures structured JSON payloads for annualized values, benchmarks, certification readiness,
          and gap analysis — this registry supports disclosure QA and audit sampling.
        </p>
      </div>

      {reports.length === 0 ? (
        <AdminEmpty
          title="No assessment reports in database"
          body="Trigger assessments from hospital workspaces. Each run appends AssessmentHistory with completeness, confidence, and readiness stage metadata."
        />
      ) : (
        <div>
          <AdminSectionTitle eyebrow="Registry" title="Recent assessment runs" />
          <div className={adminGlassCard("p-0")}>
            <div className="flex justify-end border-b border-[#eceee8] px-3 py-2">
              <ExportCsvButton
                filename="esgroww-assessment-reports.csv"
                rows={reports as unknown as Record<string, unknown>[]}
                columns={[
                  { key: "createdAt", header: "Created" },
                  { key: "hospitalName", header: "Organization" },
                  { key: "sectorCode", header: "Sector" },
                  { key: "completenessPct", header: "Completeness %" },
                  { key: "confidenceScore", header: "Confidence" },
                  { key: "readinessStage", header: "Stage" },
                  { key: "hasAnnualized", header: "Annualized JSON" },
                  { key: "hasBenchmarks", header: "Benchmark JSON" },
                  { key: "hasCertification", header: "Cert JSON" },
                  { key: "hasGap", header: "Gap JSON" },
                ]}
              />
            </div>
            <Table>
              <TableHeader className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
                <TableRow>
                  <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Generated</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Organization</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Signals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id} className="border-[#eceee8]">
                    <TableCell className="whitespace-nowrap text-xs text-[#3d5248]">
                      {new Date(r.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-[#15221a]">
                      {r.hospitalName}
                      <span className="ml-2 text-[10px] uppercase text-[#3d5248]/70">{r.sectorCode}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[9px] uppercase">
                          {r.readinessStage ?? "stage ?"}
                        </Badge>
                        {r.hasAnnualized ? (
                          <Badge variant="secondary" className="text-[9px] uppercase">
                            Annualized
                          </Badge>
                        ) : null}
                        {r.hasBenchmarks ? (
                          <Badge variant="secondary" className="text-[9px] uppercase">
                            Benchmarks
                          </Badge>
                        ) : null}
                        {r.hasCertification ? (
                          <Badge variant="secondary" className="text-[9px] uppercase">
                            Cert
                          </Badge>
                        ) : null}
                        {r.hasGap ? (
                          <Badge variant="secondary" className="text-[9px] uppercase">
                            Gaps
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[11px] text-[#3d5248]">
                        Completeness {r.completenessPct != null ? `${Math.round(r.completenessPct)}%` : "—"} ·
                        Confidence {r.confidenceScore != null ? r.confidenceScore.toFixed(2) : "—"}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

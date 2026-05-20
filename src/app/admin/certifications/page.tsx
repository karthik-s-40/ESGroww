"use client";

import { useEffect, useMemo, useState } from "react";
import { adminGlassCard, AdminEmpty, AdminSectionTitle, ExportCsvButton } from "@/components/admin/admin-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Hospital = { id: string; hospitalName: string; sectorCode: string };
type Score = {
  id: string;
  certificationName: string;
  readinessPercent: number;
  statusLabel: string;
  majorGap: string | null;
  recommendedTimeline: string | null;
  hospital: { hospitalName: string; sectorCode: string };
};
type AppRow = { sectorCode: string; certificationName: string; importanceLevel: string };
type FW = { certificationName: string; avgReadiness: number; records: number };

export default function CertificationsAdminPage() {
  const [sector, setSector] = useState<string>("all");
  const [hospitalId, setHospitalId] = useState("all");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<{
    hospitals: Hospital[];
    applicability: AppRow[];
    scores: Score[];
    frameworkAnalytics: FW[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (hospitalId !== "all") params.set("hospitalId", hospitalId);
        if (sector !== "all") params.set("sector", sector);
        const res = await fetch(`/api/admin/certifications?${params.toString()}`);
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
  }, [hospitalId, sector]);

  const filteredScores = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.scores.filter((s) => {
      const ok =
        !q ||
        s.certificationName.toLowerCase().includes(q) ||
        s.hospital.hospitalName.toLowerCase().includes(q);
      return ok;
    });
  }, [data, search]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d5ddd6] border-t-[#00673F]" />
      </div>
    );
  }

  if (error || !data) {
    return <AdminEmpty title="Certification intelligence unavailable" body={error ?? ""} />;
  }

  const sectors = ["all", ...new Set(data.hospitals.map((h) => h.sectorCode))].sort();

  return (
    <div className="space-y-10 pb-10">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Readiness intelligence</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">Certification Readiness Control Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
          CertificationScore records, sector applicability from master data, and framework-level averages for portfolio
          governance.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Select value={hospitalId} onValueChange={(value) => setHospitalId(value ?? "all")}>
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
        <Select value={sector} onValueChange={(value) => setSector(value ?? "all")}>
          <SelectTrigger className="h-9 min-w-[160px] border-[#d5ddd6] bg-white/80 text-sm">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All sectors" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="h-9 max-w-xs border-[#d5ddd6] bg-white/80 text-sm"
          placeholder="Search framework or hospital…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ExportCsvButton
          filename="esgroww-certification-scores.csv"
          rows={
            filteredScores.map((s) => ({
              hospital: s.hospital.hospitalName,
              sector: s.hospital.sectorCode,
              framework: s.certificationName,
              readiness: s.readinessPercent,
              status: s.statusLabel,
              gap: s.majorGap ?? "",
              timeline: s.recommendedTimeline ?? "",
            })) as unknown as Record<string, unknown>[]
          }
          columns={[
            { key: "hospital", header: "Organization" },
            { key: "sector", header: "Sector" },
            { key: "framework", header: "Framework" },
            { key: "readiness", header: "Readiness %" },
            { key: "status", header: "Status" },
            { key: "gap", header: "Major gap" },
            { key: "timeline", header: "Timeline" },
          ]}
        />
      </div>

      <div>
        <AdminSectionTitle
          eyebrow="Portfolio analytics"
          title="Framework heat — average readiness"
          description="Aggregated across CertificationScore rows in current filter scope."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.frameworkAnalytics.length === 0 ? (
            <AdminEmpty
              title="No certification scores yet"
              body="Run the assessment engine to populate CertificationScore. Applicability rules below still govern sector pathways."
            />
          ) : (
            data.frameworkAnalytics.map((f) => (
              <div key={f.certificationName} className={adminGlassCard()}>
                <p className="text-sm font-semibold text-[#15221a]">{f.certificationName}</p>
                <p className="mt-3 text-xs text-[#3d5248]">Records: {f.records}</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eceee8]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00673F] to-[#00A86B]"
                    style={{ width: `${Math.min(f.avgReadiness, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[#15221a]">{f.avgReadiness}%</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <AdminSectionTitle
          eyebrow="Applicability master"
          title="CertificationApplicability"
          description="Sector-driven pathways — Mandatory / Highly Recommended / Optional weightings per BRD-aligned master tables."
        />
        <div className={adminGlassCard("p-0")}>
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
                <tr className="border-b border-[#d5ddd6] text-left text-[11px] font-semibold uppercase text-[#3d5248]">
                  <th className="px-4 py-2">Sector</th>
                  <th className="px-4 py-2">Framework</th>
                  <th className="px-4 py-2">Importance</th>
                </tr>
              </thead>
              <tbody>
                {data.applicability.map((a, i) => (
                  <tr key={i} className="border-b border-[#eceee8]">
                    <td className="px-4 py-2 text-xs font-medium">{a.sectorCode}</td>
                    <td className="px-4 py-2 text-xs text-[#15221a]">{a.certificationName}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {a.importanceLevel}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <AdminSectionTitle eyebrow="Records" title="CertificationScore detail" />
        <div className={adminGlassCard("p-0")}>
          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
                <tr className="border-b border-[#d5ddd6] text-left text-[11px] font-semibold uppercase text-[#3d5248]">
                  <th className="px-4 py-2">Organization</th>
                  <th className="px-4 py-2">Framework</th>
                  <th className="px-4 py-2">Readiness</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Gap</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#3d5248]">
                      No scores in this view.
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((s) => (
                    <tr key={s.id} className="border-b border-[#eceee8]">
                      <td className="px-4 py-2 text-xs font-medium text-[#15221a]">{s.hospital.hospitalName}</td>
                      <td className="px-4 py-2 text-xs">{s.certificationName}</td>
                      <td className="px-4 py-2 text-xs tabular-nums font-semibold">{s.readinessPercent}%</td>
                      <td className="px-4 py-2">
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {s.statusLabel}
                        </Badge>
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-2 text-[11px] text-[#3d5248]">
                        {s.majorGap ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

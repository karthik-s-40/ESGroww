"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Plus, ArrowUpDown } from "lucide-react";
import { adminGlassCard, AdminEmpty, ExportCsvButton } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: string;
  hospitalName: string;
  sectorCode: string;
  accountStatus: string;
  country: string;
  state: string;
  builtUpArea: number;
  numberOfBeds: number;
  numberOfEmployees: number;
  uploadsCount: number;
  validationCount: number;
  confidenceLabel: string;
  dataCoverageMonthsMax: number;
  emissionsFootprintTCO2e: number;
  esgScore: { overallScore: number } | null;
  latestAssessment: {
    completenessPct: number | null;
    readinessStage: string | null;
    createdAt: string;
  } | null;
  certificationPreview: { certificationName: string; readinessPercent: number; statusLabel: string }[];
};

const PAGE_SIZE = 8;

export default function HospitalsAdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<"name" | "score" | "footprint" | "uploads">("name");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/hospitals");
        const data = await res.json();
        if (!cancelled) {
          if (!res.ok) setError(data.error ?? "Failed");
          else setRows(data);
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

  const sectors = useMemo(() => ["all", ...new Set(rows.map((r) => r.sectorCode))].sort(), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      const okSearch =
        !q || r.hospitalName.toLowerCase().includes(q) || r.sectorCode.toLowerCase().includes(q);
      const okSector = sector === "all" || r.sectorCode === sector;
      const okStatus = status === "all" || r.accountStatus === status;
      return okSearch && okSector && okStatus;
    });
    list = [...list].sort((a, b) => {
      if (sortKey === "name") return a.hospitalName.localeCompare(b.hospitalName);
      if (sortKey === "score")
        return (b.esgScore?.overallScore ?? -1) - (a.esgScore?.overallScore ?? -1);
      if (sortKey === "footprint") return b.emissionsFootprintTCO2e - a.emissionsFootprintTCO2e;
      return b.uploadsCount - a.uploadsCount;
    });
    return list;
  }, [rows, search, sector, status, sortKey]);

  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [search, sector, status, sortKey]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d5ddd6] border-t-[#00673F]" />
      </div>
    );
  }

  if (error) {
    return <AdminEmpty title="Organizations unavailable" body={error} />;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Portfolio</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">Organization Intelligence Hub</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
            Live profiles with sector, readiness signals, upload throughput, validation exposure, emissions footprint,
            and certification previews — sourced from Prisma relations without mock payloads.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/register"
            className="inline-flex h-9 items-center rounded-md bg-[#00673F] px-3 text-sm font-medium text-white transition hover:bg-[#008F56]"
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden />
            Register organization
          </Link>
          <ExportCsvButton
            filename="esgroww-organizations.csv"
            rows={filtered as unknown as Record<string, unknown>[]}
            columns={[
              { key: "hospitalName", header: "Name" },
              { key: "sectorCode", header: "Sector" },
              { key: "accountStatus", header: "Status" },
              { key: "state", header: "State" },
              { key: "country", header: "Country" },
              { key: "uploadsCount", header: "Uploads" },
              { key: "validationCount", header: "Validations" },
              { key: "confidenceLabel", header: "Confidence" },
              { key: "emissionsFootprintTCO2e", header: "tCO2e" },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search name or sector code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 max-w-xs border-[#d5ddd6] bg-white/80 text-sm"
        />
        <Select value={sector} onValueChange={(value) => setSector(value ?? "all") }>
          <SelectTrigger className="h-9 w-[160px] border-[#d5ddd6] bg-white/80 text-sm">
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
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger className="h-9 w-[200px] border-[#d5ddd6] bg-white/80 text-sm">
            <SelectValue placeholder="Account status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending Verification">Pending Verification</SelectItem>
            <SelectItem value="Locked">Locked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as typeof sortKey)}>
          <SelectTrigger className="h-9 w-[200px] border-[#d5ddd6] bg-white/80 text-sm">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="score">Sort: ESG score</SelectItem>
            <SelectItem value="footprint">Sort: Emissions</SelectItem>
            <SelectItem value="uploads">Sort: Uploads</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-[#3d5248]">
          Showing {filtered.length} organizations · Page {page + 1}/{totalPages}
        </span>
      </div>

      {filtered.length === 0 ? (
        <AdminEmpty
          title="No organizations match filters"
          body="Adjust search or sector filters, or register a new facility to begin the ESG data journey."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pageRows.map((h) => (
            <div key={h.id} className={adminGlassCard("min-h-[140px]")}>
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#00673F]/10 text-[#00673F]">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-[#15221a]">{h.hospitalName}</h2>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {h.sectorCode}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {h.accountStatus}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[#3d5248]">
                      {h.state}, {h.country} · {h.builtUpArea.toLocaleString()} sqft · {h.numberOfBeds} beds ·{" "}
                      {h.numberOfEmployees} FTE
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(h.certificationPreview ?? []).slice(0, 3).map((c) => (
                        <span
                          key={c.certificationName}
                          className="rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-medium text-[#15221a] ring-1 ring-[#00673F]/10"
                        >
                          {c.certificationName}: {Math.round(c.readinessPercent)}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[420px]">
                  <Metric label="ESG score" value={h.esgScore ? `${Math.round(h.esgScore.overallScore)}` : "—"} />
                  <Metric label="Uploads" value={String(h.uploadsCount)} />
                  <Metric label="Validations" value={String(h.validationCount)} />
                  <Metric label="tCO₂e" value={h.emissionsFootprintTCO2e.toFixed(2)} />
                  <Metric label="Confidence" value={h.confidenceLabel} />
                  <Metric label="Months (max cat)" value={String(h.dataCoverageMonthsMax)} />
                  <Metric
                    label="Assessment"
                    value={h.latestAssessment?.readinessStage ?? "—"}
                    sub={
                      h.latestAssessment?.completenessPct != null
                        ? `${Math.round(h.latestAssessment.completenessPct)}% complete`
                        : undefined
                    }
                  />
                  <div className="flex items-end justify-end">
                    <Button variant="outline" size="sm" className="h-8 text-xs" disabled title="Coming soon">
                      <ArrowUpDown className="mr-1 h-3 w-3" aria-hidden />
                      Drilldown
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > PAGE_SIZE ? (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-white/70 px-2 py-1.5 ring-1 ring-[#00673F]/8">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#3d5248]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#15221a]">{value}</p>
      {sub ? <p className="text-[10px] text-[#3d5248]">{sub}</p> : null}
    </div>
  );
}

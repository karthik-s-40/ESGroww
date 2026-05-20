"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Fingerprint, Gauge, Layers, Server } from "lucide-react";
import { adminGlassCard, AdminEmpty, AdminSectionTitle, ExportCsvButton } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Payload = {
  uploads: {
    id: string;
    fileName: string;
    category: string;
    month: string;
    year: number;
    uploadDate: string;
    hospitalName: string;
    hospitalId: string;
    rowCount: number | null;
    processingStatus: string;
    fileContentHash: string | null;
  }[];
  batches: {
    id: string;
    hospitalName: string;
    category: string;
    sourceFileName: string;
    createdAt: string;
    rowCount: number;
    distinctMonthCount: number;
    batchVersion: number;
    fileContentHash: string;
    isSuperseded: boolean;
    processingStatus: string;
  }[];
  categorySummaries: {
    category: string;
    organizationsWithData: number;
    avgDistinctMonths: number;
    completenessPct: number;
    confidenceLabel: string;
    confidenceModifier: number;
    annualizationEligible: boolean;
    readinessGateMet: boolean;
  }[];
  validations: {
    id: string;
    createdAt: string;
    hospitalName: string;
    category: string;
    checkType: string;
    status: string;
    affectedMonth: string | null;
    affectedYear: number | null;
    notes: string | null;
    severity: string;
    displayReason: string;
  }[];
  duplicateFingerprints: { hospitalId: string; category: string; hash: string; count: number }[];
  spikeWarnings: { hospitalName: string; category: string; message: string; severity: string }[];
  ingestTrend90d: { day: string; count: number }[];
};

export default function UploadIntelligencePage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/uploads");
        const json = await res.json();
        if (!cancelled) {
          if (!res.ok) setError(json.error ?? "Failed");
          else setData(json);
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

  const categories = useMemo(() => {
    const s = new Set<string>();
    data?.uploads.forEach((u) => s.add(u.category));
    data?.batches.forEach((b) => s.add(b.category));
    return ["all", ...[...s].sort()];
  }, [data]);

  const filteredBatches = useMemo(() => {
    if (!data) return [];
    return data.batches.filter((b) => {
      const catOk = category === "all" || b.category === category;
      const q = search.trim().toLowerCase();
      const searchOk =
        !q ||
        b.hospitalName.toLowerCase().includes(q) ||
        b.sourceFileName.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [data, category, search]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d5ddd6] border-t-[#00673F]" />
      </div>
    );
  }

  if (error || !data) {
    return <AdminEmpty title="Upload intelligence unavailable" body={error ?? "No payload"} />;
  }

  const batchExport = filteredBatches.map((b) => ({
    hospitalName: b.hospitalName,
    category: b.category,
    file: b.sourceFileName,
    createdAt: b.createdAt,
    rows: b.rowCount,
    months: b.distinctMonthCount,
    version: b.batchVersion,
    status: b.processingStatus,
    hash: b.fileContentHash,
  }));

  return (
    <div className="space-y-10 pb-10">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Ingestion intelligence</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">Upload Intelligence Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
          Unified view of DataUploadBatch commits, legacy Upload records, BRD validation outcomes, duplicate
          fingerprints, and electricity spike analytics aligned with the same rules as Excel ingestion.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.categorySummaries.map((c) => (
          <div key={c.category} className={adminGlassCard()}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#15221a]">{c.category}</p>
              <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                {c.confidenceLabel}
              </Badge>
            </div>
            <p className="mt-3 text-xs text-[#3d5248]">
              Organizations with data:{" "}
              <span className="font-semibold text-[#15221a]">{c.organizationsWithData}</span>
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eceee8]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00673F] to-[#00A86B]"
                style={{ width: `${c.completenessPct}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#3d5248]">
              <span className="rounded-md bg-white/80 px-2 py-0.5 ring-1 ring-[#00673F]/10">
                Completeness {c.completenessPct}%
              </span>
              <span className="rounded-md bg-white/80 px-2 py-0.5 ring-1 ring-[#00673F]/10">
                Modifier ×{c.confidenceModifier.toFixed(2)}
              </span>
              <span className="rounded-md bg-white/80 px-2 py-0.5 ring-1 ring-[#00673F]/10">
                Annualization {c.annualizationEligible ? "eligible" : "not eligible"}
              </span>
              <span className="rounded-md bg-white/80 px-2 py-0.5 ring-1 ring-[#00673F]/10">
                Readiness gate {c.readinessGateMet ? "met" : "open"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={adminGlassCard("flex-row items-center gap-3")}>
          <Fingerprint className="h-8 w-8 shrink-0 text-[#00673F]" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#3d5248]">Duplicate fingerprints</p>
            <p className="mt-1 text-2xl font-semibold text-[#15221a]">{data.duplicateFingerprints.length}</p>
            <p className="text-[11px] text-[#3d5248]">Same hash ingested more than once for hospital + category.</p>
          </div>
        </div>
        <div className={adminGlassCard("flex-row items-center gap-3")}>
          <AlertTriangle className="h-8 w-8 shrink-0 text-[#b8860b]" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#3d5248]">Spike heuristics</p>
            <p className="mt-1 text-2xl font-semibold text-[#15221a]">{data.spikeWarnings.length}</p>
            <p className="text-[11px] text-[#3d5248]">Electricity series variance (BRD spike/drop thresholds).</p>
          </div>
        </div>
        <div className={adminGlassCard("flex-row items-center gap-3")}>
          <Server className="h-8 w-8 shrink-0 text-[#004d7c]" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#3d5248]">Validation records</p>
            <p className="mt-1 text-2xl font-semibold text-[#15221a]">{data.validations.length}</p>
            <p className="text-[11px] text-[#3d5248]">Latest persisted ValidationResult checks ( capped sample ).</p>
          </div>
        </div>
      </div>

      {data.spikeWarnings.length > 0 ? (
        <div>
          <AdminSectionTitle
            eyebrow="Signals"
            title="Abnormal electricity variance"
            description="Derived from stored monthly kWh ordered by calendar period — mirrors row-order spike logic used at upload time."
          />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {data.spikeWarnings.map((s, i) => (
              <div key={i} className={adminGlassCard("min-h-[88px] flex-row items-start gap-3 py-3")}>
                <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-[#b8860b]" />
                <div>
                  <p className="text-xs font-semibold text-[#15221a]">
                    {s.hospitalName} · {s.category}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[#3d5248]">{s.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.duplicateFingerprints.length > 0 ? (
        <div>
          <AdminSectionTitle eyebrow="Integrity" title="Duplicate dataset fingerprints" />
          <div className={adminGlassCard("p-0")}>
            <Table>
              <TableHeader className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
                <TableRow className="border-[#d5ddd6]">
                  <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Category</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Occurrences</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.duplicateFingerprints.map((d, idx) => (
                  <TableRow key={idx} className="border-[#eceee8]">
                    <TableCell className="text-xs font-medium">{d.category}</TableCell>
                    <TableCell className="text-xs tabular-nums">{d.count}</TableCell>
                    <TableCell className="font-mono text-[11px] text-[#3d5248]">{d.hash}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}

      <div>
        <AdminSectionTitle
          eyebrow="Validation ledger"
          title="BRD validation outcomes"
          description="Exact check type, affected period, category, and severity for audit response."
        />
        <div className={adminGlassCard("p-0")}>
          <div className="flex justify-end border-b border-[#eceee8] px-3 py-2">
            <ExportCsvButton
              filename="esgroww-validation-results.csv"
              rows={data.validations as unknown as Record<string, unknown>[]}
              columns={[
                { key: "createdAt", header: "Created" },
                { key: "hospitalName", header: "Organization" },
                { key: "category", header: "Category" },
                { key: "checkType", header: "Check" },
                { key: "status", header: "Status" },
                { key: "affectedMonth", header: "Month" },
                { key: "affectedYear", header: "Year" },
                { key: "displayReason", header: "Reason" },
                { key: "severity", header: "Severity" },
              ]}
            />
          </div>
          <Table>
            <TableHeader className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
              <TableRow className="border-[#d5ddd6]">
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Time</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Organization</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Category</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Check</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Period</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.validations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-[#3d5248]">
                    No ValidationResult rows yet — engine checks will populate as assessments run.
                  </TableCell>
                </TableRow>
              ) : (
                data.validations.map((v) => (
                  <TableRow key={v.id} className="border-[#eceee8]">
                    <TableCell className="whitespace-nowrap text-xs text-[#3d5248]">
                      {new Date(v.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-xs font-medium text-[#15221a]">
                      {v.hospitalName}
                    </TableCell>
                    <TableCell className="text-xs">{v.category}</TableCell>
                    <TableCell className="text-xs text-[#3d5248]">{v.checkType.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-xs tabular-nums text-[#3d5248]">
                      {v.affectedMonth ?? "—"} {v.affectedYear ?? ""}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          v.severity === "critical"
                            ? "destructive"
                            : v.severity === "warning"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px] font-semibold uppercase"
                      >
                        {v.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <AdminSectionTitle
          eyebrow="Processing"
          title="Ingestion batch history"
          description="Enterprise batches include row counts, distinct calendar months, versioning, supersession flags, and fingerprint."
        />
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search organization, file, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 max-w-md border-[#d5ddd6] bg-white/80 text-sm"
          />
          <Select value={category} onValueChange={(value) => setCategory(value ?? "all")}>
            <SelectTrigger className="h-9 w-full max-w-[200px] border-[#d5ddd6] bg-white/80 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportCsvButton
            filename="esgroww-upload-batches.csv"
            rows={batchExport as Record<string, unknown>[]}
            columns={[
              { key: "hospitalName", header: "Organization" },
              { key: "category", header: "Category" },
              { key: "file", header: "File" },
              { key: "createdAt", header: "Created" },
              { key: "rows", header: "Rows" },
              { key: "months", header: "Distinct months" },
              { key: "version", header: "Version" },
              { key: "status", header: "Status" },
              { key: "hash", header: "Fingerprint" },
            ]}
          />
        </div>
        <div className={adminGlassCard("p-0")}>
          <Table>
            <TableHeader className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
              <TableRow className="border-[#d5ddd6]">
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Committed</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Organization</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Category</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">File</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Rows</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Months</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-[#3d5248]">
                    No batches match filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((b) => (
                  <TableRow key={b.id} className="border-[#eceee8]">
                    <TableCell className="whitespace-nowrap text-xs text-[#3d5248]">
                      {new Date(b.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs font-medium text-[#15221a]">
                      {b.hospitalName}
                    </TableCell>
                    <TableCell className="text-xs">{b.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-[#3d5248]">{b.sourceFileName}</TableCell>
                    <TableCell className="text-xs tabular-nums">{b.rowCount}</TableCell>
                    <TableCell className="text-xs tabular-nums">{b.distinctMonthCount}</TableCell>
                    <TableCell>
                      <Badge variant={b.isSuperseded ? "secondary" : "outline"} className="text-[10px] uppercase">
                        {b.processingStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <AdminSectionTitle
          eyebrow="Legacy layer"
          title="Upload table (artifact registry)"
          description="Upload rows mirror portal file metadata; batches above represent authoritative ingestion lineage."
        />
        <div className={adminGlassCard("p-0")}>
          <Table>
            <TableHeader className="sticky top-0 z-[1] bg-white/95 backdrop-blur">
              <TableRow>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">File</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Organization</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Category</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Period</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase text-[#3d5248]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.uploads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-[#3d5248]">
                    No Upload rows found.
                  </TableCell>
                </TableRow>
              ) : (
                data.uploads.slice(0, 40).map((u) => (
                  <TableRow key={u.id} className="border-[#eceee8]">
                    <TableCell className="max-w-[200px] truncate text-xs font-medium text-[#15221a]">
                      {u.fileName}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs text-[#3d5248]">{u.hospitalName}</TableCell>
                    <TableCell className="text-xs">{u.category}</TableCell>
                    <TableCell className="text-xs tabular-nums text-[#3d5248]">
                      {u.month} {u.year}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {u.processingStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-[#3d5248]">
        <Layers className="mt-0.5 h-4 w-4 shrink-0 text-[#00673F]" aria-hidden />
        <p>
          90-day batch histogram available via API (`ingestTrend90d`) for custom BI connectors — {data.ingestTrend90d.length}{" "}
          buckets returned.
        </p>
      </div>
    </div>
  );
}

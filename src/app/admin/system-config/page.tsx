"use client";

import { useCallback, useEffect, useState } from "react";
import { adminGlassCard, AdminEmpty, AdminSectionTitle, ExportCsvButton } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ConfigPayload = {
  brdConstants: Record<string, number>;
  benchmarks: {
    id: string;
    sectorCode: string;
    metricName: string;
    efficientMax: number;
    acceptableMin: number;
    acceptableMax: number;
    unit: string;
  }[];
  emissionFactors: {
    id: string;
    sourceType: string;
    region: string;
    factorValue: number;
    unit: string;
    overrideAllowed: boolean;
  }[];
  confidenceThresholds: {
    id: string;
    monthsMin: number;
    monthsMax: number;
    modifier: number;
    confidenceLabel: string;
  }[];
  certificationApplicability: {
    id: string;
    sectorCode: string;
    certificationName: string;
    importanceLevel: string;
  }[];
};

export default function SystemConfigPage() {
  const [data, setData] = useState<ConfigPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/system-config");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed");
    setData(json);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function patch(
    type: "benchmark" | "emissionFactor" | "confidence" | "applicability",
    id: string,
    patchBody: Record<string, unknown>
  ) {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/system-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, patch: patchBody }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      await load();
    } finally {
      setSavingId(null);
    }
  }

  async function create(
    type: "benchmark" | "emissionFactor" | "confidence" | "applicability",
    data: Record<string, unknown>
  ) {
    try {
      const res = await fetch("/api/admin/system-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Create failed");
      await load();
    } catch (e) {
      console.error(e);
      window.alert("Failed to create new item");
    }
  }

  async function seedDefaults() {
    if (!window.confirm("This will seed the database with default configurations. Continue?")) return;
    try {
      const res = await fetch("/api/admin/system-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "seed", data: {} }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Seed failed");
      await load();
    } catch (e) {
      console.error(e);
      window.alert("Failed to seed data");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d5ddd6] border-t-[#00673F]" />
      </div>
    );
  }

  if (error || !data) {
    return <AdminEmpty title="Configuration unavailable" body={error ?? ""} />;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Master data</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">ESG Engine Configuration Center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
            Edit benchmarks, emission factors, confidence bands, and certification applicability. Changes persist to
            PostgreSQL and append AdminAuditLog entries for compliance traceability.
          </p>
        </div>
        {data.emissionFactors.length === 0 && data.benchmarks.length === 0 && (
          <Button onClick={seedDefaults} variant="default" className="bg-[#00673F] text-white">
            Seed Default Configurations
          </Button>
        )}
      </div>

      <div className={adminGlassCard()}>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#3d5248]">BRD constants (read-only)</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#15221a]">
          {Object.entries(data.brdConstants).map(([k, v]) => (
            <span key={k} className="rounded-md bg-white/80 px-2 py-1 font-mono ring-1 ring-[#00673F]/10">
              {k}: {v}
            </span>
          ))}
        </div>
      </div>

      <Tabs defaultValue="benchmarks" className="w-full">
        <TabsList className="h-9 bg-[#eceee8]/80">
          <TabsTrigger value="benchmarks" className="text-xs">
            Benchmarks
          </TabsTrigger>
          <TabsTrigger value="factors" className="text-xs">
            Emission factors
          </TabsTrigger>
          <TabsTrigger value="confidence" className="text-xs">
            Confidence
          </TabsTrigger>
          <TabsTrigger value="applicability" className="text-xs">
            Applicability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="benchmarks" className="mt-4 space-y-3">
          <AdminSectionTitle
            eyebrow="Performance"
            title="BenchmarkMaster"
            description="Efficient and acceptable bands drive benchmarkStatus in CalculatedMetric."
          />
          <div className="flex justify-between items-center">
            <Button onClick={() => create("benchmark", {})} size="sm" variant="outline" className="h-8">
              + Add New Benchmark
            </Button>
            <ExportCsvButton
              filename="esgroww-benchmarks.csv"
              rows={data.benchmarks as unknown as Record<string, unknown>[]}
              columns={[
                { key: "sectorCode", header: "Sector" },
                { key: "metricName", header: "Metric" },
                { key: "efficientMax", header: "Efficient max" },
                { key: "acceptableMin", header: "Acceptable min" },
                { key: "acceptableMax", header: "Acceptable max" },
                { key: "unit", header: "Unit" },
              ]}
            />
          </div>
          <div className="space-y-3">
            {data.benchmarks.map((b) => (
              <BenchmarkEditor key={b.id} row={b} disabled={savingId === b.id} onSave={(p) => patch("benchmark", b.id, p)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="factors" className="mt-4 space-y-3">
          <AdminSectionTitle eyebrow="Inventory" title="EmissionFactor" />
          <div className="flex justify-between items-center">
            <Button onClick={() => create("emissionFactor", {})} size="sm" variant="outline" className="h-8">
              + Add Emission Factor
            </Button>
            <ExportCsvButton
              filename="esgroww-emission-factors.csv"
              rows={data.emissionFactors as unknown as Record<string, unknown>[]}
              columns={[
                { key: "sourceType", header: "Source" },
                { key: "region", header: "Region" },
                { key: "factorValue", header: "Factor" },
                { key: "unit", header: "Unit" },
                { key: "overrideAllowed", header: "Override" },
              ]}
            />
          </div>
          {data.emissionFactors.map((f) => (
            <FactorEditor key={f.id} row={f} disabled={savingId === f.id} onSave={(p) => patch("emissionFactor", f.id, p)} />
          ))}
        </TabsContent>

        <TabsContent value="confidence" className="mt-4 space-y-3">
          <AdminSectionTitle eyebrow="Quality" title="ConfidenceThreshold" />
          <div className="flex justify-start">
            <Button onClick={() => create("confidence", {})} size="sm" variant="outline" className="h-8">
              + Add Confidence Threshold
            </Button>
          </div>
          {data.confidenceThresholds.map((c) => (
            <ConfidenceEditor key={c.id} row={c} disabled={savingId === c.id} onSave={(p) => patch("confidence", c.id, p)} />
          ))}
        </TabsContent>

        <TabsContent value="applicability" className="mt-4 space-y-3">
          <AdminSectionTitle eyebrow="Pathways" title="CertificationApplicability" />
          <div className="flex justify-start">
            <Button onClick={() => create("applicability", {})} size="sm" variant="outline" className="h-8">
              + Add Applicability
            </Button>
          </div>
          {data.certificationApplicability.map((a) => (
            <ApplicabilityEditor
              key={a.id}
              row={a}
              disabled={savingId === a.id}
              onSave={(p) => patch("applicability", a.id, p)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BenchmarkEditor({
  row,
  onSave,
  disabled,
}: {
  row: ConfigPayload["benchmarks"][0];
  onSave: (p: Record<string, unknown>) => void;
  disabled: boolean;
}) {
  const [sectorCode, setSectorCode] = useState(row.sectorCode);
  const [metricName, setMetricName] = useState(row.metricName);
  const [efficientMax, setEfficientMax] = useState(String(row.efficientMax));
  const [acceptableMin, setAcceptableMin] = useState(String(row.acceptableMin));
  const [acceptableMax, setAcceptableMax] = useState(String(row.acceptableMax));
  const [unit, setUnit] = useState(row.unit);
  return (
    <div className={adminGlassCard("gap-3")}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Sector Code</label><Input placeholder="Sector (e.g. HOSP)" className="h-8 text-xs" value={sectorCode} onChange={(e) => setSectorCode(e.target.value)} /></div>
        <div className="flex flex-col gap-1 md:col-span-2"><label className="text-[10px] font-medium text-[#3d5248]">Metric Name</label><Input placeholder="Metric Name" className="h-8 text-xs" value={metricName} onChange={(e) => setMetricName(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Efficient Max</label><Input placeholder="Efficient Max" className="h-8 text-xs" value={efficientMax} onChange={(e) => setEfficientMax(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Acceptable Min</label><Input placeholder="Acceptable Min" className="h-8 text-xs" value={acceptableMin} onChange={(e) => setAcceptableMin(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Acceptable Max</label><Input placeholder="Acceptable Max" className="h-8 text-xs" value={acceptableMax} onChange={(e) => setAcceptableMax(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Unit</label><Input placeholder="Unit" className="h-8 text-xs" value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          className="h-8 bg-[#00673F] text-white"
          disabled={disabled}
          onClick={() =>
            onSave({
              sectorCode,
              metricName,
              efficientMax: parseFloat(efficientMax),
              acceptableMin: parseFloat(acceptableMin),
              acceptableMax: parseFloat(acceptableMax),
              unit,
            })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function FactorEditor({
  row,
  onSave,
  disabled,
}: {
  row: ConfigPayload["emissionFactors"][0];
  onSave: (p: Record<string, unknown>) => void;
  disabled: boolean;
}) {
  const [sourceType, setSourceType] = useState(row.sourceType);
  const [region, setRegion] = useState(row.region);
  const [factorValue, setFactorValue] = useState(String(row.factorValue));
  const [unit, setUnit] = useState(row.unit);
  const [overrideAllowed, setOverrideAllowed] = useState(row.overrideAllowed);
  return (
    <div className={adminGlassCard("gap-3")}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Source Type</label><Input placeholder="Source (e.g. electricity)" className="h-8 text-xs" value={sourceType} onChange={(e) => setSourceType(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Region</label><Input placeholder="Region" className="h-8 text-xs" value={region} onChange={(e) => setRegion(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Factor Value</label><Input placeholder="Factor Value" className="h-8 text-xs" value={factorValue} onChange={(e) => setFactorValue(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Unit</label><Input placeholder="Unit" className="h-8 text-xs" value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
        <label className="flex items-center gap-2 text-xs text-[#3d5248]">
          <input type="checkbox" checked={overrideAllowed} onChange={(e) => setOverrideAllowed(e.target.checked)} />
          Override allowed
        </label>
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          className="h-8 bg-[#00673F] text-white"
          disabled={disabled}
          onClick={() =>
            onSave({
              sourceType,
              region,
              factorValue: parseFloat(factorValue),
              unit,
              overrideAllowed,
            })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function ConfidenceEditor({
  row,
  onSave,
  disabled,
}: {
  row: ConfigPayload["confidenceThresholds"][0];
  onSave: (p: Record<string, unknown>) => void;
  disabled: boolean;
}) {
  const [monthsMin, setMonthsMin] = useState(String(row.monthsMin));
  const [monthsMax, setMonthsMax] = useState(String(row.monthsMax));
  const [modifier, setModifier] = useState(String(row.modifier));
  const [confidenceLabel, setConfidenceLabel] = useState(row.confidenceLabel);
  return (
    <div className={adminGlassCard("gap-3")}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Months Min</label><Input placeholder="Months Min" className="h-8 text-xs" value={monthsMin} onChange={(e) => setMonthsMin(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Months Max</label><Input placeholder="Months Max" className="h-8 text-xs" value={monthsMax} onChange={(e) => setMonthsMax(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Modifier</label><Input placeholder="Modifier" className="h-8 text-xs" value={modifier} onChange={(e) => setModifier(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Confidence Label</label><Input placeholder="Label (e.g. High)" className="h-8 text-xs" value={confidenceLabel} onChange={(e) => setConfidenceLabel(e.target.value)} /></div>
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          className="h-8 bg-[#00673F] text-white"
          disabled={disabled}
          onClick={() =>
            onSave({
              monthsMin: parseInt(monthsMin, 10),
              monthsMax: parseInt(monthsMax, 10),
              modifier: parseFloat(modifier),
              confidenceLabel,
            })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function ApplicabilityEditor({
  row,
  onSave,
  disabled,
}: {
  row: ConfigPayload["certificationApplicability"][0];
  onSave: (p: Record<string, unknown>) => void;
  disabled: boolean;
}) {
  const [sectorCode, setSectorCode] = useState(row.sectorCode);
  const [certificationName, setCertificationName] = useState(row.certificationName);
  const [importanceLevel, setImportanceLevel] = useState(row.importanceLevel);
  return (
    <div className={adminGlassCard("gap-3")}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Sector Code</label><Input placeholder="Sector Code" className="h-8 text-xs" value={sectorCode} onChange={(e) => setSectorCode(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Certification Name</label><Input placeholder="Certification Name" className="h-8 text-xs" value={certificationName} onChange={(e) => setCertificationName(e.target.value)} /></div>
        <div className="flex flex-col gap-1"><label className="text-[10px] font-medium text-[#3d5248]">Importance Level</label><Input placeholder="Importance Level" className="h-8 text-xs" value={importanceLevel} onChange={(e) => setImportanceLevel(e.target.value)} /></div>
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          className="h-8 bg-[#00673F] text-white"
          disabled={disabled}
          onClick={() => onSave({ sectorCode, certificationName, importanceLevel })}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

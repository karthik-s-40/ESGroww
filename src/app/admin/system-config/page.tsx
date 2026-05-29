"use client";

import { useEffect, useState } from "react";
import { adminGlassCard, AdminEmpty, AdminSectionTitle } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ESGConfiguration } from "@/lib/config-engine";

export default function SystemConfigPage() {
  const [data, setData] = useState<ESGConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      // Added random timestamp to prevent client-side browser caching
      const res = await fetch(`/api/admin/system-config?t=${Date.now()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load config");
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function patch(type: string, payload: any, key: string) {
    try {
      setSavingKey(key);
      const res = await fetch("/api/admin/system-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      await load();
    } catch (e) {
      console.error(e);
      window.alert("Failed to update value");
    } finally {
      setSavingKey(null);
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

  // Helpers to get current value or fallback
  type DefaultFactorKey = Exclude<keyof ESGConfiguration["defaultFactors"], "refrigerants">;
  const emissionFactorMap: Record<DefaultFactorKey, string> = {
    electricity: "electricity",
    diesel: "diesel",
    ambulanceFuel: "ambulancefuel",
    wasteKg: "wastekg",
    totalWaterConsumptionKl: "totalwaterconsumptionkl",
  };

  const getEf = (key: DefaultFactorKey): number => {
    return data.emissionFactors[emissionFactorMap[key]] ?? data.defaultFactors[key];
  };

  const getB = (metricName: string, fallback: number) => {
    return data.benchmarks["HOSP"]?.[metricName] ?? fallback;
  };

  const getW = (category: string, fallback: number) => {
    return data.scoringWeights[category] ?? fallback;
  };

  const getKpi = (metricName: string, fallback: { excellentMax: number; goodMax: number; fairMax: number }) => {
    return data.kpiRanges[metricName] ?? fallback;
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d5248]/80">Master data</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#15221a]">ESG Calculation Variables</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3d5248]">
            Update the specific emission factors, thresholds, and scoring weights currently used by the engine.
          </p>
        </div>
      </div>

      <Tabs defaultValue="factors" className="w-full">
        <TabsList className="h-10 flex flex-wrap bg-[#eceee8]/80 w-fit">
          <TabsTrigger value="factors" className="text-xs">Emission Factors</TabsTrigger>
          <TabsTrigger value="benchmarks" className="text-xs">Benchmarks</TabsTrigger>
          <TabsTrigger value="scoring" className="text-xs">Scoring Weights</TabsTrigger>
          <TabsTrigger value="kpiranges" className="text-xs">KPI Ranges</TabsTrigger>
        </TabsList>

        <TabsContent value="factors" className="mt-6 space-y-4">
          <AdminSectionTitle eyebrow="Carbon Math" title="Emission Factors (kgCO₂e)" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SimpleEditor title="Electricity" unit="kgCO2e/kWh" val={getEf("electricity")} saving={savingKey === "ef-electricity"} onSave={(v) => patch("emissionFactor", { sourceType: "electricity", factorValue: v }, "ef-electricity")} />
            <SimpleEditor title="Diesel" unit="kgCO2e/L" val={getEf("diesel")} saving={savingKey === "ef-diesel"} onSave={(v) => patch("emissionFactor", { sourceType: "diesel", factorValue: v }, "ef-diesel")} />
            <SimpleEditor title="Ambulance Fuel" unit="kgCO2e/L" val={getEf("ambulanceFuel")} saving={savingKey === "ef-ambulanceFuel"} onSave={(v) => patch("emissionFactor", { sourceType: "ambulancefuel", factorValue: v }, "ef-ambulanceFuel")} />
            <SimpleEditor title="Waste" unit="kgCO2e/kg" val={getEf("wasteKg")} saving={savingKey === "ef-wasteKg"} onSave={(v) => patch("emissionFactor", { sourceType: "wastekg", factorValue: v }, "ef-wasteKg")} />
            <SimpleEditor title="Water Consumption" unit="kgCO2e/kL" val={getEf("totalWaterConsumptionKl")} saving={savingKey === "ef-totalWaterConsumptionKl"} onSave={(v) => patch("emissionFactor", { sourceType: "totalwaterconsumptionkl", factorValue: v }, "ef-totalWaterConsumptionKl")} />
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="mt-6 space-y-4">
          <AdminSectionTitle eyebrow="Performance" title="Benchmarks (Efficient Max / Target)" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SimpleEditor title="Renewable %" unit="%" val={getB("renewablePercentage", 30)} saving={savingKey === "b-renewablePercentage"} onSave={(v) => patch("benchmark", { metricName: "renewablePercentage", efficientMax: v }, "b-renewablePercentage")} />
            <SimpleEditor title="Water Recycling %" unit="%" val={getB("waterRecyclingPercentage", 25)} saving={savingKey === "b-waterRecyclingPercentage"} onSave={(v) => patch("benchmark", { metricName: "waterRecyclingPercentage", efficientMax: v }, "b-waterRecyclingPercentage")} />
            <SimpleEditor title="Waste Diversion %" unit="%" val={getB("wasteDiversionPercentage", 40)} saving={savingKey === "b-wasteDiversionPercentage"} onSave={(v) => patch("benchmark", { metricName: "wasteDiversionPercentage", efficientMax: v }, "b-wasteDiversionPercentage")} />
            <SimpleEditor title="Energy Per Bed" unit="kWh/bed" val={getB("energyPerBed", 15000)} saving={savingKey === "b-energyPerBed"} onSave={(v) => patch("benchmark", { metricName: "energyPerBed", efficientMax: v }, "b-energyPerBed")} />
            <SimpleEditor title="Water Per Bed" unit="kL/bed" val={getB("waterPerBed", 800)} saving={savingKey === "b-waterPerBed"} onSave={(v) => patch("benchmark", { metricName: "waterPerBed", efficientMax: v }, "b-waterPerBed")} />
            <SimpleEditor title="Waste Per Bed" unit="kg/bed" val={getB("wastePerBed", 1200)} saving={savingKey === "b-wastePerBed"} onSave={(v) => patch("benchmark", { metricName: "wastePerBed", efficientMax: v }, "b-wastePerBed")} />
          </div>
        </TabsContent>

        <TabsContent value="scoring" className="mt-6 space-y-4">
          <AdminSectionTitle eyebrow="Readiness Score" title="Scoring Category Weights" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SimpleEditor title="Renewable Energy Weight" unit="weight" val={getW("renewable", 0.25)} saving={savingKey === "w-renewable"} onSave={(v) => patch("scoringWeight", { category: "renewable", weightValue: v }, "w-renewable")} />
            <SimpleEditor title="Water Recycling Weight" unit="weight" val={getW("water_recycling", 0.2)} saving={savingKey === "w-water_recycling"} onSave={(v) => patch("scoringWeight", { category: "water_recycling", weightValue: v }, "w-water_recycling")} />
            <SimpleEditor title="Waste Diversion Weight" unit="weight" val={getW("waste_diversion", 0.2)} saving={savingKey === "w-waste_diversion"} onSave={(v) => patch("scoringWeight", { category: "waste_diversion", weightValue: v }, "w-waste_diversion")} />
            <SimpleEditor title="ESG Policy Weight" unit="weight" val={getW("esg_policy", 15)} saving={savingKey === "w-esg_policy"} onSave={(v) => patch("scoringWeight", { category: "esg_policy", weightValue: v }, "w-esg_policy")} />
            <SimpleEditor title="Audit Reports Weight" unit="weight" val={getW("audit_reports", 20)} saving={savingKey === "w-audit_reports"} onSave={(v) => patch("scoringWeight", { category: "audit_reports", weightValue: v }, "w-audit_reports")} />
          </div>
        </TabsContent>

        <TabsContent value="kpiranges" className="mt-6 space-y-4">
          <AdminSectionTitle eyebrow="Thresholds" title="KPI Ranges" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KpiEditor title="Energy Intensity" metricName="EnergyIntensity" val={getKpi("EnergyIntensity", { excellentMax: 15, goodMax: 22, fairMax: 30 })} saving={savingKey === "kpi-EnergyIntensity"} onSave={(p) => patch("kpiRange", { metricName: "EnergyIntensity", ...p }, "kpi-EnergyIntensity")} />
            <KpiEditor title="Water Intensity" metricName="WaterIntensity" val={getKpi("WaterIntensity", { excellentMax: 0.2, goodMax: 0.35, fairMax: 0.5 })} saving={savingKey === "kpi-WaterIntensity"} onSave={(p) => patch("kpiRange", { metricName: "WaterIntensity", ...p }, "kpi-WaterIntensity")} />
            <KpiEditor title="Recycling Rate" metricName="RecyclingRate" val={getKpi("RecyclingRate", { excellentMax: 65, goodMax: 60, fairMax: 50 })} saving={savingKey === "kpi-RecyclingRate"} onSave={(p) => patch("kpiRange", { metricName: "RecyclingRate", ...p }, "kpi-RecyclingRate")} />
            <KpiEditor title="Waste Segregation" metricName="WasteSegregation" val={getKpi("WasteSegregation", { excellentMax: 98, goodMax: 95, fairMax: 80 })} saving={savingKey === "kpi-WasteSegregation"} onSave={(p) => patch("kpiRange", { metricName: "WasteSegregation", ...p }, "kpi-WasteSegregation")} />
            <KpiEditor title="Renewable Energy" metricName="RenewableEnergy" val={getKpi("RenewableEnergy", { excellentMax: 15, goodMax: 10, fairMax: 5 })} saving={savingKey === "kpi-RenewableEnergy"} onSave={(p) => patch("kpiRange", { metricName: "RenewableEnergy", ...p }, "kpi-RenewableEnergy")} />
            <KpiEditor title="Tanker Water Dependency" metricName="TankerWaterDependency" val={getKpi("TankerWaterDependency", { excellentMax: 5, goodMax: 10, fairMax: 20 })} saving={savingKey === "kpi-TankerWaterDependency"} onSave={(p) => patch("kpiRange", { metricName: "TankerWaterDependency", ...p }, "kpi-TankerWaterDependency")} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SimpleEditor({ title, unit, val, saving, onSave }: { title: string; unit: string; val: number; saving: boolean; onSave: (v: number) => void }) {
  const [current, setCurrent] = useState(String(val));
  useEffect(() => setCurrent(String(val)), [val]);

  return (
    <div className={adminGlassCard("flex flex-col justify-between p-4")}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#3d5248]">{title}</p>
        <p className="text-[10px] text-[#3d5248]/80 mt-1">{unit}</p>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Input className="h-9 w-full font-mono text-sm" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Button size="sm" className="h-9 bg-[#00673F] text-white shrink-0" disabled={saving || current === String(val)} onClick={() => onSave(parseFloat(current))}>
          {saving ? "..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

function KpiEditor({ title, val, saving, onSave }: { title: string; metricName: string; val: { excellentMax: number; goodMax: number; fairMax: number }; saving: boolean; onSave: (v: any) => void }) {
  const [exc, setExc] = useState(String(val.excellentMax));
  const [good, setGood] = useState(String(val.goodMax));
  const [fair, setFair] = useState(String(val.fairMax));
  
  useEffect(() => {
    setExc(String(val.excellentMax));
    setGood(String(val.goodMax));
    setFair(String(val.fairMax));
  }, [val]);

  const changed = exc !== String(val.excellentMax) || good !== String(val.goodMax) || fair !== String(val.fairMax);

  return (
    <div className={adminGlassCard("flex flex-col justify-between p-4")}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#3d5248] mb-3">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-[#3d5248]">Excellent Max</label>
          <Input className="h-8 font-mono text-xs mt-1" value={exc} onChange={(e) => setExc(e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] text-[#3d5248]">Good Max</label>
          <Input className="h-8 font-mono text-xs mt-1" value={good} onChange={(e) => setGood(e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] text-[#3d5248]">Fair Max</label>
          <Input className="h-8 font-mono text-xs mt-1" value={fair} onChange={(e) => setFair(e.target.value)} />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" className="h-8 bg-[#00673F] text-white w-24" disabled={saving || !changed} onClick={() => onSave({ excellentMax: parseFloat(exc), goodMax: parseFloat(good), fairMax: parseFloat(fair) })}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

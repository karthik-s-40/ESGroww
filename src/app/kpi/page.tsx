"use client";

import { useFetchAssessment } from "@/hooks/useFetchAssessment";
import KPICard from "@/components/kpi/KPICard";
import PageLayout from "@/components/shared/PageLayout";
import {
  evaluateEnergyIntensity,
  evaluateWaterIntensity,
  evaluateRecyclingRate,
  evaluateWasteSegregation,
  evaluateRenewableEnergy,
  evaluateTankerWaterDependency,
  evaluateWaterReuse,
  evaluatePowerFactor,
  evaluateDGDependency,
} from "@/lib/kpiUtils";

export default function KPIPage() {
  const { data, loading, error } = useFetchAssessment();

  if (!data && !loading && !error) {
    return (
      <PageLayout
        title="KPI Dashboard"
        description="Key Performance Indicators benchmarked against industry standards"
        error="No data available"
      >
        <div />
      </PageLayout>
    );
  }

  // Extract assessment data
  const annualizedValues = data?.annualizedValues || {};
  const sqft = data?.builtUpArea || data?.orgBuiltUpArea || 0;

  // Calculate KPIs
  const electricity = annualizedValues.electricity || 0;
  const water = annualizedValues.water || 0;
  const waste = annualizedValues.waste || 0;

  // Per sqft calculations
  const energyIntensity = electricity > 0 && sqft > 0 ? electricity / sqft : null;
  const waterIntensity = water > 0 && sqft > 0 ? water / sqft : null;

  // Percentages from assessment data
  const renewablePercentage = data?.percentages?.renewableEnergy || 0;
  const waterRecyclingPercentage = data?.percentages?.waterRecycling || 0;
  const wasteRecyclingPercentage = data?.percentages?.wasteRecycling || 0;

  // Placeholder values - these need actual meter/supply data
  const powerFactor = 0.85;
  const dgDependency = 0;
  const tankerWaterDependency = 0;

  // Calculate KPI objects
  const kpis = {
    energyIntensity: evaluateEnergyIntensity(energyIntensity),
    waterIntensity: evaluateWaterIntensity(waterIntensity),
    recyclingRate: evaluateRecyclingRate(wasteRecyclingPercentage),
    wasteSegregation: evaluateWasteSegregation(wasteRecyclingPercentage),
    renewableEnergy: evaluateRenewableEnergy(renewablePercentage),
    tankerDependency: evaluateTankerWaterDependency(tankerWaterDependency),
    waterReuse: evaluateWaterReuse(waterRecyclingPercentage),
    powerFactor: evaluatePowerFactor(powerFactor),
    dgDependency: evaluateDGDependency(dgDependency),
  };

  const kpiItems = [
    { title: "Energy Intensity", kpi: kpis.energyIntensity, unit: "kWh/sqft/yr" },
    { title: "Water Intensity", kpi: kpis.waterIntensity, unit: "KL/sqft/yr" },
    { title: "Recycling Rate", kpi: kpis.recyclingRate, unit: "%" },
    { title: "Waste Segregation", kpi: kpis.wasteSegregation, unit: "%" },
    { title: "Renewable Energy", kpi: kpis.renewableEnergy, unit: "%" },
    { title: "Tanker Dependency", kpi: kpis.tankerDependency, unit: "%" },
    { title: "Water Reuse", kpi: kpis.waterReuse, unit: "%" },
    { title: "Power Factor", kpi: kpis.powerFactor, unit: "" },
    { title: "DG Dependency", kpi: kpis.dgDependency, unit: "%" },
  ];

  const statusCount = {
    full: kpiItems.filter((item) => item.kpi.scoreImpact === "Full").length,
    partial: kpiItems.filter((item) => item.kpi.scoreImpact === "Partial").length,
    zero: kpiItems.filter((item) => item.kpi.scoreImpact === "Zero").length,
  };

  return (
    <PageLayout
      title="KPI Dashboard"
      description="Key Performance Indicators benchmarked against industry standards"
      loading={loading}
      error={error}
    >
      <div className="xl:h-[calc(100vh-5.5rem)] xl:overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 h-full">
        <section className="xl:col-span-8 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col min-h-0">
          <div className="px-3 py-2.5" style={{ backgroundColor: '#004D7C' }}>
            <h2 className="text-sm font-semibold text-white">KPI Scorecards</h2>
          </div>
          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 flex-1 min-h-0 lg:auto-rows-fr">
            {kpiItems.map((item) => (
              <div key={item.title} className="h-full min-h-0">
                <KPICard title={item.title} kpi={item.kpi} unit={item.unit} />
              </div>
            ))}
          </div>
        </section>

        <aside className="xl:col-span-4 flex flex-col gap-3 min-h-0">
          <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-0 shrink-0">
            <div className="px-3 py-2.5" style={{ backgroundColor: '#004D7C' }}>
              <h3 className="text-sm font-semibold text-white">Status Summary</h3>
            </div>
            <div className="p-3 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center flex flex-col items-center justify-center">
                <p className="font-semibold text-green-700">Full</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{statusCount.full}</p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-center flex flex-col items-center justify-center">
                <p className="font-semibold text-amber-700">Partial</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">{statusCount.partial}</p>
              </div>
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center flex flex-col items-center justify-center">
                <p className="font-semibold text-red-700">Zero</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{statusCount.zero}</p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-0 shrink-0">
            <div className="px-3 py-2.5" style={{ backgroundColor: '#004D7C' }}>
              <h3 className="text-sm font-semibold text-white">Data Summary</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 flex flex-col justify-center">
                <p className="text-slate-500 mb-1">Electricity</p>
                <p className="text-sm font-semibold text-slate-800">{(electricity / 1000).toFixed(1)} MWh</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 flex flex-col justify-center">
                <p className="text-slate-500 mb-1">Water</p>
                <p className="text-sm font-semibold text-slate-800">{water.toFixed(0)} KL</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 flex flex-col justify-center">
                <p className="text-slate-500 mb-1">Waste</p>
                <p className="text-sm font-semibold text-slate-800">{(waste / 1000).toFixed(1)} MT</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 flex flex-col justify-center">
                <p className="text-slate-500 mb-1">Beds / Sqft</p>
                <p className="text-sm font-semibold text-slate-800">{sqft.toFixed(0)} sqft</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
      </div>
    </PageLayout>
  );
}

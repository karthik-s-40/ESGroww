"use client";

import React from "react";
import { useFetchAssessment } from "@/hooks/useFetchAssessment";
import { Zap, Droplets, Leaf, RotateCcw, Radar } from "lucide-react";
import PageLayout from "@/components/shared/PageLayout";
import GenericSpiderChart from "@/components/charts/GenericSpiderChart";

export default function AnalysisPage() {
  const { data, loading, error } = useFetchAssessment();

  if (!data && !loading && !error) {
    return (
      <PageLayout
        title="Metrics Analysis & Benchmark Comparison"
        description="Detailed comparison of key ESG metrics against hospital industry benchmarks"
        error="No data available"
      >
        <div />
      </PageLayout>
    );
  }

  // Calculate metrics
  const sqft = data?.builtUpArea || data?.orgBuiltUpArea || 0;
  const electricity = data?.annualizedValues?.electricity || 0;
  const water = data?.annualizedValues?.water || 0;

  const energyIntensity = electricity > 0 && sqft > 0 ? electricity / sqft : null;
  const waterIntensity = water > 0 && sqft > 0 ? water / sqft : null;
  const energyIntensityValue = energyIntensity ?? 0;
  const waterIntensityValue = waterIntensity ?? 0;
  const renewableEnergy = data?.percentages?.renewableEnergy || 0;
  const recyclingRate = data?.percentages?.wasteRecycling || 0;

  // Benchmark ranges for display
  const energyBenchmarks = [
    { min: 0, max: 15, label: "Efficient (<15)", color: "green" as const },
    { min: 15, max: 22, label: "Acceptable (15-22)", color: "amber" as const },
    { min: 22, label: "Needs Attention (>22)", color: "orange" as const },
  ];

  const waterBenchmarks = [
    { min: 0, max: 0.2, label: "Efficient (<0.20)", color: "green" as const },
    { min: 0.2, max: 0.35, label: "Acceptable (0.20-0.35)", color: "amber" as const },
    { min: 0.35, label: "Needs Attention (>0.35)", color: "orange" as const },
  ];

  const renewableBenchmarks = [
    { min: 10, label: "Efficient (≥10%)", color: "green" as const },
    { min: 1, max: 10, label: "Acceptable (1-9%)", color: "amber" as const },
    { min: 0, max: 1, label: "Needs Attention (0%)", color: "orange" as const },
  ];

  const recyclingBenchmarks = [
    { min: 60, label: "Efficient (≥60%)", color: "green" as const },
    { min: 40, max: 60, label: "Acceptable (40-59%)", color: "amber" as const },
    { min: 0, max: 40, label: "Needs Attention (<40%)", color: "orange" as const },
  ];

  const metricSnapshotSections = [
    {
      key: "energy",
      label: "Energy",
      icon: Zap,
      toneClass: "text-blue-500",
      accentClass: "border-blue-200 bg-blue-50",
      value: energyIntensity !== null ? energyIntensity.toFixed(2) : "N/A",
      unit: "kWh/sqft/year",
      status: getEnergyStatus(),
      benchmark: "Target < 15",
      note: energyIntensityValue < 15 ? "Efficient" : energyIntensityValue <= 22 ? "Borderline" : "High",
      score: energyIntensityValue < 15 ? 88 : energyIntensityValue <= 22 ? 68 : 42,
    },
    {
      key: "water",
      label: "Water",
      icon: Droplets,
      toneClass: "text-cyan-500",
      accentClass: "border-cyan-200 bg-cyan-50",
      value: waterIntensity !== null ? waterIntensity.toFixed(3) : "N/A",
      unit: "KL/sqft/year",
      status: getWaterStatus(),
      benchmark: "Target < 0.20",
      note: waterIntensityValue < 0.2 ? "Efficient" : waterIntensityValue <= 0.35 ? "Borderline" : "High",
      score: waterIntensityValue < 0.2 ? 88 : waterIntensityValue <= 0.35 ? 68 : 42,
    },
    {
      key: "renewable",
      label: "Renewable",
      icon: Leaf,
      toneClass: "text-green-500",
      accentClass: "border-green-200 bg-green-50",
      value: `${renewableEnergy.toFixed(1)}%`,
      unit: "of total energy",
      status: getRenewableStatus(),
      benchmark: "Target >= 10%",
      note: renewableEnergy >= 10 ? "Good" : renewableEnergy >= 1 ? "Building" : "Low",
      score: renewableEnergy >= 10 ? 84 : renewableEnergy >= 1 ? 60 : 24,
    },
    {
      key: "recycling",
      label: "Waste",
      icon: RotateCcw,
      toneClass: "text-blue-700",
      accentClass: "border-blue-200 bg-blue-50",
      value: `${recyclingRate.toFixed(1)}%`,
      unit: "of waste recycled",
      status: getRecyclingStatus(),
      benchmark: "Target >= 60%",
      note: recyclingRate >= 60 ? "Good" : recyclingRate >= 40 ? "Borderline" : "Low",
      score: recyclingRate >= 60 ? 84 : recyclingRate >= 40 ? 60 : 24,
    },
  ] as const;

  // Spider chart data - normalized to 0-100 scale for comparison
  const spiderChartData = [
    {
      name: "Energy Efficiency",
      current: energyIntensityValue < 15 ? 100 : energyIntensityValue <= 22 ? 60 : Math.max(0, 100 - (energyIntensityValue - 22) * 2),
      benchmark: 80,
    },
    {
      name: "Water Efficiency",
      current: waterIntensityValue < 0.2 ? 100 : waterIntensityValue <= 0.35 ? 60 : Math.max(0, 100 - (waterIntensityValue - 0.35) * 100),
      benchmark: 80,
    },
    {
      name: "Renewable Energy",
      current: Math.min(renewableEnergy * 10, 100),
      benchmark: 80,
    },
    {
      name: "Waste Recycling",
      current: Math.min(recyclingRate, 100),
      benchmark: 80,
    },
  ];

  // Status helpers
  function getEnergyStatus() {
    if (energyIntensityValue < 15) return "good";
    if (energyIntensityValue <= 22) return "acceptable";
    return "warning";
  }

  function getWaterStatus() {
    if (waterIntensityValue < 0.2) return "good";
    if (waterIntensityValue <= 0.35) return "acceptable";
    return "warning";
  }

  function getRenewableStatus() {
    if (renewableEnergy >= 10) return "good";
    if (renewableEnergy >= 1) return "acceptable";
    return "warning";
  }

  function getRecyclingStatus() {
    if (recyclingRate >= 60) return "good";
    if (recyclingRate >= 40) return "acceptable";
    return "warning";
  }

  const statusLabel = (status: string) => {
    if (status === "good") return "Good";
    if (status === "acceptable") return "Watch";
    return "Needs work";
  };

  const statusTone = (status: string) => {
    if (status === "good") return "text-green-700 bg-green-50 border-green-200";
    if (status === "acceptable") return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  return (
    <PageLayout
      title="ESG Metrics Analysis"
      description="Comprehensive analysis of your hospital's environmental, social, and governance performance against industry benchmarks"
      loading={loading}
      error={error}
    >
      <div className="overflow-x-hidden">
      {/* Quick Stats Overview */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Performance Overview</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-1.5">
          <div className="group bg-white border border-blue-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Energy</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{energyIntensity !== null ? energyIntensity.toFixed(2) : "N/A"}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">kWh/sqft/year</p>
              </div>
              <div className="text-blue-200 opacity-70 group-hover:opacity-100 transition-opacity">
                <Zap size={20} strokeWidth={1.5} />
              </div>
            </div>
            <div className="pt-1.5 border-t border-blue-100 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${getEnergyStatus() === 'good' ? 'bg-green-500' : getEnergyStatus() === 'acceptable' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
              <p className={`text-[11px] font-semibold ${getEnergyStatus() === 'good' ? 'text-green-600' : getEnergyStatus() === 'acceptable' ? 'text-amber-600' : 'text-red-600'}`}>{getEnergyStatus() === 'good' ? 'Good' : getEnergyStatus() === 'acceptable' ? 'Watch' : 'Needs work'}</p>
            </div>
          </div>

          <div className="group bg-white border border-cyan-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">Water</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{waterIntensity !== null ? waterIntensity.toFixed(3) : "N/A"}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">KL/sqft/year</p>
              </div>
              <div className="text-cyan-200 opacity-70 group-hover:opacity-100 transition-opacity">
                <Droplets size={20} strokeWidth={1.5} />
              </div>
            </div>
            <div className="pt-1.5 border-t border-cyan-100 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${getWaterStatus() === 'good' ? 'bg-green-500' : getWaterStatus() === 'acceptable' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
              <p className={`text-[11px] font-semibold ${getWaterStatus() === 'good' ? 'text-green-600' : getWaterStatus() === 'acceptable' ? 'text-amber-600' : 'text-red-600'}`}>{getWaterStatus() === 'good' ? 'Good' : getWaterStatus() === 'acceptable' ? 'Watch' : 'Needs work'}</p>
            </div>
          </div>

          <div className="group bg-white border border-green-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Renewable</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{renewableEnergy.toFixed(1)}%</p>
                <p className="text-[11px] text-gray-500 mt-0.5">of total energy</p>
              </div>
              <div className="text-green-200 opacity-70 group-hover:opacity-100 transition-opacity">
                <Leaf size={20} strokeWidth={1.5} />
              </div>
            </div>
            <div className="pt-1.5 border-t border-green-100 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${getRenewableStatus() === 'good' ? 'bg-green-500' : getRenewableStatus() === 'acceptable' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
              <p className={`text-[11px] font-semibold ${getRenewableStatus() === 'good' ? 'text-green-600' : getRenewableStatus() === 'acceptable' ? 'text-amber-600' : 'text-red-600'}`}>{getRenewableStatus() === 'good' ? 'Good' : getRenewableStatus() === 'acceptable' ? 'Watch' : 'Needs work'}</p>
            </div>
          </div>

          <div className="group bg-white border border-purple-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Recycling</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{recyclingRate.toFixed(1)}%</p>
                <p className="text-[11px] text-gray-500 mt-0.5">of waste recycled</p>
              </div>
              <div className="text-purple-200 opacity-70 group-hover:opacity-100 transition-opacity">
                <RotateCcw size={20} strokeWidth={1.5} />
              </div>
            </div>
            <div className="pt-1.5 border-t border-purple-100 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${getRecyclingStatus() === 'good' ? 'bg-green-500' : getRecyclingStatus() === 'acceptable' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
              <p className={`text-[11px] font-semibold ${getRecyclingStatus() === 'good' ? 'text-green-600' : getRecyclingStatus() === 'acceptable' ? 'text-amber-600' : 'text-red-600'}`}>{getRecyclingStatus() === 'good' ? 'Good' : getRecyclingStatus() === 'acceptable' ? 'Watch' : 'Needs work'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ESG Performance Overview - Spider Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5">
        <div className="xl:col-span-8 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden min-w-0">
          <div className="border border-[#004D7C] bg-[#004D7C]/5 px-3 py-2" style={{ backgroundColor: '#004D7C' }}>
            <div className="flex items-center gap-2">
              <Radar className="text-white" size={20} />
              <h2 className="text-base font-bold text-white">ESG Radar</h2>
            </div>
          </div>
          <div className="px-2 pt-1.5 pb-2">
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_120px] gap-2.5 items-start">
              <div className="min-w-0">
                <GenericSpiderChart
                  data={spiderChartData}
                  dataKeys={[
                    { key: "current", label: "Your Performance", color: "#3b82f6", fillOpacity: 0.5 },
                    { key: "benchmark", label: "Industry Benchmark", color: "#f97316", fillOpacity: 0.3 },
                  ]}
                  angleAxisKey="name"
                  valueFormatter={(value) => `${value.toFixed(0)}`}
                  compact
                  showScaleReference={false}
                />
              </div>
              <div className="justify-self-end rounded-lg border border-[#004D7C]/15 bg-[#004D7C]/5 px-2 py-1.5 self-start xl:mt-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#004D7C]">Legend</p>
                <div className="mt-1.5 space-y-1.5 text-[10px] font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>You</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Benchmark</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {metricSnapshotSections.map((metric) => (
                <div key={metric.key} className={`rounded-lg border px-2 py-1.5 ${metric.accentClass}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">{metric.label}</p>
                    <metric.icon size={12} className={metric.toneClass} />
                  </div>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <p className="text-xs font-bold text-gray-900">{metric.value}</p>
                    <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${statusTone(metric.status)}`}>
                      {statusLabel(metric.status)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-white/70 overflow-hidden border border-white/80">
                    <div className="h-full rounded-full" style={{ width: `${metric.score}%`, backgroundColor: '#004D7C' }} />
                  </div>
                  <p className="mt-0.5 text-[10px] text-gray-500">{metric.unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-2.5 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden min-w-0">
            <div className="px-3 py-2" style={{ backgroundColor: '#004D7C' }}>
              <h2 className="text-sm font-bold text-white">At a Glance</h2>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-2">
              {metricSnapshotSections.map((metric) => (
                <div key={metric.key} className={`rounded-lg border px-2 py-1.5 ${metric.accentClass}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest">{metric.label}</p>
                    <span className="text-[9px] font-semibold">{metric.note}</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-gray-900">{metric.value}</p>
                  <div className="mt-1 h-1 rounded-full bg-white/80 overflow-hidden border border-white/70">
                    <div className="h-full rounded-full" style={{ width: `${metric.score}%`, backgroundColor: '#004D7C' }} />
                  </div>
                  <p className="mt-0.5 text-[10px] text-gray-600">{metric.benchmark}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden flex-1 min-w-0">
            <div className="px-3 py-2" style={{ backgroundColor: '#004D7C' }}>
              <h2 className="text-sm font-bold text-white">Insights</h2>
            </div>
            <div className="p-2.5 space-y-1.5 text-[10px]">
              <div className="rounded-lg bg-blue-50 px-2 py-1.5">
                <p className="font-semibold text-blue-700">Energy</p>
                <p className="text-gray-700 mt-0.5">{energyIntensityValue < 15 ? "Keep current setup." : "Improve HVAC and insulation."}</p>
              </div>
              <div className="rounded-lg bg-cyan-50 px-2 py-1.5">
                <p className="font-semibold text-cyan-700">Water</p>
                <p className="text-gray-700 mt-0.5">{waterIntensityValue < 0.35 ? "Maintain water controls." : "Add reuse and leak checks."}</p>
              </div>
              <div className="rounded-lg bg-green-50 px-2 py-1.5">
                <p className="font-semibold text-green-700">Renewable</p>
                <p className="text-gray-700 mt-0.5">{renewableEnergy >= 10 ? "Maintain momentum." : "Expand green energy sources."}</p>
              </div>
              <div className="rounded-lg bg-blue-50 px-2 py-1.5">
                <p className="font-semibold text-blue-700">Waste</p>
                <p className="text-gray-700 mt-0.5">{recyclingRate >= 60 ? "Continue waste reduction." : "Tighten segregation and recycling."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageLayout>
  );
}

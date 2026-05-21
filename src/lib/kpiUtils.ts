import type { ESGConfiguration } from "./config-engine";

export interface KPIBenchmark {
  value: number | null;
  status: "Within Benchmark" | "Slightly Below" | "Above Benchmark" | "Better than Benchmark" | "Insufficient Data";
  range: string;
  threshold: string;
  scoreImpact: "Full" | "Partial" | "Zero";
}

// Helper to calculate ranges based on config
function evaluateKpi(
  value: number | null, 
  metricName: string, 
  config: ESGConfiguration, 
  defaultEfficient: number, 
  defaultCeiling: number,
  lowerIsBetter: boolean
): KPIBenchmark {
  if (value === null || value === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "N/A",
      scoreImpact: "Zero",
    };
  }

  const rangeConfig = config.kpiRanges[metricName];
  // If no DB config, use defaults
  const efficientValue = rangeConfig ? rangeConfig.excellentMax : defaultEfficient;
  const ceilingValue = rangeConfig ? rangeConfig.goodMax : defaultCeiling;
  const tolerance = ceilingValue * 0.1;

  if (lowerIsBetter) {
    if (value < efficientValue) {
      return { value, status: "Better than Benchmark", range: `< ${efficientValue}`, threshold: `< ${efficientValue}`, scoreImpact: "Full" };
    }
    if (value <= ceilingValue) {
      return { value, status: "Within Benchmark", range: `${efficientValue} - ${ceilingValue}`, threshold: `< ${ceilingValue}`, scoreImpact: "Full" };
    }
    if (value <= ceilingValue + tolerance) {
      return { value, status: "Slightly Below", range: `${ceilingValue} - ${ceilingValue + tolerance}`, threshold: `Within 10% above ceiling`, scoreImpact: "Partial" };
    }
    return { value, status: "Above Benchmark", range: `> ${ceilingValue + tolerance}`, threshold: `> 10% above ceiling`, scoreImpact: "Zero" };
  } else {
    // higher is better
    if (value >= efficientValue) {
      return { value, status: "Better than Benchmark", range: `>= ${efficientValue}`, threshold: `>= ${efficientValue}`, scoreImpact: "Full" };
    }
    if (value >= ceilingValue) {
      return { value, status: "Within Benchmark", range: `${ceilingValue} - ${efficientValue}`, threshold: `>= ${ceilingValue}`, scoreImpact: "Full" };
    }
    if (value >= ceilingValue - tolerance) {
      return { value, status: "Slightly Below", range: `${ceilingValue - tolerance} - ${ceilingValue}`, threshold: `Within 10% below benchmark`, scoreImpact: "Partial" };
    }
    return { value, status: "Above Benchmark", range: `< ${ceilingValue - tolerance}`, threshold: `> 10% below benchmark`, scoreImpact: "Zero" };
  }
}

export function evaluateEnergyIntensity(kwhPerSqftYear: number | null, config: ESGConfiguration): KPIBenchmark {
  return evaluateKpi(kwhPerSqftYear, "EnergyIntensity", config, 15.0, 22.0, true);
}

export function evaluateWaterIntensity(klPerSqftYear: number | null, config: ESGConfiguration): KPIBenchmark {
  return evaluateKpi(klPerSqftYear, "WaterIntensity", config, 0.20, 0.35, true);
}

export function evaluateRecyclingRate(percentage: number | null, config: ESGConfiguration): KPIBenchmark {
  return evaluateKpi(percentage, "RecyclingRate", config, 65, 60, false);
}

export function evaluateWasteSegregation(percentage: number | null, config: ESGConfiguration): KPIBenchmark {
  return evaluateKpi(percentage, "WasteSegregation", config, 98, 95, false);
}

export function evaluateRenewableEnergy(percentage: number | null, config: ESGConfiguration): KPIBenchmark {
  return evaluateKpi(percentage, "RenewableEnergy", config, 15, 10, false);
}

export function evaluateTankerWaterDependency(percentage: number | null, config: ESGConfiguration): KPIBenchmark {
  return evaluateKpi(percentage, "TankerWaterDependency", config, 5, 10, true);
}

export function evaluateWaterReuse(percentage: number | null, config: ESGConfiguration): KPIBenchmark {
  return evaluateKpi(percentage, "WaterReuse", config, 20, 15, false);
}

export function evaluatePowerFactor(factor: number | null, config: ESGConfiguration): KPIBenchmark {
  return evaluateKpi(factor, "PowerFactor", config, 0.90, 0.85, false);
}

export function evaluateDGDependency(percentage: number | null, config: ESGConfiguration): KPIBenchmark {
  return evaluateKpi(percentage, "DGDependency", config, 2, 5, true);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Within Benchmark": return "bg-green-50 text-green-700 border-green-300";
    case "Better than Benchmark": return "bg-blue-50 text-blue-700 border-blue-300";
    case "Slightly Below": return "bg-amber-50 text-amber-700 border-amber-300";
    case "Above Benchmark": return "bg-orange-50 text-orange-700 border-orange-300";
    case "Insufficient Data": return "bg-slate-50 text-slate-700 border-slate-300";
    default: return "bg-slate-50 text-slate-700 border-slate-300";
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "Within Benchmark": return "bg-green-200 text-green-900";
    case "Better than Benchmark": return "bg-blue-200 text-blue-900";
    case "Slightly Below": return "bg-amber-200 text-amber-900";
    case "Above Benchmark": return "bg-orange-200 text-orange-900";
    case "Insufficient Data": return "bg-slate-200 text-slate-900";
    default: return "bg-slate-200 text-slate-900";
  }
}

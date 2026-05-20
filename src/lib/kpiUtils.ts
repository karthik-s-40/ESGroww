// KPI evaluation helper functions
export interface KPIBenchmark {
  value: number | null;
  status: "Within Benchmark" | "Slightly Below" | "Above Benchmark" | "Better than Benchmark" | "Insufficient Data";
  range: string;
  threshold: string;
  scoreImpact: "Full" | "Partial" | "Zero";
}

export function evaluateEnergyIntensity(kwhPerSqftYear: number | null): KPIBenchmark {
  if (kwhPerSqftYear === null || kwhPerSqftYear === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "Hospital: <15 kWh/sqft/year",
      scoreImpact: "Zero",
    };
  }

  // Efficient range: < 15.0
  // Acceptable range: 15.0 – 22.0
  // Ceiling: 22.0
  const ceilingValue = 22.0;
  const efficientValue = 15.0;
  const tolerance = ceilingValue * 0.1; // 10% above ceiling = 24.2

  if (kwhPerSqftYear < efficientValue) {
    return {
      value: kwhPerSqftYear,
      status: "Better than Benchmark",
      range: "< 15.0",
      threshold: "Hospital: <15 kWh/sqft/year",
      scoreImpact: "Full",
    };
  }

  if (kwhPerSqftYear <= ceilingValue) {
    return {
      value: kwhPerSqftYear,
      status: "Within Benchmark",
      range: "15.0 – 22.0",
      threshold: "Hospital: 15-22 kWh/sqft/year",
      scoreImpact: "Full",
    };
  }

  if (kwhPerSqftYear <= ceilingValue + tolerance) {
    return {
      value: kwhPerSqftYear,
      status: "Slightly Below",
      range: "22.0 – 24.2",
      threshold: "Within 10% above ceiling",
      scoreImpact: "Partial",
    };
  }

  return {
    value: kwhPerSqftYear,
    status: "Above Benchmark",
    range: "> 24.2",
    threshold: "> 10% above ceiling",
    scoreImpact: "Zero",
  };
}

export function evaluateWaterIntensity(klPerSqftYear: number | null): KPIBenchmark {
  if (klPerSqftYear === null || klPerSqftYear === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "Hospital: <0.20 KL/sqft/year",
      scoreImpact: "Zero",
    };
  }

  // Efficient range: < 0.20
  // Acceptable range: 0.20 – 0.35
  // Ceiling: 0.35
  const ceilingValue = 0.35;
  const efficientValue = 0.2;
  const tolerance = ceilingValue * 0.1; // 10% above ceiling = 0.385

  if (klPerSqftYear < efficientValue) {
    return {
      value: klPerSqftYear,
      status: "Better than Benchmark",
      range: "< 0.20",
      threshold: "Hospital: <0.20 KL/sqft/year",
      scoreImpact: "Full",
    };
  }

  if (klPerSqftYear <= ceilingValue) {
    return {
      value: klPerSqftYear,
      status: "Within Benchmark",
      range: "0.20 – 0.35",
      threshold: "Hospital: 0.20-0.35 KL/sqft/year",
      scoreImpact: "Full",
    };
  }

  if (klPerSqftYear <= ceilingValue + tolerance) {
    return {
      value: klPerSqftYear,
      status: "Slightly Below",
      range: "0.35 – 0.385",
      threshold: "Within 10% above ceiling",
      scoreImpact: "Partial",
    };
  }

  return {
    value: klPerSqftYear,
    status: "Above Benchmark",
    range: "> 0.385",
    threshold: "> 10% above ceiling",
    scoreImpact: "Zero",
  };
}

export function evaluateRecyclingRate(percentage: number | null): KPIBenchmark {
  if (percentage === null || percentage === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "≥ 60%",
      scoreImpact: "Zero",
    };
  }

  // Efficient range: ≥ 60%
  // Ceiling: 60%
  // Tolerance: 60 * 0.1 = 6% → 54% – 60%
  const ceilingValue = 60;
  const tolerance = ceilingValue * 0.1; // 54%

  if (percentage >= ceilingValue) {
    return {
      value: percentage,
      status: "Within Benchmark",
      range: "≥ 60%",
      threshold: "≥ 60%",
      scoreImpact: "Full",
    };
  }

  if (percentage >= ceilingValue - tolerance) {
    return {
      value: percentage,
      status: "Slightly Below",
      range: "54% – 60%",
      threshold: "Within 10% below benchmark",
      scoreImpact: "Partial",
    };
  }

  if (percentage > 0) {
    return {
      value: percentage,
      status: "Above Benchmark",
      range: "< 54%",
      threshold: "> 10% below benchmark",
      scoreImpact: "Zero",
    };
  }

  return {
    value: percentage,
    status: "Insufficient Data",
    range: "0%",
    threshold: "≥ 60%",
    scoreImpact: "Zero",
  };
}

export function evaluateWasteSegregation(percentage: number | null): KPIBenchmark {
  if (percentage === null || percentage === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "95–100%",
      scoreImpact: "Zero",
    };
  }

  // Efficient range: 95–100%
  // Ceiling: 95%
  // Tolerance: 95 * 0.1 = 9.5% → 85.5% – 95%
  const ceilingValue = 95;
  const tolerance = ceilingValue * 0.1;

  if (percentage >= ceilingValue) {
    return {
      value: percentage,
      status: "Within Benchmark",
      range: "95–100%",
      threshold: "95–100%",
      scoreImpact: "Full",
    };
  }

  if (percentage >= ceilingValue - tolerance) {
    return {
      value: percentage,
      status: "Slightly Below",
      range: `${(ceilingValue - tolerance).toFixed(1)}% – 95%`,
      threshold: "Within 10% below benchmark",
      scoreImpact: "Partial",
    };
  }

  return {
    value: percentage,
    status: "Above Benchmark",
    range: `< ${(ceilingValue - tolerance).toFixed(1)}%`,
    threshold: "> 10% below benchmark",
    scoreImpact: "Zero",
  };
}

export function evaluateRenewableEnergy(percentage: number | null): KPIBenchmark {
  if (percentage === null || percentage === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "≥ 10%",
      scoreImpact: "Zero",
    };
  }

  // Efficient range: ≥ 10%
  // Ceiling: 10%
  // Tolerance: 10 * 0.1 = 1% → 9% – 10%
  const ceilingValue = 10;
  const tolerance = ceilingValue * 0.1;

  if (percentage >= ceilingValue) {
    return {
      value: percentage,
      status: "Within Benchmark",
      range: "≥ 10%",
      threshold: "≥ 10%",
      scoreImpact: "Full",
    };
  }

  if (percentage >= ceilingValue - tolerance) {
    return {
      value: percentage,
      status: "Slightly Below",
      range: `${(ceilingValue - tolerance).toFixed(1)}% – 10%`,
      threshold: "Within 10% below benchmark",
      scoreImpact: "Partial",
    };
  }

  if (percentage > 0) {
    return {
      value: percentage,
      status: "Above Benchmark",
      range: `< ${(ceilingValue - tolerance).toFixed(1)}%`,
      threshold: "> 10% below benchmark",
      scoreImpact: "Zero",
    };
  }

  return {
    value: percentage,
    status: "Insufficient Data",
    range: "0%",
    threshold: "≥ 10%",
    scoreImpact: "Zero",
  };
}

export function evaluateTankerWaterDependency(percentage: number | null): KPIBenchmark {
  if (percentage === null || percentage === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "< 10%",
      scoreImpact: "Zero",
    };
  }

  // Efficient range: < 10%
  // Ceiling: 10%
  // Tolerance: 10 * 0.1 = 1% → 10% – 11%
  const ceilingValue = 10;
  const tolerance = ceilingValue * 0.1;

  if (percentage < ceilingValue) {
    return {
      value: percentage,
      status: "Within Benchmark",
      range: "< 10%",
      threshold: "< 10%",
      scoreImpact: "Full",
    };
  }

  if (percentage <= ceilingValue + tolerance) {
    return {
      value: percentage,
      status: "Slightly Below",
      range: `10% – ${(ceilingValue + tolerance).toFixed(1)}%`,
      threshold: "Within 10% above ceiling",
      scoreImpact: "Partial",
    };
  }

  return {
    value: percentage,
    status: "Above Benchmark",
    range: `> ${(ceilingValue + tolerance).toFixed(1)}%`,
    threshold: "> 10% above ceiling",
    scoreImpact: "Zero",
  };
}

export function evaluateWaterReuse(percentage: number | null): KPIBenchmark {
  if (percentage === null || percentage === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "≥ 15%",
      scoreImpact: "Zero",
    };
  }

  // Efficient range: ≥ 15%
  // Ceiling: 15%
  // Tolerance: 15 * 0.1 = 1.5% → 13.5% – 15%
  const ceilingValue = 15;
  const tolerance = ceilingValue * 0.1;

  if (percentage >= ceilingValue) {
    return {
      value: percentage,
      status: "Within Benchmark",
      range: "≥ 15%",
      threshold: "≥ 15%",
      scoreImpact: "Full",
    };
  }

  if (percentage >= ceilingValue - tolerance) {
    return {
      value: percentage,
      status: "Slightly Below",
      range: `${(ceilingValue - tolerance).toFixed(1)}% – 15%`,
      threshold: "Within 10% below benchmark",
      scoreImpact: "Partial",
    };
  }

  if (percentage > 0) {
    return {
      value: percentage,
      status: "Above Benchmark",
      range: `< ${(ceilingValue - tolerance).toFixed(1)}%`,
      threshold: "> 10% below benchmark",
      scoreImpact: "Zero",
    };
  }

  return {
    value: percentage,
    status: "Insufficient Data",
    range: "0%",
    threshold: "≥ 15%",
    scoreImpact: "Zero",
  };
}

export function evaluatePowerFactor(factor: number | null): KPIBenchmark {
  if (factor === null || factor === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "≥ 0.85",
      scoreImpact: "Zero",
    };
  }

  // Efficient range: ≥ 0.85
  // Ceiling: 0.85
  // Tolerance: 0.85 * 0.1 = 0.085 → 0.765 – 0.85
  const ceilingValue = 0.85;
  const tolerance = ceilingValue * 0.1;

  if (factor >= ceilingValue) {
    return {
      value: factor,
      status: "Within Benchmark",
      range: "≥ 0.85",
      threshold: "≥ 0.85",
      scoreImpact: "Full",
    };
  }

  if (factor >= ceilingValue - tolerance) {
    return {
      value: factor,
      status: "Slightly Below",
      range: `${(ceilingValue - tolerance).toFixed(3)} – 0.85`,
      threshold: "Within 10% below benchmark",
      scoreImpact: "Partial",
    };
  }

  return {
    value: factor,
    status: "Above Benchmark",
    range: `< ${(ceilingValue - tolerance).toFixed(3)}`,
    threshold: "> 10% below benchmark",
    scoreImpact: "Zero",
  };
}

export function evaluateDGDependency(percentage: number | null): KPIBenchmark {
  if (percentage === null || percentage === undefined) {
    return {
      value: null,
      status: "Insufficient Data",
      range: "N/A",
      threshold: "< 5%",
      scoreImpact: "Zero",
    };
  }

  // Efficient range: < 5%
  // Ceiling: 5%
  // Tolerance: 5 * 0.1 = 0.5% → 5% – 5.5%
  const ceilingValue = 5;
  const tolerance = ceilingValue * 0.1;

  if (percentage < ceilingValue) {
    return {
      value: percentage,
      status: "Within Benchmark",
      range: "< 5%",
      threshold: "< 5%",
      scoreImpact: "Full",
    };
  }

  if (percentage <= ceilingValue + tolerance) {
    return {
      value: percentage,
      status: "Slightly Below",
      range: `5% – ${(ceilingValue + tolerance).toFixed(1)}%`,
      threshold: "Within 10% above ceiling",
      scoreImpact: "Partial",
    };
  }

  return {
    value: percentage,
    status: "Above Benchmark",
    range: `> ${(ceilingValue + tolerance).toFixed(1)}%`,
    threshold: "> 10% above ceiling",
    scoreImpact: "Zero",
  };
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Within Benchmark":
      return "bg-green-50 text-green-700 border-green-300";
    case "Better than Benchmark":
      return "bg-blue-50 text-blue-700 border-blue-300";
    case "Slightly Below":
      return "bg-amber-50 text-amber-700 border-amber-300";
    case "Above Benchmark":
      return "bg-orange-50 text-orange-700 border-orange-300";
    case "Insufficient Data":
      return "bg-slate-50 text-slate-700 border-slate-300";
    default:
      return "bg-slate-50 text-slate-700 border-slate-300";
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "Within Benchmark":
      return "bg-green-200 text-green-900";
    case "Better than Benchmark":
      return "bg-blue-200 text-blue-900";
    case "Slightly Below":
      return "bg-amber-200 text-amber-900";
    case "Above Benchmark":
      return "bg-orange-200 text-orange-900";
    case "Insufficient Data":
      return "bg-slate-200 text-slate-900";
    default:
      return "bg-slate-200 text-slate-900";
  }
}

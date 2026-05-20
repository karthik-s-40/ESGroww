// Safe data formatting utilities to prevent overflow
export function clampPercentage(value: number | undefined | null): number {
  const num = Number(value) || 0;
  return Math.min(100, Math.max(0, num));
}

export function formatCompleteness(value: string): string {
  // Ensure completeness string doesn't overflow (e.g., "50%", "100%")
  return value || "0%";
}

export function truncateText(text: string, maxLength: number = 40): string {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength - 1) + "…" : text;
}

export function getReportForMonths(m: number | undefined | null) {
  const monthsNum = Number(m) || 0;

  if (monthsNum >= 12) {
    return {
      modifier: 1.0,
      level: "High",
      message: "Full-year data available. Assessment is fully accurate.",
    };
  }

  if (monthsNum >= 9) {
    return {
      modifier: 0.95,
      level: "High",
      message: "Annual value estimated with high confidence.",
    };
  }

  if (monthsNum >= 6) {
    return {
      modifier: 0.85,
      level: "Medium",
      message: "Annual value estimated with medium confidence.",
    };
  }

  if (monthsNum >= 3) {
    return {
      modifier: 0.7,
      level: "Low",
      message: "Low confidence due to limited data. Treat results as indicative only.",
    };
  }

  if (monthsNum >= 1) {
    return {
      modifier: null,
      level: "Insufficient",
      message: "Insufficient data for annual readiness calculation. Score = 0 for all dependent parameters.",
    };
  }

  return {
    modifier: 0.0,
    level: "Missing",
    message: "Required data missing. Score = 0 for all dependent parameters.",
  };
}

export function getValidationStatus(m: number | undefined | null) {
  const monthsNum = Number(m) || 0;
  const completeness = (monthsNum / 12) * 100;

  if (monthsNum === 0) {
    return {
      status: "Missing",
      completeness: "0%",
      color: "bg-slate-100 text-slate-700 border-slate-300",
      badgeColor: "bg-slate-200",
      meaning: "No data has been provided. All dependent parameters and scores will remain 0.",
    };
  }

  if (monthsNum >= 12) {
    return {
      status: "Complete",
      completeness: "100%",
      color: "bg-green-50 text-green-700 border-green-300",
      badgeColor: "bg-green-200",
      meaning: "All 12 months of required data have been uploaded and successfully validated.",
    };
  }

  if (monthsNum >= 6) {
    return {
      status: "Partial",
      completeness: `${Math.round(completeness)}%`,
      color: "bg-amber-50 text-amber-700 border-amber-300",
      badgeColor: "bg-amber-200",
      meaning: "Some monthly data is missing, but enough information is available to estimate annual results through annualization.",
    };
  }

  if (monthsNum >= 3) {
    return {
      status: "Low Data",
      completeness: `${Math.round(completeness)}%`,
      color: "bg-orange-50 text-orange-700 border-orange-300",
      badgeColor: "bg-orange-200",
      meaning: "Fewer than 6 months of data are available. Calculated results may have lower accuracy and confidence.",
    };
  }

  if (monthsNum >= 1) {
    return {
      status: "Insufficient",
      completeness: `${Math.round(completeness)}%`,
      color: "bg-red-50 text-red-700 border-red-300",
      badgeColor: "bg-red-200",
      meaning: "There is not enough data to calculate annual readiness. Dependent scores and metrics will be set to 0.",
    };
  }

  return {
    status: "Missing",
    completeness: "0%",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    badgeColor: "bg-slate-200",
    meaning: "No data has been provided. All dependent parameters and scores will remain 0.",
  };
}

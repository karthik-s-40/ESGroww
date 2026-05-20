// KPI utilities
export {
  evaluateEnergyIntensity,
  evaluateWaterIntensity,
  evaluateRecyclingRate,
  evaluateWasteSegregation,
  evaluateRenewableEnergy,
  evaluateTankerWaterDependency,
  evaluateWaterReuse,
  evaluatePowerFactor,
  evaluateDGDependency,
  getStatusColor,
  getStatusBadgeColor,
  type KPIBenchmark,
} from "./kpiUtils";

// Metrics utilities
export {
  getReportForMonths,
  getValidationStatus,
  clampPercentage,
  truncateText,
} from "./metricsUtils";

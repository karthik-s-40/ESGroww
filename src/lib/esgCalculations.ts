// Re-export all engine functions for backward compatibility of imports
export * from "./emissions-engine";
export * from "./benchmark-engine";
export {
	calculateESGReadinessScore,
	calculateCategoryCompleteness,
	calculateConfidenceScore,
	calculateConfidenceLabel,
	annualizeElectricity,
	annualizeWater,
	annualizeFuel,
	annualizeWaste,
	calculateCertificationReadiness,
	determineReadinessStage,
	calculateCategoryScores,
	calculateRegulatoryReadiness,
	identifyStrengthsAndGaps,
	generatePriorityRoadmap,
} from "./calculation-engine";
// Also expose the new centralized calculation utilities for consumers that
// import from `@/lib/esgCalculations` so they automatically get the BRD
// calculation helpers without changing every import site.
export {
	UNIT,
	normalizeUnit,
	convertToStandardUnit,
	validateUnitConsistency,
	formatWithUnit,
	DEFAULTS,
	CONFIDENCE_THRESHOLDS,
	calculateCompleteness,
	calculateOverallCompleteness,
	getConfidenceModifier,
	getEmissionFactor,
	formatEmissionValueTCO2e,
	formatEmissionValueKg,
} from "./calculations";
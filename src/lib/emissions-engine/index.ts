import type { ESGConfiguration } from "../config-engine";

export function calculateScope2Emissions(
  electricityKwh: number,
  config: ESGConfiguration
) {
  const factor = config.emissionFactors["electricity"] ?? config.defaultFactors.electricity;
  return electricityKwh * factor;
}

export function calculateDieselEmissions(
  dgDieselLitres: number,
  config: ESGConfiguration
) {
  const factor = config.emissionFactors["diesel"] ?? config.defaultFactors.diesel;
  return dgDieselLitres * factor;
}

export function calculateTransportEmissions(
  ambulanceFuelLitres: number,
  config: ESGConfiguration
) {
  const factor = config.emissionFactors["ambulancefuel"] ?? config.defaultFactors.ambulanceFuel;
  return ambulanceFuelLitres * factor;
}

export function calculateRefrigerantEmissions(
  refrigerantType: string,
  leakKg: number,
  config: ESGConfiguration
) {
  const typeKey = refrigerantType.toLowerCase();
  let factor = config.emissionFactors[typeKey] ?? 
               config.defaultFactors.refrigerants[typeKey] ?? 
               0;
  return factor * leakKg;
}

export function calculateWasteEmissions(
  totalWasteKg: number,
  config: ESGConfiguration
) {
  const factor = config.emissionFactors["wastekg"] ?? config.defaultFactors.wasteKg;
  return totalWasteKg * factor;
}

export function calculateWaterEmissions(
  totalWaterConsumptionKl: number,
  config: ESGConfiguration
) {
  const factor =
    config.emissionFactors["totalwaterconsumptionkl"] ??
    config.defaultFactors.totalWaterConsumptionKl;
  return totalWaterConsumptionKl * factor;
}

export function calculateRenewablePercentage(
  renewableKwh: number,
  totalElectricityKwh: number
) {
  if (totalElectricityKwh === 0) return 0;
  return Math.min((renewableKwh / totalElectricityKwh) * 100, 100);
}

export function calculateWaterRecyclingPercentage(
  recycledWaterKl: number,
  totalWaterConsumptionKl: number
) {
  if (totalWaterConsumptionKl === 0) return 0;
  return Math.min((recycledWaterKl / totalWaterConsumptionKl) * 100, 100);
}

export function calculateWasteDiversionPercentage(
  recyclableWasteKg: number,
  totalWasteKg: number
) {
  if (totalWasteKg === 0) return 0;
  return Math.min((recyclableWasteKg / totalWasteKg) * 100, 100);
}

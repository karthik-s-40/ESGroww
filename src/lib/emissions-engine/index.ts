import type { ESGConfiguration } from "../config-engine";
import { calculateScope2Emissions as centralCalculateScope2, DEFAULTS } from "../calculations";

export function calculateScope2Emissions(
  electricityKwh: number,
  config?: ESGConfiguration
) {
  const factor = (config as any)?.emissionFactors?.["electricity"] ?? (config as any)?.emission?.electricity ?? config?.defaultFactors?.electricity ?? DEFAULTS.ELECTRICITY_EMISSION_FACTOR_KG_PER_KWH;
  // preserve existing signature: no renewable passed here — if config exposes renewableKwh, use it
  const renewableKwh = (config as any)?.renewableKwh ?? 0;
  const res = centralCalculateScope2(electricityKwh, factor, renewableKwh);
  // return kg CO2e to preserve original usages (original function returned kg)
  return res.kgCO2e;
}

export function calculateDieselEmissions(
  dgDieselLitres: number,
  config?: ESGConfiguration
) {
  const factor = (config as any)?.emissionFactors?.["diesel"] ?? (config as any)?.emission?.diesel ?? config?.defaultFactors?.diesel ?? 0;
  return dgDieselLitres * factor;
}

export function calculateTransportEmissions(
  ambulanceFuelLitres: number,
  config?: ESGConfiguration
) {
  const factor = (config as any)?.emissionFactors?.["ambulancefuel"] ?? (config as any)?.emission?.ambulancefuel ?? config?.defaultFactors?.ambulanceFuel ?? 0;
  return ambulanceFuelLitres * factor;
}

export function calculateRefrigerantEmissions(
  refrigerantType: string,
  leakKg: number,
  config?: ESGConfiguration
) {
  const typeKey = refrigerantType.toLowerCase();
  // Fallback refrigerant GWP defaults used when no config/default provided
  const fallbackRefrigerantFactors: Record<string, number> = {
    r410a: 2088,
    r32: 675,
    r134a: 1430,
  };

  let factor = (config as any)?.emissionFactors?.[typeKey] ?? 
               (config as any)?.defaultFactors?.refrigerants?.[typeKey] ?? 
               (config as any)?.emission?.[typeKey] ??
               fallbackRefrigerantFactors[typeKey] ??
               0;
  return factor * leakKg;
}

export function calculateWasteEmissions(
  totalWasteKg: number,
  config?: ESGConfiguration
) {
  const factor = (config as any)?.emissionFactors?.["wastekg"] ?? (config as any)?.emission?.wastekg ?? config?.defaultFactors?.wasteKg ?? 0;
  return totalWasteKg * factor;
}

export function calculateWaterEmissions(
  totalWaterConsumptionKl: number,
  config?: ESGConfiguration
) {
  const factor = (config as any)?.emissionFactors?.["totalwaterconsumptionkl"] ?? (config as any)?.emission?.totalwaterconsumptionkl ?? config?.defaultFactors?.totalWaterConsumptionKl ?? 0;
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

import {
  annualizeElectricity,
  annualizeFuel,
  annualizeValue,
  annualizeWaste,
  annualizeWater,
  calculateBenchmarkScores,
  calculateCategoryCompleteness,
  calculateCategoryScores,
  calculateCertificationReadiness,
  calculateConfidenceLabel,
  calculateConfidenceScore,
  calculateDieselEmissions,
  calculateESGReadinessScore,
  calculateEnergyPerBed,
  calculateGapAnalysis,
  calculateRegulatoryReadiness,
  calculateRefrigerantEmissions,
  calculateRenewablePercentage,
  calculateScope2Emissions,
  calculateTransportEmissions,
  calculateWaterEmissions,
  calculateWaterPerBed,
  calculateWaterRecyclingPercentage,
  calculateWasteDiversionPercentage,
  calculateWasteEmissions,
  calculateWastePerBed,
  determineReadinessStage,
  generatePriorityRoadmap,
  identifyStrengthsAndGaps,
} from "@/lib/esgCalculations";

describe("esgCalculations", () => {
  describe("confidence scoring", () => {
    test.each([
      [0, 0, "Insufficient data"],
      [2, 0.34, "Low"],
      [3, 0.7, "Medium"],
      [5, 0.7, "Medium"],
      [6, 0.85, "High"],
      [8, 0.85, "High"],
      [9, 0.95, "Very high"],
      [11, 0.95, "Very high"],
      [12, 1, "Very high"],
    ])("maps %s months to confidence %s and label %s", (months, expectedScore, expectedLabel) => {
      expect(calculateConfidenceScore(months)).toBe(expectedScore);
      expect(calculateConfidenceLabel(expectedScore)).toBe(expectedLabel);
    });
  });

  describe("annualization", () => {
    test("annualizes values proportionally and guards division by zero", () => {
      expect(annualizeValue(600, 6)).toBe(1200);
      expect(annualizeValue(600, 0)).toBe(0);
      expect(annualizeElectricity(600, 6)).toBe(1200);
      expect(annualizeWater(300, 3)).toBe(1200);
      expect(annualizeFuel(150, 6)).toBe(300);
      expect(annualizeWaste(90, 9)).toBe(120);
    });
  });

  describe("emissions and intensities", () => {
    test("calculates emissions and intensity helpers deterministically", () => {
      expect(calculateScope2Emissions(1000, { emission: { electricity: 0.5 } })).toBe(0.5);
      expect(calculateDieselEmissions(100, { emission: { diesel: 2.5 } })).toBe(0.25);
      expect(calculateTransportEmissions(20, { emission: { ambulancefuel: 3 } })).toBe(0.06);
      expect(calculateRefrigerantEmissions("R410A", 2)).toBe(4.176);
      expect(calculateRefrigerantEmissions("UNKNOWN", 2)).toBe(0);
      expect(calculateWasteEmissions(100, { emission: { wastekg: 0.8 } })).toBe(0.08);
      expect(calculateWaterEmissions(100, { emission: { totalwaterconsumptionkl: 0.5 } })).toBe(0.05);
      expect(calculateRenewablePercentage(40, 80)).toBe(50);
      expect(calculateRenewablePercentage(10, 0)).toBe(0);
      expect(calculateWaterRecyclingPercentage(25, 50)).toBe(50);
      expect(calculateWasteDiversionPercentage(20, 40)).toBe(50);
      expect(calculateEnergyPerBed(1200, 24)).toBe(50);
      expect(calculateWaterPerBed(240, 24)).toBe(10);
      expect(calculateWastePerBed(120, 24)).toBe(5);
    });
  });

  describe("readiness scoring", () => {
    test("caps ESG readiness and applies coverage ratio", () => {
      expect(
        calculateESGReadinessScore({
          renewablePercentage: 400,
          waterRecyclingPercentage: 400,
          wasteDiversionPercentage: 400,
          hasEsgPolicy: true,
          hasAuditReports: true,
          coverageRatio: 1,
        })
      ).toBe(100);

      expect(
        calculateESGReadinessScore({
          renewablePercentage: 40,
          waterRecyclingPercentage: 40,
          wasteDiversionPercentage: 40,
          hasEsgPolicy: true,
          hasAuditReports: true,
          coverageRatio: 0.5,
        })
      ).toBe(31);
    });

    test("treats certification thresholds as inclusive boundaries", () => {
      const readiness = calculateCertificationReadiness({
        renewablePercentage: 50,
        waterRecyclingPercentage: 40,
        wasteDiversionPercentage: 30,
        governanceScore: 80,
        completeness: 80,
        confidence: 0.8,
        benchmarkScores: { energyIntensityScore: 80 },
      });

      expect(readiness).toEqual(
        expect.objectContaining({
          ISO14001: true,
          ISO50001: false,
          NABH: true,
          IGBC: false,
          LEED: true,
          WELL: true,
          BRSR: true,
          GRI: true,
          CDP: true,
        })
      );
    });

    test("categorizes readiness stages at the published thresholds", () => {
      expect(
        determineReadinessStage({
          completeness: 90,
          confidence: 0.9,
          certificationReady: true,
        })
      ).toBe("Ready for Certification");

      expect(
        determineReadinessStage({
          completeness: 75,
          confidence: 0.75,
          certificationReady: false,
        })
      ).toBe("Advanced");

      expect(
        determineReadinessStage({
          completeness: 50,
          confidence: 0.1,
          certificationReady: false,
        })
      ).toBe("Intermediate");

      expect(
        determineReadinessStage({
          completeness: 49,
          confidence: 0.1,
          certificationReady: false,
        })
      ).toBe("Basic");
    });
  });

  describe("derived scoring utilities", () => {
    test("applies confidence modifiers to category scoring", () => {
      const lowCoverage = calculateCategoryScores({
        renewablePercentage: 40,
        waterRecyclingPercentage: 40,
        wasteDiversionPercentage: 40,
        governanceScore: 72,
        benchmarkScores: { energyIntensityScore: 100 },
        electricityCompleteness: 17,
        waterCompleteness: 100,
        wasteCompleteness: 100,
      });

      const annualizationReady = calculateCategoryScores({
        renewablePercentage: 40,
        waterRecyclingPercentage: 40,
        wasteDiversionPercentage: 40,
        governanceScore: 72,
        benchmarkScores: { energyIntensityScore: 100 },
        electricityCompleteness: 25,
        waterCompleteness: 100,
        wasteCompleteness: 100,
      });

      expect(annualizationReady.energy).toBeGreaterThan(lowCoverage.energy);
      expect(annualizationReady.water).toBe(40);
      expect(annualizationReady.waste).toBe(40);
      expect(annualizationReady.governance).toBe(72);
    });

    test("builds benchmark, regulatory, strength, gap, and roadmap outputs", () => {
      const benchmarkScores = calculateBenchmarkScores({
        industry: "Healthcare",
        renewablePercentage: 50,
        waterRecyclingPercentage: 40,
        wasteDiversionPercentage: 30,
        energyPerBed: 10000,
        waterPerBed: 700,
        wastePerBed: 1000,
      });

      expect(benchmarkScores).toEqual(
        expect.objectContaining({
          renewableScore: 100,
          waterScore: 100,
          wasteScore: 75,
          energyIntensityScore: 100,
          waterIntensityScore: 100,
          wasteIntensityScore: 100,
        })
      );

      expect(
        calculateRegulatoryReadiness({
          renewablePercentage: 50,
          waterRecyclingPercentage: 40,
          wasteDiversionPercentage: 30,
          governanceScore: 70,
          completeness: 80,
          confidence: 0.8,
          benchmarkScores: { energyIntensityScore: 80 },
        })
      ).toEqual(expect.any(Array));

      expect(
        calculateRegulatoryReadiness({
          renewablePercentage: 50,
          waterRecyclingPercentage: 40,
          wasteDiversionPercentage: 30,
          governanceScore: 70,
          completeness: 80,
          confidence: 0.8,
          benchmarkScores: { energyIntensityScore: 80 },
        })
      ).toHaveLength(5);

      const strengthsAndGaps = identifyStrengthsAndGaps({
        renewablePercentage: 10,
        waterRecyclingPercentage: 10,
        wasteDiversionPercentage: 10,
        governanceScore: 50,
        completeness: 40,
        benchmarkScores: { energyIntensityScore: 50 },
        electricityCompleteness: 80,
        waterCompleteness: 20,
        wasteCompleteness: 10,
      });

      expect(strengthsAndGaps.strengths).toContain(
        "Strong electricity data tracking — consistent monthly data available."
      );
      expect(strengthsAndGaps.gaps).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ severity: "High" }),
          expect.objectContaining({ severity: "Medium" }),
        ])
      );

      expect(
        calculateGapAnalysis(
          { energyScore: 60, governanceScore: 55 },
          { energyScore: 80, governanceScore: 50 }
        )
      ).toEqual(
        expect.objectContaining({
          gaps: expect.objectContaining({ energyScore: 20, governanceScore: 0 }),
        })
      );

      expect(
        generatePriorityRoadmap({
          renewablePercentage: 20,
          waterRecyclingPercentage: 10,
          wasteDiversionPercentage: 20,
          governanceScore: 55,
          completeness: 60,
          benchmarkScores: { energyIntensityScore: 50 },
        })
      ).toHaveLength(5);
    });
  });

  describe("completeness helpers", () => {
    test("returns bounded completeness values", () => {
      expect(calculateCategoryCompleteness(6)).toBe(50);
      expect(calculateCategoryCompleteness(18)).toBe(100);
    });
  });
});
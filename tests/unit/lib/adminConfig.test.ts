import { getAdminCalculationFactors } from "@/lib/adminConfig";

jest.mock("@/lib/db", () => ({
  prisma: {
    emissionFactor: { findMany: jest.fn() },
    benchmarkMaster: { findMany: jest.fn() },
    confidenceThreshold: { findMany: jest.fn() },
    scoringWeight: { findMany: jest.fn() },
    certificationCutoff: { findMany: jest.fn() },
    annualizationModifier: { findMany: jest.fn() },
  },
}));

const { prisma: mockPrisma } = jest.requireMock("@/lib/db") as {
  prisma: {
    emissionFactor: { findMany: jest.Mock };
    benchmarkMaster: { findMany: jest.Mock };
    confidenceThreshold: { findMany: jest.Mock };
    scoringWeight: { findMany: jest.Mock };
    certificationCutoff: { findMany: jest.Mock };
    annualizationModifier: { findMany: jest.Mock };
  };
};

describe("getAdminCalculationFactors", () => {
  test("transforms database rows into calculation maps and keeps defaults", async () => {
    mockPrisma.emissionFactor.findMany.mockResolvedValue([
      { sourceType: "Electricity", factorValue: 0.61 },
      { sourceType: "Diesel", factorValue: 2.4 },
    ]);
    mockPrisma.benchmarkMaster.findMany.mockResolvedValue([
      { sectorCode: "HOSP", metricName: "energyIntensity", efficientMax: 120 },
    ]);
    mockPrisma.confidenceThreshold.findMany.mockResolvedValue([{ monthsMin: 3 }]);
    mockPrisma.scoringWeight.findMany.mockResolvedValue([]);
    mockPrisma.certificationCutoff.findMany.mockResolvedValue([]);
    mockPrisma.annualizationModifier.findMany.mockResolvedValue([]);

    const result = await getAdminCalculationFactors();

    expect(result.factors.emission.electricity).toBe(0.61);
    expect(result.factors.emission.diesel).toBe(2.4);
    expect(result.factors.benchmark.HOSP.energyIntensity).toBe(120);
    expect(result.defaultFactors).toEqual(
      expect.objectContaining({ electricity: 0.72, diesel: 2.68, R410A: 2088 })
    );
  });
});
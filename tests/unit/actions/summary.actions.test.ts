/** @jest-environment node */

jest.mock("@/lib/db", () => ({
  prisma: {
    hospital: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("@/lib/adminConfig", () => ({
  getAdminCalculationFactors: jest.fn(),
}));

import { getSummaryData } from "@/actions/summary.actions";

const { getAdminCalculationFactors: mockGetAdminCalculationFactors } = jest.requireMock("@/lib/adminConfig") as {
  getAdminCalculationFactors: jest.Mock;
};

const { prisma: mockPrisma } = jest.requireMock("@/lib/db") as {
  prisma: {
    hospital: {
      findFirst: jest.Mock;
    };
  };
};

describe("getSummaryData", () => {
  test("throws a not-found error when the hospital is missing", async () => {
    mockPrisma.hospital.findFirst.mockResolvedValue(null);
    mockGetAdminCalculationFactors.mockResolvedValue({
      factors: { emission: {}, benchmark: {}, confidence: [], scoring: {}, certification: [], annualization: [] },
      defaultFactors: {},
    });

    await expect(getSummaryData("cycle-1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Hospital not found.",
    });
  });

  test("builds summary output from hospital data and fallback certifications", async () => {
    mockPrisma.hospital.findFirst.mockResolvedValue({
      hospitalName: "City Hospital",
      industry: "Healthcare",
      sectorCode: "HOSP",
      country: "India",
      state: "Maharashtra",
      builtUpArea: 1000,
      numberOfBeds: 100,
      numberOfEmployees: 200,
      averageDailyOccupancy: 80,
      operatingHours: 24,
      numberOfFloors: 5,
      yearEstablished: 2001,
      accountStatus: "Active",
      electricityData: Array.from({ length: 12 }, (_, index) => ({
        month: `M${index + 1}`,
        year: 2025,
        electricityKwh: 100,
        renewableKwh: 50,
      })),
      waterData: Array.from({ length: 12 }, (_, index) => ({
        month: `M${index + 1}`,
        year: 2025,
        waterKl: 100,
        recycledWaterKl: 60,
      })),
      fuelData: Array.from({ length: 12 }, (_, index) => ({
        month: `M${index + 1}`,
        year: 2025,
        dgDieselLitres: 10,
      })),
      wasteData: Array.from({ length: 12 }, (_, index) => ({
        month: `M${index + 1}`,
        year: 2025,
        biomedicalWasteKg: 5,
        recyclableWasteKg: 5,
        landfillWasteKg: 0,
      })),
      refrigerantData: [],
      transportData: [],
      governanceData: { hasEsgPolicy: true },
      certificationScores: [],
      uploads: [],
    });

    mockGetAdminCalculationFactors.mockResolvedValue({
      factors: {
        emission: { electricity: 0.5, diesel: 2, ambulancefuel: 3 },
        benchmark: {},
        confidence: [],
        scoring: {},
        certification: [],
        annualization: [],
      },
      defaultFactors: {},
    });

    const result = await getSummaryData("cycle-1");

    expect(result.hospital).toEqual(
      expect.objectContaining({
        name: "City Hospital",
        industry: "Healthcare",
        beds: 100,
      })
    );
    expect(result.coverage).toEqual(
      expect.objectContaining({
        electricityMonths: 12,
        waterMonths: 12,
        fuelMonths: 12,
        wasteMonths: 12,
      })
    );
    expect(result.percentages).toEqual(
      expect.objectContaining({
        renewablePercentage: 50,
        waterRecyclePercentage: 60,
        recyclableWastePercentage: 50,
      })
    );
    expect(result.scores).toEqual(
      expect.objectContaining({
        socialScore: 85,
        governanceScore: 90,
        overallScore: 91,
      })
    );
    expect(result.readinessStage).toBe("Advanced");
    expect(result.emissions).toEqual(
      expect.objectContaining({
        electricityEmissions: 600,
        dieselEmissions: 240,
        transportEmissions: 0,
        annualizedElectricity: 1200,
      })
    );
    expect(result.checks).toHaveLength(6);
  });
});
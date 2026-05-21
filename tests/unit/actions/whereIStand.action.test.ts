/** @jest-environment node */

const mockGetCurrentUser = jest.fn();

jest.mock("@/lib/db", () => ({
  prisma: {
    hospital: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/getUser", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

import { getWhereIStandData } from "@/actions/whereIStand.action";

const { prisma: mockPrisma } = jest.requireMock("@/lib/db") as {
  prisma: {
    hospital: {
      findUnique: jest.Mock;
    };
  };
};

describe("getWhereIStandData", () => {
  test("throws unauthorized when there is no authenticated user", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(getWhereIStandData("cycle-1")).rejects.toMatchObject({
      statusCode: 401,
      message: "Unauthorized",
    });
  });

  test("returns readiness and current status from uploaded data", async () => {
    mockGetCurrentUser.mockResolvedValue({ hospitalId: "hospital-1" });
    mockPrisma.hospital.findUnique.mockResolvedValue({
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
      electricityData: Array.from({ length: 3 }, (_, index) => ({ month: `M${index + 1}`, year: 2025 })),
      waterData: Array.from({ length: 3 }, (_, index) => ({ month: `M${index + 1}`, year: 2025 })),
      wasteData: Array.from({ length: 3 }, (_, index) => ({ month: `M${index + 1}`, year: 2025 })),
      fuelData: Array.from({ length: 3 }, (_, index) => ({ month: `M${index + 1}`, year: 2025 })),
      refrigerantData: [],
      transportData: [],
      uploads: [],
      governanceData: null,
      esgScores: [],
      assessmentHistory: [],
      certificationScores: [],
    });

    const result = await getWhereIStandData("cycle-1");

    expect(result.annualizationReady).toBe(true);
    expect(result.esgScoringUnlocked).toBe(false);
    expect(result.maxConfidenceReady).toBe(false);
    expect(result.readiness.overall).toBe(58);
    expect(result.currentStatus).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Annualization engine active." }),
        expect.objectContaining({ message: "ESG governance policy pending." }),
      ])
    );
    expect(result.uploadReadiness).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "Electricity", uploaded: 3 }),
        expect.objectContaining({ category: "Water", uploaded: 3 }),
      ])
    );
  });
});
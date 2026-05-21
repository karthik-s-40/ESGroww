const mockGetCurrentUser = jest.fn();
const mockCookies = jest.fn();
import { createMockPrisma } from "../../mocks/prisma";

jest.mock("@/lib/getUser", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

jest.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}));

jest.mock("@/lib/db", () => ({
  prisma: createMockPrisma(),
}));

import { getUploadProgress } from "@/actions/uploadProgress.actions";
import { prisma as mockPrisma } from "@/lib/db";

function createMonthRows(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    month: `M${index + 1}`,
    year: 2025,
  }));
}

describe("getUploadProgress", () => {
  test("returns readiness slices for mixed month coverage", async () => {
    mockGetCurrentUser.mockResolvedValue({ hospitalId: "hospital-1" });
    mockCookies.mockReturnValue({
      get: (key: string) => (key === "activeAssessmentCycleId" ? { value: "cycle-1" } : undefined),
    });

    mockPrisma.hospital.findUnique.mockResolvedValue({
      electricityData: createMonthRows(12),
      waterData: createMonthRows(10),
      fuelData: createMonthRows(7),
      wasteData: createMonthRows(4),
      refrigerantData: createMonthRows(2),
      transportData: [],
      governanceData: {
        hasEsgPolicy: true,
        hasSustainabilityCommittee: true,
        hasAuditReports: true,
        hasComplianceDocs: true,
        createdAt: new Date("2025-01-15T00:00:00.000Z"),
      },
    });

    const result = await getUploadProgress();

    expect(result).not.toBeNull();
    expect(result?.electricity).toBe(12);
    expect(result?.readiness.categories.electricity).toEqual(
      expect.objectContaining({
        annualizationUnlocked: true,
        confidence: 1,
        confidenceLabel: "Very high",
      })
    );
    expect(result?.readiness.categories.water).toEqual(
      expect.objectContaining({
        distinctMonths: 10,
        confidence: 0.95,
        readinessUnlocked: true,
      })
    );
    expect(result?.readiness.categories.fuel).toEqual(
      expect.objectContaining({
        distinctMonths: 7,
        confidence: 0.85,
      })
    );
    expect(result?.readiness.categories.waste).toEqual(
      expect.objectContaining({
        distinctMonths: 4,
        confidence: 0.7,
        annualizationUnlocked: true,
        readinessUnlocked: false,
      })
    );
    expect(result?.readiness.categories.refrigerants).toEqual(
      expect.objectContaining({
        distinctMonths: 2,
        confidence: 0.34,
        annualizationUnlocked: false,
      })
    );
    expect(result?.readiness.categories.transport).toEqual(
      expect.objectContaining({
        distinctMonths: 0,
        confidence: 0,
        confidenceLabel: "Insufficient data",
      })
    );
    expect(result?.readiness.overallReadinessUnlocked).toBe(false);
    expect(result?.readiness.mandatoryGaps).toEqual([
      expect.objectContaining({ category: "waste", distinctMonths: 4, remaining: 2 }),
    ]);
    expect(result?.governance).toEqual(
      expect.objectContaining({
        answeredCount: 4,
        isComplete: true,
        lastUpdated: "2025-01-15T00:00:00.000Z",
      })
    );
  });
});
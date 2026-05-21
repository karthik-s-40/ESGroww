/** @jest-environment node */

import { createMockPrisma } from "../../../mocks/prisma";

jest.mock("@/lib/db", () => ({
  prisma: createMockPrisma(),
}));

import { prisma as mockPrisma } from "@/lib/db";

const mockLogAdminAudit = jest.fn();

jest.mock("@/lib/admin/audit", () => ({
  logAdminAudit: (...args: unknown[]) => mockLogAdminAudit(...args),
}));

import { GET, PATCH } from "@/app/api/admin/system-config/route";

describe("system-config route", () => {
  test("returns system configuration and BRD constants", async () => {
    mockPrisma.benchmarkMaster.findMany.mockResolvedValue([{ id: "b1" }]);
    mockPrisma.emissionFactor.findMany.mockResolvedValue([{ id: "e1" }]);
    mockPrisma.confidenceThreshold.findMany.mockResolvedValue([{ id: "c1" }]);
    mockPrisma.certificationApplicability.findMany.mockResolvedValue([{ id: "a1" }]);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(
      expect.objectContaining({
        brdConstants: {
          BRD_MAX_MONTHS_PER_FILE: 12,
          BRD_MIN_MONTHS_FOR_ANNUALIZATION: 3,
          BRD_MIN_MONTHS_FOR_READINESS_GATE: 6,
        },
        benchmarks: [{ id: "b1" }],
        emissionFactors: [{ id: "e1" }],
        confidenceThresholds: [{ id: "c1" }],
        certificationApplicability: [{ id: "a1" }],
      })
    );
  });

  test("updates a benchmark row and writes an audit log", async () => {
    mockPrisma.benchmarkMaster.findUnique.mockResolvedValue({
      id: "benchmark-1",
      metricName: "energyIntensity",
      sectorCode: "HOSP",
      efficientMax: 100,
    });
    mockPrisma.benchmarkMaster.update.mockResolvedValue({
      id: "benchmark-1",
      metricName: "energyIntensity",
      sectorCode: "HOSP",
      efficientMax: 120,
    });

    const request = new Request("http://localhost/api/admin/system-config", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "benchmark",
        id: "benchmark-1",
        patch: { efficientMax: 120 },
      }),
    });

    const response = await PATCH(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      row: {
        id: "benchmark-1",
        metricName: "energyIntensity",
        sectorCode: "HOSP",
        efficientMax: 120,
      },
    });
    expect(mockPrisma.benchmarkMaster.update).toHaveBeenCalledWith({
      where: { id: "benchmark-1" },
      data: { efficientMax: 120 },
    });
    expect(mockLogAdminAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "benchmark.update",
        entityType: "BenchmarkMaster",
        entityId: "benchmark-1",
      })
    );
  });
});
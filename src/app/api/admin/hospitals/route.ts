import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { confidenceFromDistinctMonths } from "@/lib/admin/confidence";

export async function GET() {
  try {
    const thresholds = await prisma.confidenceThreshold.findMany({ orderBy: { monthsMin: "asc" } });

    const hospitals = await prisma.hospital.findMany({
      include: {
        esgScores: { orderBy: { createdAt: "desc" }, take: 1 },
        certificationScores: { orderBy: { updatedAt: "desc" }, take: 6 },
        assessmentHistory: { orderBy: { createdAt: "desc" }, take: 1 },
        emissionsSummary: {
          select: { tCO2e: true },
        },
        _count: {
          select: {
            uploads: true,
            validationResults: true,
            electricityData: true,
            waterData: true,
            wasteData: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const payload = hospitals.map((h) => {
      const elec = h._count.electricityData;
      const water = h._count.waterData;
      const waste = h._count.wasteData;
      const monthsPrimary = Math.max(elec, water, waste);
      const conf = confidenceFromDistinctMonths(monthsPrimary, thresholds);
      const footprint = h.emissionsSummary.reduce((s, e) => s + e.tCO2e, 0);
      const latest = h.assessmentHistory[0];

      return {
        id: h.id,
        hospitalName: h.hospitalName,
        sectorCode: h.sectorCode,
        accountStatus: h.accountStatus,
        industry: h.industry,
        country: h.country,
        state: h.state,
        builtUpArea: h.builtUpArea,
        numberOfBeds: h.numberOfBeds,
        numberOfEmployees: h.numberOfEmployees,
        averageDailyOccupancy: h.averageDailyOccupancy,
        operatingHours: h.operatingHours,
        yearEstablished: h.yearEstablished,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
        esgScore: h.esgScores[0] ?? null,
        certificationPreview: h.certificationScores,
        latestAssessment: latest
          ? {
              id: latest.id,
              createdAt: latest.createdAt,
              completenessPct: latest.completenessPct,
              confidenceScore: latest.confidenceScore,
              readinessStage: latest.readinessStage,
            }
          : null,
        uploadsCount: h._count.uploads,
        validationCount: h._count.validationResults,
        dataCoverageMonthsMax: monthsPrimary,
        confidenceLabel: conf.label,
        emissionsFootprintTCO2e: Math.round(footprint * 1000) / 1000,
      };
    });

    return NextResponse.json(payload);
  } catch (e) {
    console.error("hospitals", e);
    return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
  }
}

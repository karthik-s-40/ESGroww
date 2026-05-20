import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BRD_MIN_MONTHS_FOR_READINESS_GATE } from "@/lib/upload/brdConstants";

/** Executive dashboard aggregates — all Prisma-backed. */
export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      hospitalsCount,
      assessmentCount,
      uploadsCount,
      batchesRecent,
      validationPending,
      validationFails,
      latestAssessments,
      readinessStages,
      certScores,
      emissionsAgg,
      uploadTrend,
      recentValidations,
      recentAssessments,
    ] = await Promise.all([
      prisma.hospital.count(),
      prisma.assessmentHistory.count(),
      prisma.upload.count(),
      prisma.dataUploadBatch.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.validationResult.count({
        where: { status: { in: ["Partial", "Fail"] } },
      }),
      prisma.validationResult.count({ where: { status: "Fail" } }),
      prisma.assessmentHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: 80,
        select: { completenessPct: true, confidenceScore: true, readinessStage: true },
      }),
      prisma.assessmentHistory.groupBy({
        by: ["readinessStage"],
        _count: true,
        where: { readinessStage: { not: null } },
      }),
      prisma.certificationScore.findMany({
        select: { readinessPercent: true, statusLabel: true, certificationName: true },
      }),
      prisma.emissionsSummary.groupBy({
        by: ["scope"],
        _sum: { tCO2e: true },
      }),
      prisma.$queryRaw<{ day: Date; c: bigint }[]>`
          SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS c
          FROM "DataUploadBatch"
          WHERE "createdAt" >= ${thirtyDaysAgo}
          GROUP BY 1
          ORDER BY 1 ASC
        `.then((rows) => rows.map((r) => ({ day: r.day.toISOString(), count: Number(r.c) }))),
      prisma.validationResult.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { hospital: { select: { hospitalName: true } } },
      }),
      prisma.assessmentHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { hospital: { select: { hospitalName: true } } },
      }),
    ]);

    const activeAssessments = latestAssessments.filter(
      (a) =>
        (a.completenessPct ?? 0) > 0 &&
        (a.completenessPct ?? 0) < 100 &&
        (a.confidenceScore ?? 0) > 0
    ).length;

    const readinessDistribution = readinessStages
      .filter((r) => r.readinessStage)
      .map((r) => ({
        stage: r.readinessStage as string,
        count: r._count,
      }));

    const certByStatus: Record<string, number> = {};
    for (const c of certScores) {
      certByStatus[c.statusLabel] = (certByStatus[c.statusLabel] ?? 0) + 1;
    }

    const certificationDistribution = Object.entries(certByStatus).map(([statusLabel, count]) => ({
      statusLabel,
      count,
    }));

    const emissionsSummary = emissionsAgg.map((e) => ({
      scope: e.scope,
      tCO2e: e._sum.tCO2e ?? 0,
    }));

    const totalTCO2e = emissionsSummary.reduce((s, x) => s + x.tCO2e, 0);

    const pendingValidations = validationPending;

    const hospitalsWithLowGate = await prisma.hospital.count({
      where: {
        OR: [
          { electricityData: { none: {} } },
          { waterData: { none: {} } },
          { wasteData: { none: {} } },
        ],
      },
    });

    return NextResponse.json({
      kpis: {
        organizations: hospitalsCount,
        activeAssessments,
        pendingValidations,
        failedUploadValidations: validationFails,
        dataUploadBatches30d: batchesRecent,
        totalUploads: uploadsCount,
        assessmentsRun: assessmentCount,
        organizationsBelowReadinessData: hospitalsWithLowGate,
        brdReadinessMonthGate: BRD_MIN_MONTHS_FOR_READINESS_GATE,
      },
      readinessDistribution,
      certificationDistribution,
      emissions: { byScope: emissionsSummary, totalTCO2e },
      uploadTrend,
      validationAnomalies: recentValidations.map((v) => ({
        id: v.id,
        createdAt: v.createdAt,
        hospitalName: v.hospital.hospitalName,
        category: v.category,
        checkType: v.checkType,
        status: v.status,
        affectedMonth: v.affectedMonth,
        affectedYear: v.affectedYear,
        notes: v.notes,
      })),
      recentReports: recentAssessments.map((a) => ({
        id: a.id,
        createdAt: a.createdAt,
        hospitalName: a.hospital.hospitalName,
        completenessPct: a.completenessPct,
        confidenceScore: a.confidenceScore,
        readinessStage: a.readinessStage,
      })),
    });
  } catch (e) {
    console.error("overview", e);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}

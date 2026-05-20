import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rows = await prisma.assessmentHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        hospital: { select: { hospitalName: true, sectorCode: true } },
      },
    });

    return NextResponse.json({
      reports: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        hospitalId: r.hospitalId,
        hospitalName: r.hospital.hospitalName,
        sectorCode: r.hospital.sectorCode,
        completenessPct: r.completenessPct,
        confidenceScore: r.confidenceScore,
        readinessStage: r.readinessStage,
        hasAnnualized: !!r.annualizedValues,
        hasBenchmarks: !!r.benchmarkScores,
        hasCertification: !!r.certificationReadiness,
        hasGap: !!r.gapAnalysis,
      })),
    });
  } catch (e) {
    console.error("reports", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

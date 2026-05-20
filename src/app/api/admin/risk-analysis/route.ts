import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function riskLevel(score: number | null | undefined): "Low" | "Medium" | "High" {
  if (score == null) return "High";
  if (score >= 70) return "Low";
  if (score >= 45) return "Medium";
  return "High";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");

    const hospitals = await prisma.hospital.findMany({
      select: { id: true, hospitalName: true, sectorCode: true },
      orderBy: { hospitalName: "asc" },
    });

    const hid =
      hospitalId && hospitalId !== "all" ? hospitalId : undefined;

    const [validations, assessments, metrics, certScores, govGaps] = await Promise.all([
      prisma.validationResult.findMany({
        where: {
          status: { in: ["Fail", "Partial"] },
          ...(hid ? { hospitalId: hid } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 150,
        include: { hospital: { select: { hospitalName: true, sectorCode: true } } },
      }),
      prisma.assessmentHistory.findMany({
        where: hid ? { hospitalId: hid } : {},
        orderBy: { createdAt: "desc" },
        take: 80,
        include: { hospital: { select: { hospitalName: true, sectorCode: true } } },
      }),
      prisma.calculatedMetric.findMany({
        where: {
          ...(hid ? { hospitalId: hid } : {}),
          OR: [{ benchmarkStatus: "Above" }, { benchmarkStatus: "Slightly Below" }],
        },
        take: 120,
        include: { hospital: { select: { hospitalName: true, sectorCode: true } } },
      }),
      prisma.certificationScore.findMany({
        where: {
          ...(hid ? { hospitalId: hid } : {}),
          readinessPercent: { lt: 55 },
        },
        orderBy: { readinessPercent: "asc" },
        take: 80,
        include: { hospital: { select: { hospitalName: true, sectorCode: true } } },
      }),
      prisma.governanceData.findMany({
        where: {
          ...(hid ? { hospitalId: hid } : {}),
          OR: [
            { hasEsgPolicy: false },
            { hasSustainabilityCommittee: false },
            { hasAuditReports: false },
            { hasComplianceDocs: false },
          ],
        },
        take: 100,
        include: { hospital: { select: { hospitalName: true, sectorCode: true } } },
      }),
    ]);

    const lowConfidence = assessments.filter(
      (a) => (a.confidenceScore ?? 0) < 0.65 && (a.confidenceScore ?? 0) > 0
    );

    const sectorClusters = validations.reduce<Record<string, number>>((acc, v) => {
      const s = v.hospital.sectorCode;
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      hospitals,
      complianceRisks: validations.map((v) => ({
        id: v.id,
        type: "validation",
        severity: v.status === "Fail" ? "High" : "Medium",
        title: `${v.checkType.replace(/_/g, " ")} — ${v.category}`,
        hospitalName: v.hospital.hospitalName,
        sectorCode: v.hospital.sectorCode,
        affectedMonth: v.affectedMonth,
        affectedYear: v.affectedYear,
        notes: v.notes,
        createdAt: v.createdAt,
      })),
      lowConfidenceAssessments: lowConfidence.map((a) => ({
        id: a.id,
        hospitalName: a.hospital.hospitalName,
        sectorCode: a.hospital.sectorCode,
        confidenceScore: a.confidenceScore,
        completenessPct: a.completenessPct,
        createdAt: a.createdAt,
        risk: riskLevel((a.confidenceScore ?? 0) * 100),
      })),
      benchmarkViolations: metrics.map((m) => ({
        id: m.id,
        hospitalName: m.hospital.hospitalName,
        sectorCode: m.hospital.sectorCode,
        metricName: m.metricName,
        benchmarkStatus: m.benchmarkStatus,
        annualizedValue: m.annualizedValue,
        unit: m.unit,
        confidenceModifier: m.confidenceModifier,
      })),
      certificationGaps: certScores.map((c) => ({
        id: c.id,
        hospitalName: c.hospital.hospitalName,
        certificationName: c.certificationName,
        readinessPercent: c.readinessPercent,
        statusLabel: c.statusLabel,
        majorGap: c.majorGap,
      })),
      governanceGaps: govGaps.map((g) => ({
        hospitalName: g.hospital.hospitalName,
        sectorCode: g.hospital.sectorCode,
        missing: [
          !g.hasEsgPolicy && "ESG policy",
          !g.hasSustainabilityCommittee && "Sustainability committee",
          !g.hasAuditReports && "Audit reports",
          !g.hasComplianceDocs && "Compliance documentation",
        ].filter(Boolean),
      })),
      sectorValidationClusters: Object.entries(sectorClusters).map(([sectorCode, count]) => ({
        sectorCode,
        openValidationSignals: count,
      })),
    });
  } catch (e) {
    console.error("risk-analysis", e);
    return NextResponse.json({ error: "Failed to load risk intelligence" }, { status: 500 });
  }
}

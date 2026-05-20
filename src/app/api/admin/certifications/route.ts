import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");
    const sector = searchParams.get("sector");

    const applicability = await prisma.certificationApplicability.findMany({
      where: sector ? { sectorCode: sector } : undefined,
      orderBy: [{ sectorCode: "asc" }, { certificationName: "asc" }],
    });

    const hospitals = await prisma.hospital.findMany({
      select: { id: true, hospitalName: true, sectorCode: true },
      orderBy: { hospitalName: "asc" },
    });

    const whereScore =
      hospitalId && hospitalId !== "all"
        ? { hospitalId }
        : {};

    const scores = await prisma.certificationScore.findMany({
      where: whereScore,
      include: { hospital: { select: { hospitalName: true, sectorCode: true } } },
      orderBy: { updatedAt: "desc" },
      take: hospitalId && hospitalId !== "all" ? 200 : 500,
    });

    const byFramework: Record<string, { sum: number; n: number }> = {};
    for (const s of scores) {
      const cur = byFramework[s.certificationName] ?? { sum: 0, n: 0 };
      cur.sum += s.readinessPercent;
      cur.n += 1;
      byFramework[s.certificationName] = cur;
    }

    const frameworkAnalytics = Object.entries(byFramework).map(([certificationName, v]) => ({
      certificationName,
      avgReadiness: v.n ? Math.round((v.sum / v.n) * 10) / 10 : 0,
      records: v.n,
    }));

    return NextResponse.json({
      hospitals,
      applicability,
      scores,
      frameworkAnalytics: frameworkAnalytics.sort((a, b) => b.avgReadiness - a.avgReadiness),
    });
  } catch (e) {
    console.error("certifications", e);
    return NextResponse.json({ error: "Failed to load certifications" }, { status: 500 });
  }
}

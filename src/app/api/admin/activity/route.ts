import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [batches, uploads, assessments, validations] = await Promise.all([
      prisma.dataUploadBatch.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
        include: { hospital: { select: { hospitalName: true } } },
      }),
      prisma.upload.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        include: { hospital: { select: { hospitalName: true } } },
      }),
      prisma.assessmentHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { hospital: { select: { hospitalName: true } } },
      }),
      prisma.validationResult.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        where: { status: { in: ["Fail", "Partial"] } },
        include: { hospital: { select: { hospitalName: true } } },
      }),
    ]);

    const items: {
      id: string;
      ts: string;
      kind: string;
      title: string;
      detail: string;
      severity: "info" | "success" | "warning" | "critical";
    }[] = [];

    for (const b of batches) {
      items.push({
        id: `batch-${b.id}`,
        ts: b.createdAt.toISOString(),
        kind: "ingestion",
        title: `Batch committed — ${b.category}`,
        detail: `${b.hospital.hospitalName} · ${b.rowCount} rows · v${b.batchVersion}`,
        severity: b.isSuperseded ? "warning" : "success",
      });
    }
    for (const u of uploads) {
      items.push({
        id: `upload-${u.id}`,
        ts: u.createdAt.toISOString(),
        kind: "upload",
        title: `Upload recorded — ${u.category}`,
        detail: `${u.hospital.hospitalName} · ${u.month} ${u.year}`,
        severity: u.isReplaced ? "warning" : "info",
      });
    }
    for (const a of assessments) {
      items.push({
        id: `assess-${a.id}`,
        ts: a.createdAt.toISOString(),
        kind: "assessment",
        title: `Assessment snapshot`,
        detail: `${a.hospital.hospitalName} · stage ${a.readinessStage ?? "n/a"}`,
        severity: "info",
      });
    }
    for (const v of validations) {
      items.push({
        id: `val-${v.id}`,
        ts: v.createdAt.toISOString(),
        kind: "validation",
        title: `Validation ${v.status} — ${v.checkType}`,
        detail: `${v.hospital.hospitalName} · ${v.category}`,
        severity: v.status === "Fail" ? "critical" : "warning",
      });
    }

    items.sort((a, b) => (a.ts < b.ts ? 1 : -1));

    return NextResponse.json({ items: items.slice(0, 40) });
  } catch (e) {
    console.error("activity", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

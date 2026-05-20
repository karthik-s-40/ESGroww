import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [adminLogs, batches, validations] = await Promise.all([
      prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.dataUploadBatch.findMany({
        orderBy: { createdAt: "desc" },
        take: 60,
        include: { hospital: { select: { hospitalName: true } } },
      }),
      prisma.validationResult.findMany({
        orderBy: { createdAt: "desc" },
        take: 60,
        include: { hospital: { select: { hospitalName: true } } },
      }),
    ]);

    const lines: {
      id: string;
      ts: string;
      source: "config" | "ingestion" | "validation";
      summary: string;
      meta?: string;
    }[] = [];

    for (const a of adminLogs) {
      lines.push({
        id: a.id,
        ts: a.createdAt.toISOString(),
        source: "config",
        summary: a.summary,
        meta: `${a.entityType} · ${a.action}`,
      });
    }
    for (const b of batches) {
      lines.push({
        id: `b-${b.id}`,
        ts: b.createdAt.toISOString(),
        source: "ingestion",
        summary: `${b.hospital.hospitalName} — ${b.category} batch v${b.batchVersion}`,
        meta: `${b.rowCount} rows${b.fileContentHash ? ` · hash ${b.fileContentHash.slice(0, 8)}…` : ""}`,
      });
    }
    for (const v of validations) {
      lines.push({
        id: `v-${v.id}`,
        ts: v.createdAt.toISOString(),
        source: "validation",
        summary: `${v.hospital.hospitalName} — ${v.checkType} (${v.status})`,
        meta: v.notes ?? undefined,
      });
    }

    lines.sort((a, b) => (a.ts < b.ts ? 1 : -1));

    return NextResponse.json({ items: lines.slice(0, 120) });
  } catch (e) {
    console.error("audit-logs", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 1. Count registered hospitals/organizations
    const hospitalsCount = await prisma.hospital.count();

    // 2. Calculate average ESG score across all hospitals
    const esgScores = await prisma.eSGScore.findMany({
      select: { overallScore: true },
    });

    const avgEsgScore =
      esgScores.length > 0
        ? esgScores.reduce((sum, score) => sum + score.overallScore, 0) / esgScores.length
        : 0;

    // 3. Count total uploads
    const uploadsCount = await prisma.upload.count();

    // 4. Count unique certifications
    const certificationsCount = await prisma.certificationScore.findMany({
      select: { certificationName: true },
      distinct: ['certificationName'],
    });

    return NextResponse.json({
      hospitals: hospitalsCount,
      esgScore: avgEsgScore,
      uploads: uploadsCount,
      frameworks: certificationsCount.length,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', hospitals: 0, esgScore: 0, uploads: 0, frameworks: 0 },
      { status: 500 }
    );
  }
}

//src\actions\whereIStand.action.ts
"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getUser";

function distinctMonths(
  rows: {
    month: string;
    year: number;
  }[]
) {
  return new Set(
    rows.map(
      (r) =>
        `${r.month}-${r.year}`
    )
  ).size;
}

function confidenceLabel(
  score: number
) {
  if (score >= 90)
    return "Maximum";

  if (score >= 75)
    return "High";

  if (score >= 60)
    return "Moderate";

  if (score >= 40)
    return "Developing";

  return "Low";
}

export async function getWhereIStandData() {
  const user =
    await getCurrentUser();

  if (!user?.hospitalId) {
    throw new Error(
      "Unauthorized"
    );
  }

  const hospital =
    await prisma.hospital.findUnique({
      where: {
        id: String(
          user.hospitalId
        ),
      },

      include: {
        electricityData: true,
        waterData: true,
        wasteData: true,
        fuelData: true,
        refrigerantData: true,
        transportData: true,

        uploads: {
          orderBy: {
            createdAt: "desc",
          },

          take: 20,
        },

        governanceData: true,

        esgScores: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },

        assessmentHistory: {
          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },

        certificationScores: true,
      },
    });

  if (!hospital) {
    throw new Error(
      "Hospital not found"
    );
  }

  /* -------------------------------- */
  /* DISTINCT MONTH COUNTS            */
  /* -------------------------------- */

  const electricityMonths =
    distinctMonths(
      hospital.electricityData
    );

  const waterMonths =
    distinctMonths(
      hospital.waterData
    );

  const wasteMonths =
    distinctMonths(
      hospital.wasteData
    );

  const fuelMonths =
    distinctMonths(
      hospital.fuelData
    );

  /* -------------------------------- */
  /* ESG READINESS LOGIC              */
  /* -------------------------------- */

  const annualizationReady =
    electricityMonths >= 3 ||
    waterMonths >= 3 ||
    wasteMonths >= 3;

  const esgScoringUnlocked =
    electricityMonths >= 6 &&
    waterMonths >= 6 &&
    wasteMonths >= 6;

  const maxConfidenceReady =
    electricityMonths >= 12 &&
    waterMonths >= 12 &&
    wasteMonths >= 12;

  /* -------------------------------- */
  /* SCORES                           */
  /* -------------------------------- */

  const latestAssessment =
    hospital
      .assessmentHistory?.[0];

  const latestScore =
    hospital.esgScores?.[0];
  // confidence score (from latest assessment) expressed as percentage
  const confidenceScore =
    Math.round(
      Number(
        latestAssessment
          ?.confidenceScore ||
          0
      ) * 100
    );

  /* -------------------------------- */
  /* PROFILE COMPLETION               */
  /* -------------------------------- */

  const profileFields = [
    hospital.hospitalName,
    hospital.industry,
    hospital.country,
    hospital.state,
    hospital.builtUpArea,
    hospital.numberOfBeds,
    hospital.numberOfEmployees,
    hospital.averageDailyOccupancy,
    hospital.operatingHours,
    hospital.numberOfFloors,
    hospital.yearEstablished,
  ];

  const completedFields =
    profileFields.filter(
      (v) =>
        v !== null &&
        v !== undefined &&
        v !== "" &&
        v !== 0
    ).length;

  const profileCompletion =
    Math.round(
      (completedFields /
        profileFields.length) *
        100
    );

  /* -------------------------------- */
  /* UPLOAD COMPLETION                */
  /* -------------------------------- */

  const uploadCompletion =
    Math.round(
      ((electricityMonths +
        waterMonths +
        wasteMonths +
        fuelMonths) /
        48) *
        100
    );

  // Fallback readiness calculation when ESG score not present
  function fallbackReadiness(profilePct: number, uploadPct: number, confidencePct: number) {
    const val = (0.5 * profilePct) + (0.3 * uploadPct) + (0.2 * confidencePct);
    return Math.round(Math.max(0, Math.min(100, val)));
  }

  const finalReadinessScore = (typeof latestScore?.overallScore === "number" && latestScore?.overallScore > 0)
    ? Math.round(latestScore.overallScore)
    : fallbackReadiness(profileCompletion, uploadCompletion, confidenceScore);

  /* -------------------------------- */
  /* CURRENT STATUS                   */
  /* -------------------------------- */

  const currentStatus =
    [];

  if (
    electricityMonths >= 12
  ) {
    currentStatus.push({
      type: "success",

      message:
        "Electricity dataset complete.",
    });
  }

  if (
    waterMonths < 6
  ) {
    currentStatus.push({
      type: "warning",

      message: `Water ESG readiness requires ${
        6 - waterMonths
      } more months.`,
    });
  }

  if (
    annualizationReady
  ) {
    currentStatus.push({
      type: "success",

      message:
        "Annualization engine active.",
    });
  }

  if (
    esgScoringUnlocked
  ) {
    currentStatus.push({
      type: "success",

      message:
        "ESG scoring engine unlocked.",
    });
  }

  if (
    maxConfidenceReady
  ) {
    currentStatus.push({
      type: "success",

      message:
        "Maximum confidence threshold achieved.",
    });
  }

  if (
    !hospital.governanceData
      ?.hasEsgPolicy
  ) {
    currentStatus.push({
      type: "danger",

      message:
        "ESG governance policy pending.",
    });
  }

  /* -------------------------------- */
  /* ROADMAP                          */
  /* -------------------------------- */

  const roadmap = [];

  if (
    electricityMonths < 12
  ) {
    roadmap.push({
      priority:
        "High",

      action: `Upload ${
        12 -
        electricityMonths
      } more months of Electricity data`,

      impact:
        "Improves confidence and benchmark intelligence.",
    });
  }

  if (
    waterMonths < 12
  ) {
    roadmap.push({
      priority:
        "High",

      action: `Upload ${
        12 - waterMonths
      } more months of Water data`,

      impact:
        "Improves water benchmark quality.",
    });
  }

  if (
    !hospital.governanceData
      ?.hasSustainabilityCommittee
  ) {
    roadmap.push({
      priority:
        "Critical",

      action:
        "Create sustainability committee.",

      impact:
        "Improves governance maturity.",
    });
  }

  if (
    !hospital.governanceData
      ?.hasEsgPolicy
  ) {
    roadmap.push({
      priority:
        "Critical",

      action:
        "Complete ESG governance documentation.",

      impact:
        "Required for certifications.",
    });
  }

  /* -------------------------------- */
  /* CERTIFICATIONS                   */
  /* -------------------------------- */

  let certifications =
    hospital.certificationScores.map(
      (cert) => ({
        name:
          cert.certificationName,

        readiness:
          cert.readinessPercent,

        status:
          cert.statusLabel,

        timeline:
          cert.recommendedTimeline,

        gap:
          cert.majorGap,
      })
    );

  if (
    certifications.length ===
    0
  ) {
    certifications = [
      {
        name: "NABH",

        readiness:
          finalReadinessScore >=
          75
            ? 80
            : finalReadinessScore >=
              60
            ? 65
            : 35,

        status:
          esgScoringUnlocked
            ? "Assessment Ready"
            : "Insufficient ESG Data",

        timeline:
          "6-12 Months",

        gap:
          "Governance evidence incomplete.",
      },

      {
        name: "ISO 14001",

        readiness:
          confidenceScore >=
          70
            ? 70
            : 45,

        status:
          confidenceScore >=
          70
            ? "Developing"
            : "Low Confidence",

        timeline:
          "6-12 Months",

        gap:
          "Environmental process tracking incomplete.",
      },

      {
        name: "IGBC",

        readiness:
          uploadCompletion >=
          70
            ? 68
            : 40,

        status:
          uploadCompletion >=
          70
            ? "Progressing"
            : "Low Readiness",

        timeline:
          "12 Months",

        gap:
          "Operational sustainability metrics insufficient.",
      },
    ];
  }

  /* -------------------------------- */
  /* TIMELINE                         */
  /* -------------------------------- */

  const timeline =
    hospital.uploads.map(
      (upload) => ({
        title: `${upload.category} upload processed`,

        date:
          upload.createdAt.toISOString(),

        category:
          upload.category,
      })
    );

  /* -------------------------------- */
  /* RETURN                           */
  /* -------------------------------- */

  return {
    organization: {
      hospitalName:
        hospital.hospitalName,

      industry:
        hospital.industry,

      sectorCode:
        hospital.sectorCode,

      country:
        hospital.country,

      state:
        hospital.state,

      builtUpArea:
        hospital.builtUpArea,

      numberOfBeds:
        hospital.numberOfBeds,

      numberOfEmployees:
        hospital.numberOfEmployees,

      averageDailyOccupancy:
        hospital.averageDailyOccupancy,

      operatingHours:
        hospital.operatingHours,

      numberOfFloors:
        hospital.numberOfFloors,

      yearEstablished:
        hospital.yearEstablished,

      accountStatus:
        hospital.accountStatus,
    },

    readiness: {
      overall:
        finalReadinessScore,

      confidence:
        confidenceScore,

      confidenceLabel:
        confidenceLabel(
          confidenceScore
        ),
    },

    profileCompletion,

    uploadCompletion,

    annualizationReady,

    esgScoringUnlocked,

    maxConfidenceReady,

    readinessLogic: {
      uploadsAllowed:
        "1+ months",

      annualization:
        "3+ months",

      esgScoring:
        "6+ months",

      maximumConfidence:
        "12 months",
    },

    currentStatus,

    uploadReadiness: [
      {
        category:
          "Electricity",

        uploaded:
          electricityMonths,

        recommended: 12,
      },

      {
        category: "Water",

        uploaded:
          waterMonths,

        recommended: 12,
      },

      {
        category: "Waste",

        uploaded:
          wasteMonths,

        recommended: 12,
      },

      {
        category: "Fuel",

        uploaded:
          fuelMonths,

        recommended: 12,
      },
    ],

    certifications,

    roadmap,

    timeline,
  };
}
/*
  Warnings:

  - Added the required column `updatedAt` to the `Hospital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "accountStatus" TEXT NOT NULL DEFAULT 'Pending Verification',
ADD COLUMN     "averageDailyOccupancy" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'India',
ADD COLUMN     "numberOfEmployees" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfFloors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "operatingHours" DOUBLE PRECISION NOT NULL DEFAULT 24,
ADD COLUMN     "sectorCode" TEXT NOT NULL DEFAULT 'HOSP',
ADD COLUMN     "state" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "yearEstablished" INTEGER NOT NULL DEFAULT 2020;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'hospital_admin',
    "hospitalId" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpiry" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordExpiry" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "accountLockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "rememberMeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentHistory" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completenessPct" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "annualizedValues" JSONB,
    "benchmarkScores" JSONB,
    "certificationReadiness" JSONB,
    "gapAnalysis" JSONB,
    "readinessStage" TEXT,

    CONSTRAINT "AssessmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationResult" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "affectedMonth" TEXT,
    "affectedYear" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationScore" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "readinessPercent" DOUBLE PRECISION NOT NULL,
    "statusLabel" TEXT NOT NULL,
    "majorGap" TEXT,
    "recommendedTimeline" TEXT,
    "prerequisitesMetJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculatedMetric" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "rawValue" DOUBLE PRECISION,
    "annualizedValue" DOUBLE PRECISION,
    "unit" TEXT NOT NULL,
    "confidenceModifier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "benchmarkStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculatedMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmissionsSummary" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "kgCO2e" DOUBLE PRECISION NOT NULL,
    "tCO2e" DOUBLE PRECISION NOT NULL,
    "factorUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmissionsSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationApplicability" (
    "id" TEXT NOT NULL,
    "sectorCode" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "importanceLevel" TEXT NOT NULL,

    CONSTRAINT "CertificationApplicability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkMaster" (
    "id" TEXT NOT NULL,
    "sectorCode" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "efficientMax" DOUBLE PRECISION NOT NULL,
    "acceptableMin" DOUBLE PRECISION NOT NULL,
    "acceptableMax" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "BenchmarkMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmissionFactor" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'India',
    "factorValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "overrideAllowed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmissionFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfidenceThreshold" (
    "id" TEXT NOT NULL,
    "monthsMin" INTEGER NOT NULL,
    "monthsMax" INTEGER NOT NULL,
    "modifier" DOUBLE PRECISION NOT NULL,
    "confidenceLabel" TEXT NOT NULL,

    CONSTRAINT "ConfidenceThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AssessmentHistory_hospitalId_idx" ON "AssessmentHistory"("hospitalId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationApplicability_sectorCode_certificationName_key" ON "CertificationApplicability"("sectorCode", "certificationName");

-- CreateIndex
CREATE UNIQUE INDEX "BenchmarkMaster_sectorCode_metricName_key" ON "BenchmarkMaster"("sectorCode", "metricName");

-- CreateIndex
CREATE UNIQUE INDEX "EmissionFactor_sourceType_region_key" ON "EmissionFactor"("sourceType", "region");

-- CreateIndex
CREATE UNIQUE INDEX "ConfidenceThreshold_monthsMin_monthsMax_key" ON "ConfidenceThreshold"("monthsMin", "monthsMax");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentHistory" ADD CONSTRAINT "AssessmentHistory_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationResult" ADD CONSTRAINT "ValidationResult_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationScore" ADD CONSTRAINT "CertificationScore_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculatedMetric" ADD CONSTRAINT "CalculatedMetric_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionsSummary" ADD CONSTRAINT "EmissionsSummary_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

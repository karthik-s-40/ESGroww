/*
  Warnings:

  - A unique constraint covering the columns `[hospitalId,month,year,assessmentCycleId]` on the table `ElectricityData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year,assessmentCycleId]` on the table `FuelData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year,refrigerantType,assessmentCycleId]` on the table `RefrigerantData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year,assessmentCycleId]` on the table `TransportData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year,assessmentCycleId]` on the table `WasteData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year,assessmentCycleId]` on the table `WaterData` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ElectricityData_hospitalId_month_year_key";

-- DropIndex
DROP INDEX "FuelData_hospitalId_month_year_key";

-- DropIndex
DROP INDEX "RefrigerantData_hospitalId_month_year_refrigerantType_key";

-- DropIndex
DROP INDEX "TransportData_hospitalId_month_year_key";

-- DropIndex
DROP INDEX "WasteData_hospitalId_month_year_key";

-- DropIndex
DROP INDEX "WaterData_hospitalId_month_year_key";

-- AlterTable
ALTER TABLE "AssessmentHistory" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "CalculatedMetric" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "CertificationScore" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "DataUploadBatch" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "ESGScore" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "ElectricityData" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "EmissionsSummary" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "FuelData" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "RefrigerantData" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "TransportData" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "ValidationResult" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "WasteData" ADD COLUMN     "assessmentCycleId" TEXT;

-- AlterTable
ALTER TABLE "WaterData" ADD COLUMN     "assessmentCycleId" TEXT;

-- CreateTable
CREATE TABLE "AssessmentCycle" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringWeight" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "weightValue" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationCutoff" (
    "id" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "minCompleteness" DOUBLE PRECISION,
    "minConfidence" DOUBLE PRECISION,
    "minGovernance" DOUBLE PRECISION,
    "minRenewable" DOUBLE PRECISION,
    "minWaterRecycled" DOUBLE PRECISION,
    "minWasteDiversion" DOUBLE PRECISION,
    "minEnergyScore" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificationCutoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualizationModifier" (
    "id" TEXT NOT NULL,
    "monthsMin" INTEGER NOT NULL,
    "monthsMax" INTEGER NOT NULL,
    "modifierRate" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualizationModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiRange" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "excellentMax" DOUBLE PRECISION NOT NULL,
    "goodMax" DOUBLE PRECISION NOT NULL,
    "fairMax" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KpiRange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskThreshold" (
    "id" TEXT NOT NULL,
    "regulationName" TEXT NOT NULL,
    "lowRiskMin" DOUBLE PRECISION NOT NULL,
    "mediumRiskMin" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentCycle_hospitalId_idx" ON "AssessmentCycle"("hospitalId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringWeight_category_key" ON "ScoringWeight"("category");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationCutoff_certificationName_key" ON "CertificationCutoff"("certificationName");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualizationModifier_monthsMin_monthsMax_key" ON "AnnualizationModifier"("monthsMin", "monthsMax");

-- CreateIndex
CREATE UNIQUE INDEX "KpiRange_metricName_key" ON "KpiRange"("metricName");

-- CreateIndex
CREATE UNIQUE INDEX "RiskThreshold_regulationName_key" ON "RiskThreshold"("regulationName");

-- CreateIndex
CREATE INDEX "AssessmentHistory_assessmentCycleId_idx" ON "AssessmentHistory"("assessmentCycleId");

-- CreateIndex
CREATE INDEX "DataUploadBatch_assessmentCycleId_idx" ON "DataUploadBatch"("assessmentCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectricityData_hospitalId_month_year_assessmentCycleId_key" ON "ElectricityData"("hospitalId", "month", "year", "assessmentCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "FuelData_hospitalId_month_year_assessmentCycleId_key" ON "FuelData"("hospitalId", "month", "year", "assessmentCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "RefrigerantData_hospitalId_month_year_refrigerantType_asses_key" ON "RefrigerantData"("hospitalId", "month", "year", "refrigerantType", "assessmentCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "TransportData_hospitalId_month_year_assessmentCycleId_key" ON "TransportData"("hospitalId", "month", "year", "assessmentCycleId");

-- CreateIndex
CREATE INDEX "Upload_assessmentCycleId_idx" ON "Upload"("assessmentCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "WasteData_hospitalId_month_year_assessmentCycleId_key" ON "WasteData"("hospitalId", "month", "year", "assessmentCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterData_hospitalId_month_year_assessmentCycleId_key" ON "WaterData"("hospitalId", "month", "year", "assessmentCycleId");

-- AddForeignKey
ALTER TABLE "AssessmentCycle" ADD CONSTRAINT "AssessmentCycle_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataUploadBatch" ADD CONSTRAINT "DataUploadBatch_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectricityData" ADD CONSTRAINT "ElectricityData_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterData" ADD CONSTRAINT "WaterData_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelData" ADD CONSTRAINT "FuelData_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteData" ADD CONSTRAINT "WasteData_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefrigerantData" ADD CONSTRAINT "RefrigerantData_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportData" ADD CONSTRAINT "TransportData_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ESGScore" ADD CONSTRAINT "ESGScore_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentHistory" ADD CONSTRAINT "AssessmentHistory_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationResult" ADD CONSTRAINT "ValidationResult_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationScore" ADD CONSTRAINT "CertificationScore_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculatedMetric" ADD CONSTRAINT "CalculatedMetric_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionsSummary" ADD CONSTRAINT "EmissionsSummary_assessmentCycleId_fkey" FOREIGN KEY ("assessmentCycleId") REFERENCES "AssessmentCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

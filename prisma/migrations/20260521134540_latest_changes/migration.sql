/*
  Warnings:

  - You are about to drop the `RiskThreshold` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "RiskThreshold";

-- DropTable
DROP TABLE "SystemConfig";

-- CreateIndex
CREATE INDEX "CalculatedMetric_hospitalId_idx" ON "CalculatedMetric"("hospitalId");

-- CreateIndex
CREATE INDEX "CalculatedMetric_hospitalId_metricName_idx" ON "CalculatedMetric"("hospitalId", "metricName");

-- CreateIndex
CREATE INDEX "CertificationScore_hospitalId_idx" ON "CertificationScore"("hospitalId");

-- CreateIndex
CREATE INDEX "CertificationScore_assessmentCycleId_idx" ON "CertificationScore"("assessmentCycleId");

-- CreateIndex
CREATE INDEX "ESGScore_hospitalId_createdAt_idx" ON "ESGScore"("hospitalId", "createdAt");

-- CreateIndex
CREATE INDEX "ESGScore_assessmentCycleId_idx" ON "ESGScore"("assessmentCycleId");

-- CreateIndex
CREATE INDEX "EmissionsSummary_hospitalId_idx" ON "EmissionsSummary"("hospitalId");

-- CreateIndex
CREATE INDEX "EmissionsSummary_assessmentCycleId_idx" ON "EmissionsSummary"("assessmentCycleId");

-- CreateIndex
CREATE INDEX "User_hospitalId_idx" ON "User"("hospitalId");

-- CreateIndex
CREATE INDEX "ValidationResult_hospitalId_category_status_idx" ON "ValidationResult"("hospitalId", "category", "status");

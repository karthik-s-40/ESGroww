/*
  Warnings:

  - A unique constraint covering the columns `[hospitalId,month,year]` on the table `ElectricityData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year]` on the table `FuelData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year,refrigerantType]` on the table `RefrigerantData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year]` on the table `TransportData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uploadBatchId]` on the table `Upload` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year]` on the table `WasteData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hospitalId,month,year]` on the table `WaterData` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ElectricityData" ADD COLUMN     "sourceBatchId" TEXT;

-- AlterTable
ALTER TABLE "FuelData" ADD COLUMN     "sourceBatchId" TEXT;

-- AlterTable
ALTER TABLE "RefrigerantData" ADD COLUMN     "sourceBatchId" TEXT;

-- AlterTable
ALTER TABLE "TransportData" ADD COLUMN     "sourceBatchId" TEXT;

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "fileContentHash" TEXT,
ADD COLUMN     "isReplaced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "replacedAt" TIMESTAMP(3),
ADD COLUMN     "resolutionStrategy" TEXT,
ADD COLUMN     "rowCount" INTEGER,
ADD COLUMN     "sourceFile" TEXT,
ADD COLUMN     "uploadBatchId" TEXT,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "WasteData" ADD COLUMN     "sourceBatchId" TEXT;

-- AlterTable
ALTER TABLE "WaterData" ADD COLUMN     "sourceBatchId" TEXT;

-- CreateTable
CREATE TABLE "DataUploadBatch" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sourceFileName" TEXT NOT NULL,
    "fileContentHash" TEXT NOT NULL,
    "batchVersion" INTEGER NOT NULL,
    "resolutionStrategy" TEXT,
    "distinctMonthCount" INTEGER NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "monthKeysCsv" TEXT,
    "isSuperseded" BOOLEAN NOT NULL DEFAULT false,
    "supersededAt" TIMESTAMP(3),
    "supersededByBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataUploadBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataUploadBatch_hospitalId_category_createdAt_idx" ON "DataUploadBatch"("hospitalId", "category", "createdAt");

-- CreateIndex
CREATE INDEX "DataUploadBatch_hospitalId_category_fileContentHash_idx" ON "DataUploadBatch"("hospitalId", "category", "fileContentHash");

-- CreateIndex
CREATE UNIQUE INDEX "ElectricityData_hospitalId_month_year_key" ON "ElectricityData"("hospitalId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "FuelData_hospitalId_month_year_key" ON "FuelData"("hospitalId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "RefrigerantData_hospitalId_month_year_refrigerantType_key" ON "RefrigerantData"("hospitalId", "month", "year", "refrigerantType");

-- CreateIndex
CREATE UNIQUE INDEX "TransportData_hospitalId_month_year_key" ON "TransportData"("hospitalId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Upload_uploadBatchId_key" ON "Upload"("uploadBatchId");

-- CreateIndex
CREATE INDEX "Upload_hospitalId_category_createdAt_idx" ON "Upload"("hospitalId", "category", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WasteData_hospitalId_month_year_key" ON "WasteData"("hospitalId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "WaterData_hospitalId_month_year_key" ON "WaterData"("hospitalId", "month", "year");

-- AddForeignKey
ALTER TABLE "DataUploadBatch" ADD CONSTRAINT "DataUploadBatch_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectricityData" ADD CONSTRAINT "ElectricityData_sourceBatchId_fkey" FOREIGN KEY ("sourceBatchId") REFERENCES "DataUploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterData" ADD CONSTRAINT "WaterData_sourceBatchId_fkey" FOREIGN KEY ("sourceBatchId") REFERENCES "DataUploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelData" ADD CONSTRAINT "FuelData_sourceBatchId_fkey" FOREIGN KEY ("sourceBatchId") REFERENCES "DataUploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteData" ADD CONSTRAINT "WasteData_sourceBatchId_fkey" FOREIGN KEY ("sourceBatchId") REFERENCES "DataUploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefrigerantData" ADD CONSTRAINT "RefrigerantData_sourceBatchId_fkey" FOREIGN KEY ("sourceBatchId") REFERENCES "DataUploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportData" ADD CONSTRAINT "TransportData_sourceBatchId_fkey" FOREIGN KEY ("sourceBatchId") REFERENCES "DataUploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_uploadBatchId_fkey" FOREIGN KEY ("uploadBatchId") REFERENCES "DataUploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

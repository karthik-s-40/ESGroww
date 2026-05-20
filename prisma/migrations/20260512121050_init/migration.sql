-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT 'Healthcare',
    "builtUpArea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "numberOfBeds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectricityData" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "electricityKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "renewableKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElectricityData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterData" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "waterKl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recycledWaterKl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelData" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "dgDieselLitres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteData" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "biomedicalWasteKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recyclableWasteKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "landfillWasteKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WasteData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefrigerantData" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "refrigerantType" TEXT NOT NULL,
    "refrigerantLeakKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefrigerantData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportData" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "ambulanceFuelLitres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "staffCommuteKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceData" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "hasEsgPolicy" BOOLEAN NOT NULL DEFAULT false,
    "hasSustainabilityCommittee" BOOLEAN NOT NULL DEFAULT false,
    "hasAuditReports" BOOLEAN NOT NULL DEFAULT false,
    "hasComplianceDocs" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernanceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ESGScore" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "energyScore" DOUBLE PRECISION NOT NULL,
    "waterScore" DOUBLE PRECISION NOT NULL,
    "wasteScore" DOUBLE PRECISION NOT NULL,
    "governanceScore" DOUBLE PRECISION NOT NULL,
    "emissionsScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ESGScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GovernanceData_hospitalId_key" ON "GovernanceData"("hospitalId");

-- AddForeignKey
ALTER TABLE "ElectricityData" ADD CONSTRAINT "ElectricityData_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterData" ADD CONSTRAINT "WaterData_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelData" ADD CONSTRAINT "FuelData_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteData" ADD CONSTRAINT "WasteData_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefrigerantData" ADD CONSTRAINT "RefrigerantData_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportData" ADD CONSTRAINT "TransportData_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceData" ADD CONSTRAINT "GovernanceData_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ESGScore" ADD CONSTRAINT "ESGScore_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

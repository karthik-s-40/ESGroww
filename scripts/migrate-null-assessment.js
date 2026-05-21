const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const cycles = await p.assessmentCycle.findMany({
    orderBy: { createdAt: 'asc' }
  });

  if (cycles.length === 0) {
    console.log("No assessment cycles found.");
    return;
  }

  const legacyCycleId = cycles[0].id;
  console.log(`Using legacy cycle ID: ${legacyCycleId}`);

  // Fix Uploads
  const uResult = await p.upload.updateMany({
    where: { assessmentCycleId: null },
    data: { assessmentCycleId: legacyCycleId }
  });
  console.log(`Updated ${uResult.count} Uploads.`);

  // Fix DataUploadBatch
  const dbResult = await p.dataUploadBatch.updateMany({
    where: { assessmentCycleId: null },
    data: { assessmentCycleId: legacyCycleId }
  });
  console.log(`Updated ${dbResult.count} DataUploadBatches.`);

  // Fix ElectricityData
  const eResult = await p.electricityData.updateMany({
    where: { assessmentCycleId: null },
    data: { assessmentCycleId: legacyCycleId }
  });
  console.log(`Updated ${eResult.count} ElectricityData.`);

  // Fix WaterData
  const wResult = await p.waterData.updateMany({
    where: { assessmentCycleId: null },
    data: { assessmentCycleId: legacyCycleId }
  });
  console.log(`Updated ${wResult.count} WaterData.`);

  // Fix FuelData
  const fResult = await p.fuelData.updateMany({
    where: { assessmentCycleId: null },
    data: { assessmentCycleId: legacyCycleId }
  });
  console.log(`Updated ${fResult.count} FuelData.`);

  // Fix WasteData
  const waResult = await p.wasteData.updateMany({
    where: { assessmentCycleId: null },
    data: { assessmentCycleId: legacyCycleId }
  });
  console.log(`Updated ${waResult.count} WasteData.`);

  // Fix TransportData
  const tResult = await p.transportData.updateMany({
    where: { assessmentCycleId: null },
    data: { assessmentCycleId: legacyCycleId }
  });
  console.log(`Updated ${tResult.count} TransportData.`);

  // Fix RefrigerantData
  const rResult = await p.refrigerantData.updateMany({
    where: { assessmentCycleId: null },
    data: { assessmentCycleId: legacyCycleId }
  });
  console.log(`Updated ${rResult.count} RefrigerantData.`);

}

main().catch(console.error).finally(() => p.$disconnect());

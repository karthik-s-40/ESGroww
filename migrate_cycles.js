const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting Assessment Cycle Migration...");
  const hospitals = await prisma.hospital.findMany();
  console.log(`Found ${hospitals.length} hospitals.`);

  for (const hospital of hospitals) {
    console.log(`Processing hospital: ${hospital.hospitalName} (${hospital.id})`);

    // Create default assessment cycle
    const cycle = await prisma.assessmentCycle.create({
      data: {
        hospitalId: hospital.id,
        name: "Initial Assessment",
        startDate: new Date("2020-01-01"),
        endDate: new Date(),
        isLocked: false,
      }
    });

    console.log(`  -> Created Assessment Cycle: ${cycle.id}`);

    // Link all existing records to this cycle
    const updatePromises = [
      prisma.electricityData.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.waterData.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.fuelData.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.wasteData.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.refrigerantData.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.transportData.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.upload.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.dataUploadBatch.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.eSGScore.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.assessmentHistory.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.validationResult.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.certificationScore.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.calculatedMetric.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
      prisma.emissionsSummary.updateMany({ where: { hospitalId: hospital.id, assessmentCycleId: null }, data: { assessmentCycleId: cycle.id } }),
    ];

    await Promise.all(updatePromises);
    console.log(`  -> Successfully linked all records for ${hospital.hospitalName}.`);
  }

  console.log("Migration complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cycles = await prisma.assessmentCycle.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  if (cycles.length === 0) {
    console.log("No cycles found.");
    return;
  }
  
  // The first cycle is the "old" one.
  const oldCycle = cycles[0];
  
  console.log("Assigning null relations to cycle:", oldCycle.id);
  
  const models = [
    'electricityData', 'waterData', 'fuelData', 'wasteData', 'refrigerantData', 'transportData', 'upload'
  ];
  
  for (const model of models) {
    const res = await (prisma as any)[model].updateMany({
      where: { assessmentCycleId: null },
      data: { assessmentCycleId: oldCycle.id }
    });
    console.log(`Updated ${res.count} records in ${model}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Seeding ScoringWeight
  await prisma.scoringWeight.createMany({
    data: [
      { category: "Energy", weightValue: 0.35 },
      { category: "Water", weightValue: 0.25 },
      { category: "Waste", weightValue: 0.20 },
      { category: "Governance", weightValue: 0.20 },
    ],
    skipDuplicates: true,
  });

  // Seeding CertificationCutoff
  await prisma.certificationCutoff.createMany({
    data: [
      { certificationName: "ISO14001", minCompleteness: 70, minGovernance: 50 },
      { certificationName: "LEED", minCompleteness: 75, minEnergyScore: 60 },
      { certificationName: "WELL", minCompleteness: 70, minWaterRecycled: 30 },
      { certificationName: "IGBC", minCompleteness: 65, minEnergyScore: 50 },
    ],
    skipDuplicates: true,
  });

  // Seeding AnnualizationModifier
  await prisma.annualizationModifier.createMany({
    data: [
      { monthsMin: 3, monthsMax: 5, modifierRate: 1.2 },
      { monthsMin: 6, monthsMax: 8, modifierRate: 1.1 },
      { monthsMin: 9, monthsMax: 11, modifierRate: 1.05 },
    ],
    skipDuplicates: true,
  });

  console.log("Admin config seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

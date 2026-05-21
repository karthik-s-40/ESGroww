const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const cycles = await p.assessmentCycle.findMany();
  console.log('Cycles:', cycles);
  const up = await p.upload.findMany();
  console.log('Uploads count:', up.length);
}
main().catch(console.error).finally(() => p.$disconnect());

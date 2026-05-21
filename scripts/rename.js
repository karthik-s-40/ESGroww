const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.assessmentCycle.update({ where: { id: 'cmpf23e930005148yeuzmylrg' }, data: { name: 'FY 2026' } }).then(console.log).finally(() => p.$disconnect());

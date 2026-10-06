const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const txs = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    take: 10
  });
  console.log(txs);
}

main().finally(() => prisma.$disconnect());

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log("Connecting to:", process.env.DATABASE_URL);
prisma.$connect()
  .then(async () => {
    console.log('Successfully connected to Neon DB!');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Test query success:', users);
  })
  .catch(e => console.error('Failed to connect:', e))
  .finally(() => prisma.$disconnect());

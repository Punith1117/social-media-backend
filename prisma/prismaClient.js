const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Parse DATABASE_URL and pass as parameters
const dbUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;

if (!dbUrl) {
    throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 5432,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1)
});

const prisma = new PrismaClient({
    adapter,
    log: ['warn', 'error']
});

module.exports = prisma;

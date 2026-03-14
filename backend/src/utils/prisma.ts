import { PrismaClient } from '@prisma/client';
import env from '../config/env';

const globalForPrisma = globalThis as typeof globalThis & {
    prisma?: PrismaClient;
};

const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: env.isProduction ? ['error'] : ['error', 'warn']
    });

if (!env.isProduction) {
    globalForPrisma.prisma = prisma;
}

export default prisma;

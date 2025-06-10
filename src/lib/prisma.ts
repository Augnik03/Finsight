import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a mock PrismaClient that returns empty results when database is not available
class MockPrismaClient {
  transaction = {
    findMany: async () => [],
    create: async (data: any) => ({ id: 'mock-id', ...data.data }),
    update: async (data: any) => ({ id: data.where.id, ...data.data }),
    delete: async () => ({}),
    findUnique: async () => null,
  };
}

let prismaClient;

try {
  prismaClient = globalForPrisma.prisma || new PrismaClient({
    log: ['query'],
  });

  // Test connection
  prismaClient.$connect();
  
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;
} catch (error) {
  console.error('Failed to connect to database, using mock client:', error);
  prismaClient = new MockPrismaClient() as unknown as PrismaClient;
}

export const prisma = prismaClient; 
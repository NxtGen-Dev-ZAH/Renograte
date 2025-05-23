import { PrismaClient } from '@prisma/client';

// Extend PrismaClient to include all models for type safety
declare global {
  var prisma: PrismaClient;
}

export const prisma: PrismaClient; 
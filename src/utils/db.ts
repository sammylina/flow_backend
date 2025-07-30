import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Add logging to Prisma Client
prisma.$on('query', (e: { query: string; duration: number }) => {
  logger.debug(`Query: ${e.query}`);
  logger.debug(`Duration: ${e.duration}ms`);
});

prisma.$on('error', (e: { message: string }) => {
  logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on('info', (e: { message: string }) => {
  logger.info(`Prisma Info: ${e.message}`);
});

prisma.$on('warn', (e: { message: string }) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

export default prisma;

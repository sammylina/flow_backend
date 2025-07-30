import { PrismaClient } from '../generated/prisma';
import logger from './logger';

// Create a singleton instance of PrismaClient
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

// Handle connection errors
prisma
  .$connect()
  .then(() => {
    logger.info('Successfully connected to the database');
  })
  .catch((error: Error) => {
    logger.error(`Failed to connect to the database: ${error.message}`);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
  process.exit(0);
});

export default prisma;

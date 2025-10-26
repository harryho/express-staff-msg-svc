import { PrismaClient } from '@prisma/client';
import logger from './logger';

/**
 * Prisma Client singleton instance with logging configuration
 */
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
      level: 'warn',
    },
  ],
});

/**
 * Hook Prisma logging events to Pino logger
 */
prisma.$on('query', (e: { query: string; params: string; duration: number }) => {
  logger.debug({
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
  }, 'Database query executed');
});

prisma.$on('error', (e: { message: string }) => {
  logger.error({ message: e.message }, 'Database error');
});

prisma.$on('warn', (e: { message: string }) => {
  logger.warn({ message: e.message }, 'Database warning');
});

/**
 * Connect to the database with retry logic
 */
export async function connectDatabase(): Promise<void> {
  const maxRetries = 5;
  const retryDelay = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      logger.info('✅ Database connected successfully');
      return;
    } catch (error) {
      logger.error(
        { error, attempt, maxRetries },
        `Failed to connect to database (attempt ${attempt}/${maxRetries})`
      );

      if (attempt < maxRetries) {
        logger.info(`Retrying in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        logger.fatal('❌ Could not connect to database after maximum retries');
        throw error;
      }
    }
  }
}

/**
 * Disconnect from the database gracefully
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error({ error }, 'Error disconnecting from database');
    throw error;
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return false;
  }
}

/**
 * Export Prisma client instance
 */
export default prisma;

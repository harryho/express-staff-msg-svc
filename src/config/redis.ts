import Redis from 'ioredis';
import { config } from './index';
import logger from './logger';

/**
 * Redis client configuration
 */
const redisConfig = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  db: config.REDIS_DB,
  password: config.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 500, 3000);
    logger.warn({ attempt: times, delay }, 'Redis connection retry');
    return delay;
  },
  enableReadyCheck: true,
  enableOfflineQueue: true,
};

/**
 * Redis client for BullMQ
 */
export const redisConnection = new Redis(redisConfig);

/**
 * Redis client for general use (separate connection)
 */
export const redisClient = new Redis(redisConfig);

/**
 * Handle Redis connection events
 */
redisConnection.on('connect', () => {
  logger.info('Redis connection established');
});

redisConnection.on('ready', () => {
  logger.info('✅ Redis is ready');
});

redisConnection.on('error', (error: Error) => {
  logger.error({ error }, '❌ Redis connection error');
});

redisConnection.on('close', () => {
  logger.warn('Redis connection closed');
});

redisConnection.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

/**
 * Connect to Redis with retry logic
 */
export async function connectRedis(): Promise<void> {
  try {
    await redisConnection.ping();
    logger.info('✅ Redis connected successfully');
  } catch (error) {
    logger.error({ error }, '❌ Failed to connect to Redis');
    throw error;
  }
}

/**
 * Disconnect from Redis gracefully
 */
export async function disconnectRedis(): Promise<void> {
  try {
    await redisConnection.quit();
    await redisClient.quit();
    logger.info('Redis disconnected successfully');
  } catch (error) {
    logger.error({ error }, 'Error disconnecting from Redis');
    throw error;
  }
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const result = await redisConnection.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error({ error }, 'Redis health check failed');
    return false;
  }
}

export default redisConnection;

import Redlock from 'redlock';
import { redisClient } from '../config/redis';
import logger from '../config/logger';

const redlock = new Redlock(
  [redisClient],
  {
    retryCount: 3,
    retryDelay: 200,
    retryJitter: 200,
    automaticExtensionThreshold: 500,
  }
);

redlock.on('error', (error) => {
  logger.error({ error }, 'Redlock error occurred');
});

export async function acquireLock(
  lockKey: string,
  ttl: number = 30000
): Promise<any | null> {
  try {
    const lock = await redlock.acquire([lockKey], ttl);
    logger.debug({ lockKey, ttl }, 'Lock acquired successfully');
    return lock;
  } catch (error) {
    logger.warn({ error, lockKey }, 'Failed to acquire lock');
    return null;
  }
}

export async function releaseLock(lock: any): Promise<void> {
  try {
    await lock.release();
    logger.debug({ lockKey: lock.resources[0] }, 'Lock released successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to release lock');
  }
}

export async function withLock<T>(
  lockKey: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T | null> {
  const lock = await acquireLock(lockKey, ttl);
  
  if (!lock) {
    return null;
  }
  
  try {
    const result = await fn();
    return result;
  } finally {
    await releaseLock(lock);
  }
}

export default {
  acquireLock,
  releaseLock,
  withLock,
};

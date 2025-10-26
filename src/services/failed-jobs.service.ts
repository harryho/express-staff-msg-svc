import { messageQueue } from '../queues/message.queue';
import logger from '../config/logger';

export class FailedJobsService {
  async getFailedJobs(): Promise<Array<{ id: string; data: any; failedReason: string; attemptsMade: number }>> {
    try {
      const failedJobs = await messageQueue.getFailed();
      
      return failedJobs.map(job => ({
        id: job.id || 'unknown',
        data: job.data,
        failedReason: job.failedReason || 'Unknown error',
        attemptsMade: job.attemptsMade,
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch failed jobs');
      throw error;
    }
  }

  async retryFailedJob(jobId: string): Promise<void> {
    try {
      const job = await messageQueue.getJob(jobId);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (await job.isFailed()) {
        await job.retry();
        logger.info({ jobId }, 'Failed job retried successfully');
      } else {
        throw new Error(`Job ${jobId} is not in failed state`);
      }
    } catch (error) {
      logger.error({ error, jobId }, 'Failed to retry job');
      throw error;
    }
  }

  async retryAllFailedJobs(): Promise<number> {
    try {
      const failedJobs = await messageQueue.getFailed();
      let retriedCount = 0;

      for (const job of failedJobs) {
        try {
          await job.retry();
          retriedCount++;
        } catch (error) {
          logger.error({ error, jobId: job.id }, 'Failed to retry individual job');
        }
      }

      logger.info({ retriedCount, total: failedJobs.length }, 'Batch retry completed');
      return retriedCount;
    } catch (error) {
      logger.error({ error }, 'Failed to retry all failed jobs');
      throw error;
    }
  }

  async removeFailedJob(jobId: string): Promise<void> {
    try {
      const job = await messageQueue.getJob(jobId);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      await job.remove();
      logger.info({ jobId }, 'Failed job removed successfully');
    } catch (error) {
      logger.error({ error, jobId }, 'Failed to remove job');
      throw error;
    }
  }

  async cleanFailedJobs(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const removedJobs = await messageQueue.clean(olderThanMs, 0, 'failed');
      logger.info({ removedCount: removedJobs.length, olderThanMs }, 'Failed jobs cleaned');
      return removedJobs.length;
    } catch (error) {
      logger.error({ error }, 'Failed to clean failed jobs');
      throw error;
    }
  }
}

export default new FailedJobsService();

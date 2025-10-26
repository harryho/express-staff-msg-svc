import { Queue, QueueOptions, Job } from 'bullmq';
import redisConnection from '../config/redis';
import { config } from '../config';
import logger from '../config/logger';

export interface MessageJobData {
  employeeId: string;
  messageDeliveryId: string;
  messageType: 'ANNIVERSARY';
  firstName: string;
  lastName: string;
  yearsOfService?: number;
  scheduledTime: string;
}

const queueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: config.JOB_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: config.JOB_BACKOFF_DELAY_MS,
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 5000, // Keep last 5000 failed jobs for debugging
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
};

export const messageQueue = new Queue<MessageJobData>('message-delivery', queueOptions);

messageQueue.on('error', (error: Error) => {
  logger.error({ error }, 'Message queue error');
});

messageQueue.on('waiting', (job: Job) => {
  logger.debug({ jobId: job.id }, 'Job is waiting');
});

export async function addMessageJob(
  data: MessageJobData,
  scheduledTime: Date
): Promise<Job<MessageJobData>> {
  const delay = Math.max(0, scheduledTime.getTime() - Date.now());

  const job = await messageQueue.add(
    `${data.messageType}-${data.employeeId}`,
    data,
    {
      delay,
      jobId: `${data.messageType}-${data.employeeId}-${scheduledTime.getTime()}`,
    }
  );

  logger.info(
    {
      jobId: job.id,
      employeeId: data.employeeId,
      messageType: data.messageType,
      scheduledTime: scheduledTime.toISOString(),
      delayMs: delay,
    },
    'Message job scheduled'
  );

  return job;
}

export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    messageQueue.getWaitingCount(),
    messageQueue.getActiveCount(),
    messageQueue.getCompletedCount(),
    messageQueue.getFailedCount(),
    messageQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

export async function cleanQueue() {
  const grace = 1000; // 1 second grace period
  await messageQueue.clean(grace, 1000, 'completed');
  await messageQueue.clean(grace, 5000, 'failed');
  logger.info('Queue cleaned successfully');
}

export async function closeQueue() {
  await messageQueue.close();
  logger.info('Message queue closed');
}

export default messageQueue;

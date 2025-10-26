import { Worker, Job } from 'bullmq';
import redisConnection from '../config/redis';
import { config } from '../config';
import logger from '../config/logger';
import messageService from '../services/message.service';
import messageDeliveryRepository from '../repositories/message-delivery.repository';
import { MessageJobData } from '../queues/message.queue';

async function processMessageJob(job: Job<MessageJobData>): Promise<void> {
  const { employeeId, messageDeliveryId, messageType, firstName, lastName, yearsOfService } = job.data;

  logger.info(
    {
      jobId: job.id,
      employeeId,
      messageType,
      attemptsMade: job.attemptsMade,
    },
    'Processing message delivery job'
  );

  try {
    if (messageType === 'ANNIVERSARY') {
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - (yearsOfService || 0));
      
      await messageService.sendAnniversaryMessage(
        firstName,
        lastName,
        startDate,
        employeeId
      );
    } else {
      throw new Error(`Unsupported message type: ${messageType}`);
    }

    await messageDeliveryRepository.updateStatus(messageDeliveryId, 'SENT');

    logger.info(
      {
        jobId: job.id,
        employeeId,
        messageType,
        messageDeliveryId,
      },
      'Message delivered successfully'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(
      {
        jobId: job.id,
        employeeId,
        messageType,
        error: errorMessage,
        attemptsMade: job.attemptsMade,
      },
      'Failed to deliver message'
    );

    await messageDeliveryRepository.updateStatus(
      messageDeliveryId,
      'FAILED',
      errorMessage
    );

    throw error;
  }
}

export function createMessageWorker(): Worker<MessageJobData> {
  const worker = new Worker<MessageJobData>(
    'message-delivery',
    processMessageJob,
    {
      connection: redisConnection,
      concurrency: config.JOB_CONCURRENCY,
      limiter: {
        max: 10, // Max 10 jobs
        duration: 1000, // per 1 second (to avoid overwhelming webhook)
      },
    }
  );

  worker.on('completed', (job: Job) => {
    logger.info(
      {
        jobId: job.id,
        employeeId: job.data.employeeId,
        duration: job.finishedOn ? job.finishedOn - (job.processedOn || 0) : 0,
      },
      'Worker: Job completed'
    );
  });

  worker.on('failed', (job: Job | undefined, error: Error) => {
    logger.error(
      {
        jobId: job?.id,
        employeeId: job?.data.employeeId,
        error: error.message,
        attemptsMade: job?.attemptsMade,
        maxAttempts: config.JOB_ATTEMPTS,
      },
      'Worker: Job failed'
    );
  });

  worker.on('error', (error: Error) => {
    logger.error({ error: error.message }, 'Worker: Error occurred');
  });

  worker.on('stalled', (jobId: string) => {
    logger.warn({ jobId }, 'Worker: Job stalled');
  });

  logger.info(
    {
      concurrency: config.JOB_CONCURRENCY,
      maxAttempts: config.JOB_ATTEMPTS,
    },
    'Message worker started'
  );

  return worker;
}

let worker: Worker<MessageJobData> | null = null;

export function startWorker(): Worker<MessageJobData> {
  if (worker) {
    logger.warn('Worker already started');
    return worker;
  }

  worker = createMessageWorker();
  return worker;
}

export async function stopWorker(): Promise<void> {
  if (!worker) {
    return;
  }

  logger.info('Stopping message worker...');
  await worker.close();
  worker = null;
  logger.info('Message worker stopped');
}

export default { startWorker, stopWorker };

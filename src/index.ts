import { createApp } from './app';
import { config } from './config';
import logger from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { startWorker, stopWorker } from './workers/message.worker';
import { closeQueue } from './queues/message.queue';
import schedulerService from './services/scheduler.service';
import { Server } from 'http';

async function main() {
  try {
    logger.info('🚀 Starting Employee Anniversary Message Service...');
    logger.info(`Environment: ${config.NODE_ENV}`);
    logger.info(`Log Level: ${config.LOG_LEVEL}`);

    await connectDatabase();

    await connectRedis();

    if (config.SCHEDULER_ENABLED) {
      logger.info('Starting message worker...');
      startWorker();
    }

    const app = createApp();

    const server: Server = app.listen(config.PORT, () => {
      logger.info(`✅ Server is running on port ${config.PORT}`);
      logger.info(`📍 Health check: http://localhost:${config.PORT}/health`);
      logger.info(`📍 API endpoints: http://localhost:${config.PORT}/api/v1`);
    });

    if (config.SCHEDULER_ENABLED) {
      logger.info('Running initial message scheduling...');
      setTimeout(async () => {
        try {
          await schedulerService.scheduleAllMessages();
        } catch (error) {
          logger.error({ error }, 'Initial scheduling failed');
        }
      }, 5000);

      setInterval(async () => {
        try {
          await schedulerService.scheduleAllMessages();
        } catch (error) {
          logger.error({ error }, 'Daily scheduling failed');
        }
      }, 24 * 60 * 60 * 1000);
    }

    if (config.RECOVERY_JOB_ENABLED) {
      setTimeout(async () => {
        try {
          await schedulerService.recoverMissedMessages(config.RECOVERY_LOOKBACK_HOURS);
        } catch (error) {
          logger.error({ error }, 'Recovery job failed');
        }
      }, 10000);

      setInterval(async () => {
        try {
          await schedulerService.recoverMissedMessages(config.RECOVERY_LOOKBACK_HOURS);
        } catch (error) {
          logger.error({ error }, 'Recovery job failed');
        }
      }, 60 * 60 * 1000);
    }

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      server.close(() => {
        logger.info('HTTP server closed');
      });

      try {
        await disconnectDatabase();

        await stopWorker();

        await closeQueue();

        await disconnectRedis();

        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error({ error }, '❌ Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (error: Error) => {
      logger.fatal({ error }, '❌ Uncaught Exception');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.fatal({ reason }, '❌ Unhandled Promise Rejection');
      process.exit(1);
    });

  } catch (error) {
    logger.fatal({ error }, '❌ Failed to start application');
    process.exit(1);
  }
}

main();

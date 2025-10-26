import { Request, Response } from 'express';
import { getQueueStats } from '../queues/message.queue';
import schedulerService from '../services/scheduler.service';
import failedJobsService from '../services/failed-jobs.service';
import logger from '../config/logger';

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await getQueueStats();
    
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get queue statistics');
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve queue statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function triggerScheduler(_req: Request, res: Response): Promise<void> {
  try {
    logger.info('Manual scheduler trigger requested');
    
    const { anniversaries } = await schedulerService.scheduleAllMessages();
    const total = anniversaries 
    
    res.status(200).json({
      success: true,
      data: {
        anniversariesScheduled: anniversaries,
        totalScheduled: total,
      },
      message: `Successfully scheduled ${total} message(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to trigger scheduler manually');
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to trigger scheduler',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function triggerRecovery(_req: Request, res: Response): Promise<void> {
  try {
    logger.info('Manual recovery trigger requested');
    
    const recovered = await schedulerService.recoverMissedMessages();
    
    res.status(200).json({
      success: true,
      data: {
        messagesRecovered: recovered,
      },
      message: `Successfully recovered ${recovered} missed message(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to trigger recovery manually');
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to trigger recovery',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function getFailedJobs(_req: Request, res: Response): Promise<void> {
  try {
    const failedJobs = await failedJobsService.getFailedJobs();
    
    res.status(200).json({
      success: true,
      data: {
        count: failedJobs.length,
        jobs: failedJobs,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get failed jobs');
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve failed jobs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function retryFailedJob(req: Request, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    
    await failedJobsService.retryFailedJob(jobId);
    
    res.status(200).json({
      success: true,
      message: `Job ${jobId} has been queued for retry`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to retry job');
    
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        message: 'Failed to retry job',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function retryAllFailedJobs(_req: Request, res: Response): Promise<void> {
  try {
    const retriedCount = await failedJobsService.retryAllFailedJobs();
    
    res.status(200).json({
      success: true,
      data: {
        retriedCount,
      },
      message: `Successfully retried ${retriedCount} failed job(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to retry all failed jobs');
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retry all failed jobs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function removeFailedJob(req: Request, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    
    await failedJobsService.removeFailedJob(jobId);
    
    res.status(200).json({
      success: true,
      message: `Job ${jobId} has been removed`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to remove job');
    
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        message: 'Failed to remove job',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export default {
  getStats,
  triggerScheduler,
  triggerRecovery,
  getFailedJobs,
  retryFailedJob,
  retryAllFailedJobs,
  removeFailedJob,
};

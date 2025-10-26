import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database';
import { checkRedisHealth } from '../config/redis';
import metricsService from '../services/metrics.service';
import { config } from '../config';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
  };
  correlationId?: string;
}

interface ReadinessStatus {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    redis: boolean;
  };
}

interface LivenessStatus {
  alive: boolean;
  timestamp: string;
  uptime: number;
}

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const dbHealthy = await checkDatabaseHealth();
  const redisHealthy = await checkRedisHealth();

  const allHealthy = dbHealthy && redisHealthy;
  const someHealthy = dbHealthy || redisHealthy;

  const status: HealthStatus = {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    version: '1.0.0',
    checks: {
      database: dbHealthy ? 'ok' : 'error',
      redis: redisHealthy ? 'ok' : 'error',
    },
    correlationId: req.correlationId,
  };

  const statusCode = allHealthy ? 200 : someHealthy ? 200 : 503;
  res.status(statusCode).json(status);
};

/**
 * Readiness probe
 * Indicates if the service is ready to accept traffic
 * Used by Kubernetes readiness probes
 */
export const readinessCheck = async (_req: Request, res: Response): Promise<void> => {
  const dbHealthy = await checkDatabaseHealth();
  const redisHealthy = await checkRedisHealth();

  const ready = dbHealthy && redisHealthy;

  const status: ReadinessStatus = {
    ready,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealthy,
      redis: redisHealthy,
    },
  };

  const statusCode = ready ? 200 : 503;
  res.status(statusCode).json(status);
};

export const livenessCheck = (_req: Request, res: Response): void => {
  const status: LivenessStatus = {
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  res.status(200).json(status);
};

export const metricsEndpoint = async (_req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await metricsService.getMetrics();
    res.set('Content-Type', metricsService.getContentType());
    res.send(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
};

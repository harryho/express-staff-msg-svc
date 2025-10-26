import { Request, Response, NextFunction } from 'express';
import metricsService from '../services/metrics.service';

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  const originalEnd = res.end;

  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    const duration = (Date.now() - startTime) / 1000;
    const path = req.route?.path || req.path;

    metricsService.httpRequestsTotal.inc({
      method: req.method,
      path,
      status_code: res.statusCode,
    });

    metricsService.httpRequestDuration.observe(
      {
        method: req.method,
        path,
        status_code: res.statusCode,
      },
      duration
    );

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

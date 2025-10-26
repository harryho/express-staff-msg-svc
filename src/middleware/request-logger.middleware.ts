import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  logger.info({
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  }, 'Incoming request');

  const originalEnd = res.end;

  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    const duration = Date.now() - startTime;

    logger.info({
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length'),
    }, 'Request completed');

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

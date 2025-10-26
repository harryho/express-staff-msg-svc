import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../config/logger';
import { config } from '../config';

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  correlationId?: string;
  timestamp: string;
  path: string;
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const correlationId = req.correlationId;
  const timestamp = new Date().toISOString();
  const path = req.path;

  logger.error({
    err,
    correlationId,
    path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
    },
  }, 'Request error occurred');

  if (err instanceof ZodError) {
    const validationErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    const response: ErrorResponse = {
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data',
      validationErrors,
      correlationId,
      timestamp,
      path,
    };

    res.status(400).json(response);
    return;
  }

  const statusCode = (err as any).statusCode || 500;
  const errorName = err.name || 'Internal Server Error';

  const message = config.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;

  const response: ErrorResponse = {
    success: false,
    error: errorName,
    message,
    correlationId,
    timestamp,
    path,
  };

  if (config.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

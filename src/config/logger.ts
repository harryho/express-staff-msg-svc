import pino from 'pino';
import { config, isDevelopment } from './index';

/**
 * Pino logger configuration with environment-specific settings
 */
const logger = pino({
  level: config.LOG_LEVEL,
  
  // Base configuration
  base: {
    env: config.NODE_ENV,
    pid: process.pid,
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Pretty printing for development
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,

  // Redact sensitive information
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'cookie',
      'DATABASE_URL',
      'REDIS_PASSWORD',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },

  // Serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

/**
 * Create child logger with additional context
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Default logger instance
 */
export default logger;

import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Timezone
  DEFAULT_TIMEZONE: z.string().default('UTC'),

  // Target Hour
  TARGET_HOUR: z.string().default('8').transform(Number),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default('0').transform(Number),

  // Message Delivery
  WEBHOOK_URL: z.string().url('WEBHOOK_URL must be a valid URL'),
  WEBHOOK_TIMEOUT_MS: z.string().default('5000').transform(Number),
  WEBHOOK_MAX_RETRIES: z.string().default('3').transform(Number),

  // Job Queue
  JOB_CONCURRENCY: z.string().default('5').transform(Number),
  JOB_ATTEMPTS: z.string().default('3').transform(Number),
  JOB_BACKOFF_DELAY_MS: z.string().default('5000').transform(Number),

  // Scheduler
  SCHEDULER_ENABLED: z.string().default('true').transform((val) => val === 'true'),
  RECOVERY_JOB_ENABLED: z.string().default('true').transform((val) => val === 'true'),
  RECOVERY_LOOKBACK_HOURS: z.string().default('48').transform(Number),

  // Security
  API_RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15 minutes
  API_RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
});

/**
 * Validate and parse environment variables
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => {
        return `${issue.path.join('.')}: ${issue.message}`;
      });
      
      console.error('❌ Invalid environment variables:');
      missingVars.forEach((msg) => console.error(`  - ${msg}`));
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Type-safe configuration object
 */
export const config = validateEnv();

/**
 * Configuration helper functions
 */
export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test';

/**
 * Export type for configuration
 */
export type Config = z.infer<typeof envSchema>;

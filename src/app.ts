import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
// @ts-expect-error - compression doesn't have types
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import employeeRoutes from './routes/employee.routes';
import queueRoutes from './routes/queue.routes';
import healthRoutes from './routes/health.routes';
import { correlationIdMiddleware } from './middleware/correlation-id.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { errorHandler } from './middleware/error-handler.middleware';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // ============================================================================
  // Security Middleware
  // ============================================================================

  // Helmet - Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));

  // CORS - Cross-Origin Resource Sharing
  app.use(cors({
    origin: config.NODE_ENV === 'production' 
      ? [] // Configure allowed origins in production
      : '*',
    credentials: true,
  }));

  // ============================================================================
  // Request Processing Middleware
  // ============================================================================

  // Correlation ID - Add unique ID to each request
  app.use(correlationIdMiddleware);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Metrics collection
  app.use(metricsMiddleware);

  // Request logging with correlation IDs
  app.use(requestLogger);

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.API_RATE_LIMIT_WINDOW_MS,
    max: config.API_RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // ============================================================================
  // Health and Metrics Endpoints
  // ============================================================================

  app.use(healthRoutes);

  // ============================================================================
  // API Documentation
  // ============================================================================

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Employee Message Service API',
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // OpenAPI JSON spec
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ============================================================================
  // API Routes
  // ============================================================================

  // API version prefix
  const apiRouter = express.Router();
  app.use('/api/v1', apiRouter);

  // Mount employee routes
  apiRouter.use('/employee', employeeRoutes);

  // Mount queue management routes
  apiRouter.use('/queue', queueRoutes);

  // ============================================================================
  // Root endpoint
  // ============================================================================

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Employee Message Service',
      version: '1.0.0',
      environment: config.NODE_ENV,
      endpoints: {
        health: '/health',
        api: '/api/v1',
      },
    });
  });

  // ============================================================================
  // 404 Handler
  // ============================================================================

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
      path: req.path,
    });
  });

  // ============================================================================
  // Error Handler
  // ============================================================================

  app.use(errorHandler);

  return app;
}

export default createApp;

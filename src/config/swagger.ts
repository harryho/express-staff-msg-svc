import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

/**
 * Swagger/OpenAPI Configuration
 */

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Message Service',
      version: '1.0.0',
      description: `
        A message service for scheduling and delivering employee messages.
        
        ## Features
        - Employee management (create, read, delete)
        - Automatic message scheduling
        - Timezone-aware message delivery
        - Queue management and monitoring
        - Failed job recovery
        
        ## Authentication
        Currently, this API does not require authentication. In production, implement appropriate
        authentication and authorization mechanisms.
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/api/v1',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Employee',
        description: 'Employee management operations',
      },
      {
        name: 'Queue',
        description: 'Message queue management',
      },
      {
        name: 'Health',
        description: 'Service health and monitoring',
      },
    ],
    components: {
      schemas: {
        Employee: {
          type: 'object',
          required: ['firstName', 'lastName', 'startDate', 'timezone', 'locationDisplay'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique employee identifier',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Employee first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Employee last name',
              example: 'Doe',
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Employment start date (YYYY-MM-DD)',
              example: '2020-01-15',
            },
            birthDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Employee birth date (YYYY-MM-DD, optional)',
              example: '1990-05-20',
            },
            timezone: {
              type: 'string',
              description: 'IANA timezone identifier',
              example: 'America/New_York',
            },
            locationDisplay: {
              type: 'string',
              description: 'Human-readable location description',
              example: 'New York, NY (America/New_York)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record last update timestamp',
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Soft delete timestamp',
            },
          },
        },
        CreateEmployeeRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'startDate', 'timezone', 'locationDisplay'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'John',
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'Doe',
            },
            startDate: {
              type: 'string',
              format: 'date',
              example: '2020-01-15',
            },
            birthDate: {
              type: 'string',
              format: 'date',
              example: '1990-05-20',
            },
            timezone: {
              type: 'string',
              example: 'America/New_York',
            },
            locationDisplay: {
              type: 'string',
              example: 'New York, NY (America/New_York)',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Validation Error',
            },
            message: {
              type: 'string',
              example: 'Invalid input data',
            },
            correlationId: {
              type: 'string',
              format: 'uuid',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            path: {
              type: 'string',
            },
          },
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy', 'degraded'],
              example: 'healthy',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            uptime: {
              type: 'number',
              description: 'Process uptime in seconds',
              example: 12345.67,
            },
            environment: {
              type: 'string',
              example: 'production',
            },
            version: {
              type: 'string',
              example: '1.0.0',
            },
            checks: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  enum: ['ok', 'error'],
                },
                redis: {
                  type: 'string',
                  enum: ['ok', 'error'],
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
        },
        NotFoundError: {
          description: 'Resource not found',
        },
        ValidationError: {
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

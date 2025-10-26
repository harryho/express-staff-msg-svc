# Employee Message Service

A Express Node.js application that sends happy service anniversary messages to employees on their work anniversary date at exactly given time in their local time.

## Features

- ✅ Employee management API (POST/GET/DELETE)
- ✅ Timezone-aware message scheduling
- ✅ Automatic downtime recovery
- ✅ Duplicate message prevention
- ✅ Scalable job queue architecture (BullMQ)
- ✅ Failed job management and retry
- ✅ Distributed locking (Redlock)


## Tech Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Job Queue**: BullMQ with Redis
- **Timezone**: Luxon
- **Testing**: Jest with Supertest
- **Logging**: Pino

## Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose (for local development)
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

## Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd express-staff-msg-svc
npm install
\`\`\`

### 2. Environment Configuration

\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

### 3. Start Infrastructure (Docker)

\`\`\`bash
npm run docker:up
\`\`\`

### 4. Database Setup

\`\`\`bash
npm run prisma:migrate
npm run prisma:generate
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The API will be available at `http://localhost:3000`

## API Endpoints

### Create Employee

\`\`\`bash
POST /api/v1/employee
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "startDate": "2020-10-24",
  "timezone": "Australia/Sydney",
  "locationDisplay": "New York, USA"
}
\`\`\`

### Delete Employee

\`\`\`bash
DELETE /api/v1/employee/:id
\`\`\`

#### Get All Employees

```bash
GET /api/v1/employee
```

#### Get Employee by ID

```bash
GET /api/v1/employee/:id
```

### Queue Management

#### Get Queue Status

```bash
GET /api/v1/queue/status
```

### Health Check

\`\`\`bash
GET /health          # Comprehensive health status
GET /ready           # Readiness probe (Kubernetes)
GET /live            # Liveness probe (Kubernetes)
\`\`\`

### Metrics

\`\`\`bash
GET /metrics         # Prometheus metrics
\`\`\`

### API Documentation

\`\`\`bash
GET /api-docs        # Interactive Swagger UI
GET /api-docs.json   # OpenAPI spec (JSON)
\`\`\`

## Monitoring & Observability

### Structured Logging

All requests include correlation IDs for distributed tracing:

\`\`\`json
{
  "level": "info",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/v1/employee",
  "statusCode": 201,
  "duration": 45,
  "message": "Request completed"
}
\`\`\`

### Prometheus Metrics

Available metrics include:
- HTTP request rates and durations
- Job queue depth and processing rates
- Message delivery success/failure rates
- Database query performance
- System resources (CPU, memory, etc.)

### Grafana Dashboard

To visualize metrics, you can create a Grafana dashboard using the available Prometheus metrics:
- Service health and uptime
- Request rates and latencies
- Queue performance
- Message delivery metrics
- System resource usage

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run docker:up` - Start Docker infrastructure
- `npm run docker:down` - Stop Docker infrastructure

### Project Structure

\`\`\`
src/
├── config/           # Configuration management
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── repositories/    # Data access layer
├── queues/          # BullMQ queue definitions
├── workers/         # BullMQ workers
├── utils/           # Utility functions
├── types/           # TypeScript types
└── schemas/         # Validation schemas
tests/
├── integration/     # API integration tests
├── unit/            # Unit tests
└── utils/           # Test utilities
\`\`\`

## Testing

\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
\`\`\`

## Deployment

For deployment instructions, refer to the Docker configuration files:
- `Dockerfile` - Container build configuration
- `docker-compose.yml` - Local development stack
- `docker-compose.app.yml` - Application deployment stack

## Architecture

The application uses an event-driven architecture with:

1. **API Layer**: Stateless Express.js servers handling employee management
2. **Scheduler**: Daily batch job that creates message delivery jobs
3. **Workers**: BullMQ workers processing message deliveries at scheduled times
4. **Recovery**: Hourly job that retries failed deliveries

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import logger from '../config/logger';

class MetricsService {
  public readonly register: Registry;

  public readonly httpRequestsTotal: Counter;
  public readonly httpRequestDuration: Histogram;

  public readonly jobsEnqueuedTotal: Counter;
  public readonly jobsCompletedTotal: Counter;
  public readonly jobsFailedTotal: Counter;
  public readonly queueDepth: Gauge;

  public readonly messagesDeliveredTotal: Counter;
  public readonly messagesFailedTotal: Counter;
  public readonly messageDeliveryDuration: Histogram;

  public readonly databaseConnectionsActive: Gauge;
  public readonly databaseQueryDuration: Histogram;

  constructor() {
    this.register = new Registry();

    collectDefaultMetrics({ 
      register: this.register,
      prefix: 'employee_msg_svc_',
    });

    this.httpRequestsTotal = new Counter({
      name: 'employee_msg_svc_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'employee_msg_svc_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    this.jobsEnqueuedTotal = new Counter({
      name: 'employee_msg_svc_jobs_enqueued_total',
      help: 'Total number of jobs enqueued',
      labelNames: ['queue_name', 'job_type'],
      registers: [this.register],
    });

    this.jobsCompletedTotal = new Counter({
      name: 'employee_msg_svc_jobs_completed_total',
      help: 'Total number of jobs completed successfully',
      labelNames: ['queue_name', 'job_type'],
      registers: [this.register],
    });

    this.jobsFailedTotal = new Counter({
      name: 'employee_msg_svc_jobs_failed_total',
      help: 'Total number of jobs failed',
      labelNames: ['queue_name', 'job_type', 'error_type'],
      registers: [this.register],
    });

    this.queueDepth = new Gauge({
      name: 'employee_msg_svc_queue_depth',
      help: 'Current number of jobs in queue',
      labelNames: ['queue_name', 'status'],
      registers: [this.register],
    });

    this.messagesDeliveredTotal = new Counter({
      name: 'employee_msg_svc_messages_delivered_total',
      help: 'Total number of messages delivered successfully',
      labelNames: ['message_type'],
      registers: [this.register],
    });

    this.messagesFailedTotal = new Counter({
      name: 'employee_msg_svc_messages_failed_total',
      help: 'Total number of messages failed to deliver',
      labelNames: ['message_type', 'error_type'],
      registers: [this.register],
    });

    this.messageDeliveryDuration = new Histogram({
      name: 'employee_msg_svc_message_delivery_duration_seconds',
      help: 'Duration of message delivery in seconds',
      labelNames: ['message_type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [this.register],
    });

    this.databaseConnectionsActive = new Gauge({
      name: 'employee_msg_svc_database_connections_active',
      help: 'Number of active database connections',
      registers: [this.register],
    });

    this.databaseQueryDuration = new Histogram({
      name: 'employee_msg_svc_database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });

    logger.info('Metrics service initialized');
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }
}

export const metricsService = new MetricsService();
export default metricsService;

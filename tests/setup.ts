
import { PrismaClient } from '@prisma/client';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'fatal';
process.env.WEBHOOK_URL = 'https://webhook-test.example.com/messages';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/message_service_test?schema=public';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6380';

let prisma: PrismaClient | null = null;

beforeAll(async () => {
  const testPath = expect.getState().testPath || '';
  const isIntegrationTest = testPath.includes('/integration/');
  
  if (isIntegrationTest) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    await prisma.$connect();

    global.testPrisma = prisma;
  }
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});
declare global {
  var testPrisma: PrismaClient;
}

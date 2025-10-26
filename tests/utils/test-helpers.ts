
import { PrismaClient, Employee, MessageDelivery } from '@prisma/client';
import { DateTime } from 'luxon';
import { config } from '../../src/config';

export async function cleanDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.messageDelivery.deleteMany({});
  await prisma.employee.deleteMany({});
}

export async function createTestEmployee(
  prisma: PrismaClient,
  overrides: Partial<{
    firstName: string;
    lastName: string;
    startDate: Date;
    birthDate: Date | null;
    timezone: string;
    locationDisplay: string;
  }> = {}
): Promise<Employee> {
  const defaults = {
    firstName: 'John',
    lastName: 'Doe',
    startDate: new Date('2020-01-15'),
    birthDate: new Date('1990-05-20'),
    timezone: 'America/New_York',
    locationDisplay: 'New York, NY (America/New_York)',
  };

  const data = { ...defaults, ...overrides };

  return prisma.employee.create({
    data,
  });
}

export async function createTestMessageDelivery(
  prisma: PrismaClient,
  employeeId: string,
  overrides: Partial<{
    messageType: 'ANNIVERSARY' 
    scheduledDate: Date;
    scheduledTime: Date;
    status: 'PENDING' | 'SENT' | 'FAILED';
    messageContent: string;
    attemptCount: number;
  }> = {}
): Promise<MessageDelivery> {
  const defaults = {
    messageType: 'ANNIVERSARY' as const,
    scheduledDate: new Date(),
    scheduledTime: DateTime.now().setZone('America/New_York').set({ hour: config.TARGET_HOUR || 8, minute: 0, second: 0 }).toJSDate(),
    status: 'PENDING' as const,
    messageContent: 'Test message',
    attemptCount: 0,
  };

  const data = { ...defaults, ...overrides };

  return prisma.messageDelivery.create({
    data: {
      ...data,
      employeeId,
    },
  });
}

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getDateYearsAgo(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

export function getTodayAtMidnight(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function createMockAxios() {
  return {
    post: jest.fn(),
  };
}

export function createMockQueue() {
  return {
    add: jest.fn(),
    getJobs: jest.fn(),
    getJobCounts: jest.fn(),
    obliterate: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    close: jest.fn(),
  };
}

export function createMockRedis() {
  return {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
    quit: jest.fn(),
  };
}

import { MessageDelivery, MessageType, DeliveryStatus } from '@prisma/client';
import prisma from '../config/database';

export class MessageDeliveryRepository {
  async create(data: {
    employeeId: string;
    messageType: MessageType;
    scheduledDate: Date;
    scheduledTime: Date;
    jobId?: string;
  }): Promise<MessageDelivery> {
    return await prisma.messageDelivery.create({
      data: {
        employeeId: data.employeeId,
        messageType: data.messageType,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        status: 'PENDING',
        jobId: data.jobId,
      },
    });
  }

  async updateStatus(
    id: string,
    status: DeliveryStatus,
    errorMessage?: string
  ): Promise<MessageDelivery> {
    const updateData: {
      status: DeliveryStatus;
      lastAttemptAt: Date;
      attemptCount: { increment: number };
      sentAt?: Date;
      errorMessage?: string;
    } = {
      status,
      lastAttemptAt: new Date(),
      attemptCount: {
        increment: 1,
      },
    };

    if (status === 'SENT') {
      updateData.sentAt = new Date();
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    return await prisma.messageDelivery.update({
      where: { id },
      data: updateData,
    });
  }

  async findById(id: string): Promise<MessageDelivery | null> {
    return await prisma.messageDelivery.findUnique({
      where: { id },
    });
  }

  async findPendingMissed(lookbackHours: number): Promise<MessageDelivery[]> {
    const cutoffTime = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

    return await prisma.messageDelivery.findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        scheduledTime: {
          lte: new Date(),
          gte: cutoffTime,
        },
      },
      include: {
        employee: true,
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });
  }

  async exists(
    employeeId: string,
    messageType: MessageType,
    scheduledDate: Date
  ): Promise<boolean> {
    const count = await prisma.messageDelivery.count({
      where: {
        employeeId,
        messageType,
        scheduledDate,
      },
    });

    return count > 0;
  }

  async getStats(startDate?: Date, endDate?: Date) {
    const where = startDate && endDate
      ? {
          scheduledDate: {
            gte: startDate,
            lte: endDate,
          },
        }
      : {};

    const [total, sent, failed, pending] = await Promise.all([
      prisma.messageDelivery.count({ where }),
      prisma.messageDelivery.count({ where: { ...where, status: 'SENT' } }),
      prisma.messageDelivery.count({ where: { ...where, status: 'FAILED' } }),
      prisma.messageDelivery.count({ where: { ...where, status: 'PENDING' } }),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? (sent / total) * 100 : 0,
    };
  }

  async deleteByEmployeeId(employeeId: string): Promise<void> {
    await prisma.messageDelivery.deleteMany({
      where: { employeeId },
    });
  }
}

export default new MessageDeliveryRepository();

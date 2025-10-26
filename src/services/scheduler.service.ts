import employeeRepository from '../repositories/employee.repository';
import messageDeliveryRepository from '../repositories/message-delivery.repository';
import { addMessageJob } from '../queues/message.queue';
import { calculateLocalTimeOfTargetTime, calculateYearsOfService, getCurrentMonthAndDay } from '../utils/timezone.util';
import { withLock } from '../utils/lock.util';
import logger from '../config/logger';

export class SchedulerService {
  async scheduleAnniversaryMessages(): Promise<number> {
    logger.info('Starting anniversary message scheduling...');

    const { month, day } = getCurrentMonthAndDay();
    const employees = await employeeRepository.findByAnniversaryDate(month, day);

    logger.info({ count: employees.length, month, day }, 'Found employees with anniversaries today');

    let scheduled = 0;

    for (const employee of employees) {
      try {
        const today = new Date();
        const nineAmLocal = calculateLocalTimeOfTargetTime(today, employee.timezone);
        const scheduledTime = nineAmLocal.toJSDate();

        const exists = await messageDeliveryRepository.exists(
          employee.id,
          'ANNIVERSARY',
          today
        );

        if (exists) {
          logger.debug(
            { employeeId: employee.id, scheduledDate: today },
            'Anniversary message already scheduled'
          );
          continue;
        }

        const yearsOfService = calculateYearsOfService(employee.startDate, today);

        const messageDelivery = await messageDeliveryRepository.create({
          employeeId: employee.id,
          messageType: 'ANNIVERSARY',
          scheduledDate: today,
          scheduledTime,
        });

        const job = await addMessageJob(
          {
            employeeId: employee.id,
            messageDeliveryId: messageDelivery.id,
            messageType: 'ANNIVERSARY',
            firstName: employee.firstName,
            lastName: employee.lastName,
            yearsOfService,
            scheduledTime: scheduledTime.toISOString(),
          },
          scheduledTime
        );

        await messageDeliveryRepository.updateStatus(
          messageDelivery.id,
          'PENDING'
        );

        logger.info(
          {
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            yearsOfService,
            scheduledTime: scheduledTime.toISOString(),
            timezone: employee.timezone,
            jobId: job.id,
          },
          'Anniversary message scheduled'
        );

        scheduled++;
      } catch (error) {
        logger.error(
          {
            error,
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
          },
          'Failed to schedule anniversary message'
        );
      }
    }

    logger.info({ scheduled, total: employees.length }, 'Anniversary message scheduling completed');
    return scheduled;
  }


  async scheduleAllMessages(): Promise<{ 
    anniversaries: number }> {
    const lockKey = 'scheduler:daily-messages';
    const lockTTL = 5 * 60 * 1000; // 5 minutes

    const result = await withLock(lockKey, lockTTL, async () => {
      logger.info('🗓️  Running daily message scheduler...');

      const [anniversaries] = await Promise.all([
        this.scheduleAnniversaryMessages(),
   
      ]);

      logger.info(
        { anniversaries,  total: anniversaries  },
        '✅ Daily message scheduling completed'
      );

      return { anniversaries };
    });

    if (result === null) {
      logger.warn('Could not acquire lock for daily scheduler - another instance is running');
      return { anniversaries: 0 };
    }

    return result;
  }

  async recoverMissedMessages(lookbackHours: number = 48): Promise<number> {
    const lockKey = 'scheduler:recovery';
    const lockTTL = 10 * 60 * 1000; // 10 minutes

    const result = await withLock(lockKey, lockTTL, async () => {
      logger.info({ lookbackHours }, '🔄 Starting message recovery...');

      const missedDeliveries = await messageDeliveryRepository.findPendingMissed(lookbackHours);

      logger.info({ count: missedDeliveries.length }, 'Found missed message deliveries');

      let recovered = 0;

      for (const delivery of missedDeliveries) {
        try {
          const employee = await employeeRepository.findById(delivery.employeeId);

          if (!employee || employee.deletedAt) {
            logger.debug(
              { messageDeliveryId: delivery.id },
              'Skipping recovery for deleted employee'
            );
            continue;
          }

          const yearsOfService =
            delivery.messageType === 'ANNIVERSARY'
              ? calculateYearsOfService(employee.startDate)
              : undefined;

          const job = await addMessageJob(
            {
              employeeId: employee.id,
              messageDeliveryId: delivery.id,
              messageType: 'ANNIVERSARY',
              firstName: employee.firstName,
              lastName: employee.lastName,
              yearsOfService,
              scheduledTime: delivery.scheduledTime.toISOString(),
            },
            new Date()
          );

          logger.info(
            {
              messageDeliveryId: delivery.id,
              employeeId: employee.id,
              messageType: delivery.messageType,
              originalScheduledTime: delivery.scheduledTime.toISOString(),
              jobId: job.id,
            },
            'Missed message recovered and re-queued'
          );

          recovered++;
        } catch (error) {
          logger.error(
            {
              error,
              messageDeliveryId: delivery.id,
            },
            'Failed to recover missed message'
          );
        }
      }

      logger.info({ recovered, total: missedDeliveries.length }, '✅ Message recovery completed');
      return recovered;
    });

    if (result === null) {
      logger.warn('Could not acquire lock for recovery - another instance is running');
      return 0;
    }

    return result;
  }
}

export default new SchedulerService();


import { DateTime } from 'luxon';
import {
  calculateLocalTimeOfTargetTime,
  getNextTargetTime,
  isSameMonthAndDay,
  calculateYearsOfService,
  getCurrentMonthAndDay,
  getTimezoneOffset,
  isValidTimezone,
  formatDateTimeWithTimezone,
  getCurrentDateInTimezone,
  isAnniversaryToday,
  calculateDelayUntil,
} from '../../src/utils/timezone.util';

describe('Timezone Utilities', () => {
  describe('calculateLocalTimeOfTargetTime', () => {
    it('should calculate TargetTime in New York timezone', () => {
      const date = new Date('2025-10-25');
      const result = calculateLocalTimeOfTargetTime(date, 'America/New_York');

      expect(result.hour).toBe(9);
      expect(result.minute).toBe(0);
      expect(result.second).toBe(0);
      expect(result.zoneName).toBe('America/New_York');
    });

    it('should calculate TargetTime in Tokyo timezone', () => {
      const date = new Date('2025-10-25');
      const result = calculateLocalTimeOfTargetTime(date, 'Asia/Tokyo');

      expect(result.hour).toBe(9);
      expect(result.minute).toBe(0);
      expect(result.zoneName).toBe('Asia/Tokyo');
    });

    it('should calculate TargetTime in London timezone', () => {
      const date = new Date('2025-10-25');
      const result = calculateLocalTimeOfTargetTime(date, 'Europe/London');

      expect(result.hour).toBe(9);
      expect(result.minute).toBe(0);
      expect(result.zoneName).toBe('Europe/London');
    });

    it('should handle DST transition dates correctly', () => {
      const date = new Date('2024-03-10');
      const result = calculateLocalTimeOfTargetTime(date, 'America/New_York');

      expect(result.hour).toBe(9);
      expect(result.minute).toBe(0);
    });
  });

  describe('getNextTargetTime', () => {
    it('should return today TargetTime if current time is before TargetTime', () => {
      const mockNow = DateTime.fromObject(
        { year: 2025, month: 10, day: 25, hour: 8, minute: 0 },
        { zone: 'America/New_York' }
      );

      jest.spyOn(DateTime, 'now').mockReturnValue(mockNow as any);

      const result = getNextTargetTime('America/New_York');

      expect(result.hour).toBe(9);
      expect(result.day).toBe(25);

      jest.restoreAllMocks();
    });

    it('should return tomorrow TargetTime if current time is after TargetTime', () => {
      const mockNow = DateTime.fromObject(
        { year: 2025, month: 10, day: 25, hour: 10, minute: 0 },
        { zone: 'America/New_York' }
      );

      jest.spyOn(DateTime, 'now').mockReturnValue(mockNow as any);

      const result = getNextTargetTime('America/New_York');

      expect(result.hour).toBe(9);
      expect(result.day).toBe(26);

      jest.restoreAllMocks();
    });

    it('should work across different timezones', () => {
      const mockNow = DateTime.fromObject(
        { year: 2025, month: 10, day: 25, hour: 8, minute: 0 },
        { zone: 'Asia/Tokyo' }
      );

      jest.spyOn(DateTime, 'now').mockReturnValue(mockNow as any);

      const result = getNextTargetTime('Asia/Tokyo');

      expect(result.hour).toBe(9);
      expect(result.zoneName).toBe('Asia/Tokyo');

      jest.restoreAllMocks();
    });
  });

  describe('isSameMonthAndDay', () => {
    it('should return true for dates with same month and day', () => {
      const date1 = new Date('2020-10-25');
      const date2 = new Date('2025-10-25');

      expect(isSameMonthAndDay(date1, date2)).toBe(true);
    });

    it('should return false for dates with different months', () => {
      const date1 = new Date('2020-10-25');
      const date2 = new Date('2025-11-25');

      expect(isSameMonthAndDay(date1, date2)).toBe(false);
    });

    it('should return false for dates with different days', () => {
      const date1 = new Date('2020-10-25');
      const date2 = new Date('2025-10-26');

      expect(isSameMonthAndDay(date1, date2)).toBe(false);
    });

    it('should work with leap year dates', () => {
      const date1 = new Date('2020-02-29'); // Leap year
      const date2 = new Date('2024-02-29'); // Leap year

      expect(isSameMonthAndDay(date1, date2)).toBe(true);
    });
  });

  describe('calculateYearsOfService', () => {
    it('should calculate correct years of service', () => {
      const startDate = new Date('2020-10-25');
      const currentDate = new Date('2025-10-25');

      const years = calculateYearsOfService(startDate, currentDate);

      expect(years).toBe(5);
    });

    it('should return 0 for less than 1 year', () => {
      const startDate = new Date('2025-01-01');
      const currentDate = new Date('2025-06-01');

      const years = calculateYearsOfService(startDate, currentDate);

      expect(years).toBe(0);
    });

    it('should handle partial years correctly', () => {
      const startDate = new Date('2020-10-25');
      const currentDate = new Date('2025-10-24'); // One day before anniversary

      const years = calculateYearsOfService(startDate, currentDate);

      expect(years).toBe(4); // Should be 4, not 5
    });

    it('should calculate years spanning decades', () => {
      const startDate = new Date('2000-01-01');
      const currentDate = new Date('2025-01-01');

      const years = calculateYearsOfService(startDate, currentDate);

      expect(years).toBe(25);
    });

    it('should use current date by default', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const years = calculateYearsOfService(oneYearAgo);

      expect(years).toBeGreaterThanOrEqual(0);
      expect(years).toBeLessThanOrEqual(1);
    });
  });

  describe('getCurrentMonthAndDay', () => {
    it('should return current month and day in UTC', () => {
      const result = getCurrentMonthAndDay();

      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('day');
      expect(result.month).toBeGreaterThanOrEqual(1);
      expect(result.month).toBeLessThanOrEqual(12);
      expect(result.day).toBeGreaterThanOrEqual(1);
      expect(result.day).toBeLessThanOrEqual(31);
    });
  });

  describe('getTimezoneOffset', () => {
    it('should return offset for New York timezone', () => {
      const date = new Date('2025-01-15'); // Winter time
      const offset = getTimezoneOffset('America/New_York', date);

      expect(offset).toMatch(/[-+]\d{2}:\d{2}/);
    });

    it('should return offset for Tokyo timezone', () => {
      const date = new Date('2025-01-15');
      const offset = getTimezoneOffset('Asia/Tokyo', date);

      expect(offset).toBe('+09:00');
    });

    it('should return offset for UTC timezone', () => {
      const date = new Date('2025-01-15');
      const offset = getTimezoneOffset('UTC', date);

      expect(offset).toBe('+00:00');
    });

    it('should handle DST transitions', () => {
      const winterDate = new Date('2025-01-15');
      const summerDate = new Date('2025-07-15');

      const winterOffset = getTimezoneOffset('America/New_York', winterDate);
      const summerOffset = getTimezoneOffset('America/New_York', summerDate);

      // New York is UTC-5 in winter, UTC-4 in summer
      expect(winterOffset).toBe('-05:00');
      expect(summerOffset).toBe('-04:00');
    });
  });

  describe('isValidTimezone', () => {
    it('should return true for valid IANA timezone', () => {
      expect(isValidTimezone('Australia/Sydney')).toBe(true);
      expect(isValidTimezone('Asia/Tokyo')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
      expect(isValidTimezone('UTC')).toBe(true);
    });

    it('should return false for invalid timezone', () => {
      expect(isValidTimezone('Invalid/Timezone')).toBe(false);
      expect(isValidTimezone('')).toBe(false);
      expect(isValidTimezone('XYZ')).toBe(false);
    });
  });

  describe('formatDateTimeWithTimezone', () => {
    it('should format date with timezone', () => {
      const date = new Date('2025-10-25T14:30:00Z');
      const formatted = formatDateTimeWithTimezone(date, 'America/New_York');

      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      expect(formatted).toContain('EDT'); // Eastern Daylight Time in October
    });

    it('should format date in different timezones', () => {
      const date = new Date('2025-10-25T00:00:00Z');
      const formattedNY = formatDateTimeWithTimezone(date, 'America/New_York');
      const formattedTokyo = formatDateTimeWithTimezone(date, 'Asia/Tokyo');

      expect(formattedNY).toBeDefined();
      expect(formattedTokyo).toBeDefined();
      expect(formattedNY).not.toBe(formattedTokyo);
    });
  });

  describe('getCurrentDateInTimezone', () => {
    it('should return current date in specified timezone', () => {
      const result = getCurrentDateInTimezone('Australia/Sydney');

      expect(result).toBeDefined();
      expect(result.zoneName).toBe('Australia/Sydney');
      expect(result.isValid).toBe(true);
    });

    it('should work with different timezones', () => {
      const ny = getCurrentDateInTimezone('America/New_York');
      const tokyo = getCurrentDateInTimezone('Asia/Tokyo');

      expect(ny.zoneName).toBe('America/New_York');
      expect(tokyo.zoneName).toBe('Asia/Tokyo');
    });
  });

  describe('isAnniversaryToday', () => {
    it('should return true when today matches anniversary date', () => {
      const mockNow = DateTime.fromObject(
        { year: 2025, month: 10, day: 25 },
        { zone: 'America/New_York' }
      );

      jest.spyOn(DateTime, 'now').mockReturnValue(mockNow as any);

      const startDate = new Date('2020-10-25'); // Anniversary is today

      const result = isAnniversaryToday(startDate, 'America/New_York');

      expect(result).toBe(true);

      jest.restoreAllMocks();
    });

    it('should return false when today does not match anniversary date', () => {
      const startDate = new Date('2020-01-01');

      const mockNow = DateTime.fromObject(
        { year: 2025, month: 6, day: 15 },
        { zone: 'America/New_York' }
      );

      jest.spyOn(DateTime, 'now').mockReturnValue(mockNow as any);

      const result = isAnniversaryToday(startDate, 'America/New_York');

      expect(result).toBe(false);

      jest.restoreAllMocks();
    });
  });


  describe('calculateDelayUntil', () => {
    it('should calculate correct delay for future time', () => {
      const now = DateTime.now();
      const targetTime = now.plus({ hours: 1 });

      const delay = calculateDelayUntil(targetTime);

      expect(delay).toBeGreaterThan(3599000);
      expect(delay).toBeLessThan(3601000);
    });

    it('should return 0 for past time', () => {
      const now = DateTime.now();
      const pastTime = now.minus({ hours: 1 });

      const delay = calculateDelayUntil(pastTime);

      expect(delay).toBe(0);
    });

    it('should handle millisecond precision', () => {
      const now = DateTime.now();
      const targetTime = now.plus({ milliseconds: 500 });

      const delay = calculateDelayUntil(targetTime);

      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThan(1000);
    });
  });
});

import { DateTime } from 'luxon';

export function calculateLocalTimeOfTargetTime(date: Date, timezone: string): DateTime {
  const localDate = DateTime.fromJSDate(date, { zone: timezone });

  const nineAm = localDate.set({
    hour: 9,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  return nineAm;
}

export function getNextTargetTime(timezone: string): DateTime {
  const now = DateTime.now().setZone(timezone);
  const todayTargetTime = now.set({
    hour: 9,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  if (now >= todayTargetTime) {
    return todayTargetTime.plus({ days: 1 });
  }

  return todayTargetTime;
}

export function isSameMonthAndDay(date1: Date, date2: Date): boolean {
  const dt1 = DateTime.fromJSDate(date1);
  const dt2 = DateTime.fromJSDate(date2);

  return dt1.month === dt2.month && dt1.day === dt2.day;
}

export function calculateYearsOfService(startDate: Date, currentDate: Date = new Date()): number {
  const start = DateTime.fromJSDate(startDate);
  const current = DateTime.fromJSDate(currentDate);

  const diff = current.diff(start, 'years');
  
  return Math.floor(diff.years);
}

export function getCurrentMonthAndDay(): { month: number; day: number } {
  const now = DateTime.utc();
  return {
    month: now.month,
    day: now.day,
  };
}

export function getTimezoneOffset(timezone: string, date: Date = new Date()): string {
  const dt = DateTime.fromJSDate(date, { zone: timezone });
  return dt.toFormat('ZZ'); // Returns offset like "+05:30" or "-08:00"
}

export function isValidTimezone(timezone: string): boolean {
  try {
    DateTime.now().setZone(timezone);
    return DateTime.now().setZone(timezone).isValid;
  } catch {
    return false;
  }
}

export function formatDateTimeWithTimezone(date: Date, timezone: string): string {
  const dt = DateTime.fromJSDate(date, { zone: timezone });
  return dt.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ');
}

export function getCurrentDateInTimezone(timezone: string): DateTime {
  return DateTime.now().setZone(timezone);
}

export function isAnniversaryToday(startDate: Date, timezone: string): boolean {
  const today = getCurrentDateInTimezone(timezone);
  const start = DateTime.fromJSDate(startDate);

  return today.month === start.month && today.day === start.day;
}



export function calculateDelayUntil(targetTime: DateTime): number {
  const now = DateTime.now();
  const delay = targetTime.diff(now).milliseconds;
  return Math.max(0, delay); // Never return negative delay
}

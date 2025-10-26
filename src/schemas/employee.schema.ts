import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or less')
    .trim(),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or less')
    .trim(),
  
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
    }, 'Start date must be a valid date in the past or today'),
  
  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
    }, 'Birth date must be a valid date in the past or today')
    .optional(),
  
  timezone: z.string()
    .min(1, 'Timezone is required')
    .max(50, 'Timezone must be 50 characters or less')
    .refine((tz) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, 'Invalid timezone format. Use IANA timezone (e.g., America/New_York)'),
  
  locationDisplay: z.string()
    .min(1, 'Location display is required')
    .max(255, 'Location display must be 255 characters or less')
    .trim(),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;

export const employeeIdSchema = z.object({
  id: z.string().uuid('Invalid employee ID format'),
});

export type EmployeeIdParam = z.infer<typeof employeeIdSchema>;

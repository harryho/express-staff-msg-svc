
import { createEmployeeSchema, employeeIdSchema } from '../../src/schemas/employee.schema';

describe('Employee Validation Schemas', () => {
  describe('createEmployeeSchema', () => {
    const validEmployee = {
      firstName: 'John',
      lastName: 'Doe',
      startDate: '2020-10-24',
      birthDate: '1990-05-20',
      timezone: 'America/New_York',
      locationDisplay: 'New York, NY (America/New_York)',
    };

    describe('firstName validation', () => {
      it('should accept valid first name', () => {
        const result = createEmployeeSchema.safeParse(validEmployee);
        expect(result.success).toBe(true);
      });

      it('should reject empty first name', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          firstName: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('First name is required');
        }
      });

      it('should reject first name over 100 characters', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          firstName: 'a'.repeat(101),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('100 characters or less');
        }
      });

      it('should trim whitespace from first name', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          firstName: '  John  ',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.firstName).toBe('John');
        }
      });

      it('should reject missing first name', () => {
        const { firstName, ...withoutFirstName } = validEmployee;
        const result = createEmployeeSchema.safeParse(withoutFirstName);
        expect(result.success).toBe(false);
      });
    });

    describe('lastName validation', () => {
      it('should accept valid last name', () => {
        const result = createEmployeeSchema.safeParse(validEmployee);
        expect(result.success).toBe(true);
      });

      it('should reject empty last name', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          lastName: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Last name is required');
        }
      });

      it('should reject last name over 100 characters', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          lastName: 'a'.repeat(101),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('100 characters or less');
        }
      });

      it('should trim whitespace from last name', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          lastName: '  Doe  ',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.lastName).toBe('Doe');
        }
      });

      it('should reject missing last name', () => {
        const { lastName, ...withoutLastName } = validEmployee;
        const result = createEmployeeSchema.safeParse(withoutLastName);
        expect(result.success).toBe(false);
      });
    });

    describe('startDate validation', () => {
      it('should accept valid start date', () => {
        const result = createEmployeeSchema.safeParse(validEmployee);
        expect(result.success).toBe(true);
      });

      it('should accept today as start date', () => {
        const today = new Date().toISOString().split('T')[0];
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          startDate: today,
        });
        expect(result.success).toBe(true);
      });

      it('should reject future start date', () => {
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        const futureDate = future.toISOString().split('T')[0];
        
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          startDate: futureDate,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('past or today');
        }
      });

      it('should reject invalid date format', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          startDate: '10/24/2020',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('YYYY-MM-DD');
        }
      });

      it('should reject invalid date', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          startDate: '2020-13-45',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('valid date');
        }
      });

      it('should reject missing start date', () => {
        const { startDate, ...withoutStartDate } = validEmployee;
        const result = createEmployeeSchema.safeParse(withoutStartDate);
        expect(result.success).toBe(false);
      });

      it('should accept historical dates', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          startDate: '1980-01-01',
        });
        expect(result.success).toBe(true);
      });
    });

    describe('birthDate validation', () => {
      it('should accept valid birth date', () => {
        const result = createEmployeeSchema.safeParse(validEmployee);
        expect(result.success).toBe(true);
      });

      it('should accept missing birth date (optional)', () => {
        const { birthDate, ...withoutBirthDate } = validEmployee;
        const result = createEmployeeSchema.safeParse(withoutBirthDate);
        expect(result.success).toBe(true);
      });

      it('should reject future birth date', () => {
        const future = new Date();
        future.setFullYear(future.getFullYear() + 1);
        const futureDate = future.toISOString().split('T')[0];
        
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          birthDate: futureDate,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('past or today');
        }
      });

      it('should reject invalid date format', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          birthDate: '05/20/1990',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('YYYY-MM-DD');
        }
      });

      it('should reject invalid date', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          birthDate: '1990-13-01', // Invalid month
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('valid date');
        }
      });
    });

    describe('timezone validation', () => {
      it('should accept valid IANA timezone', () => {
        const timezones = [
          'America/New_York',
          'Europe/London',
          'Asia/Tokyo',
          'Australia/Sydney',
          'UTC',
        ];

        timezones.forEach(timezone => {
          const result = createEmployeeSchema.safeParse({
            ...validEmployee,
            timezone,
          });
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid timezone', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          timezone: 'Invalid/Timezone',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid timezone');
        }
      });

      it('should reject empty timezone', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          timezone: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Timezone is required');
        }
      });

      it('should reject timezone over 50 characters', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          timezone: 'a'.repeat(51),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('50 characters or less');
        }
      });

      it('should reject missing timezone', () => {
        const { timezone, ...withoutTimezone } = validEmployee;
        const result = createEmployeeSchema.safeParse(withoutTimezone);
        expect(result.success).toBe(false);
      });

      it('should reject timezone abbreviations', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          timezone: 'EST',
        });
        expect(result.success).toBe(true);
      });
    });

    describe('locationDisplay validation', () => {
      it('should accept valid location display', () => {
        const result = createEmployeeSchema.safeParse(validEmployee);
        expect(result.success).toBe(true);
      });

      it('should reject empty location display', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          locationDisplay: '',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Location display is required');
        }
      });

      it('should reject location display over 255 characters', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          locationDisplay: 'a'.repeat(256),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('255 characters or less');
        }
      });

      it('should trim whitespace from location display', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          locationDisplay: '  New York, NY  ',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.locationDisplay).toBe('New York, NY');
        }
      });

      it('should reject missing location display', () => {
        const { locationDisplay, ...withoutLocation } = validEmployee;
        const result = createEmployeeSchema.safeParse(withoutLocation);
        expect(result.success).toBe(false);
      });
    });

    describe('complete validation', () => {
      it('should accept fully valid employee data', () => {
        const result = createEmployeeSchema.safeParse(validEmployee);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validEmployee);
        }
      });

      it('should accept valid employee without birth date', () => {
        const { birthDate, ...withoutBirthDate } = validEmployee;
        const result = createEmployeeSchema.safeParse(withoutBirthDate);
        expect(result.success).toBe(true);
      });

      it('should reject completely empty object', () => {
        const result = createEmployeeSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });

      it('should handle special characters in names', () => {
        const result = createEmployeeSchema.safeParse({
          ...validEmployee,
          firstName: "O'Brien-Smith",
          lastName: "José García",
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('employeeIdSchema', () => {
    it('should accept valid UUID', () => {
      const result = employeeIdSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const result = employeeIdSchema.safeParse({
        id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid employee ID');
      }
    });

    it('should reject missing ID', () => {
      const result = employeeIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty string ID', () => {
      const result = employeeIdSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });

    it('should reject numeric ID', () => {
      const result = employeeIdSchema.safeParse({ id: '12345' });
      expect(result.success).toBe(false);
    });

    it('should accept different valid UUID formats', () => {
      const uuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '00000000-0000-0000-0000-000000000000',
      ];

      uuids.forEach(id => {
        const result = employeeIdSchema.safeParse({ id });
        expect(result.success).toBe(true);
      });
    });
  });
});

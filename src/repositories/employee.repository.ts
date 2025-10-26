import prisma from '../config/database';
import { Employee } from '@prisma/client';
import { CreateEmployeeDto } from '../schemas/employee.schema';

export class EmployeeRepository {
  async create(data: CreateEmployeeDto): Promise<Employee> {
    return await prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        startDate: new Date(data.startDate),
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        timezone: data.timezone,
        locationDisplay: data.locationDisplay,
      },
    });
  }

  async findById(id: string): Promise<Employee | null> {
    return await prisma.employee.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findAll(): Promise<Employee[]> {
    return await prisma.employee.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async softDelete(id: string): Promise<Employee> {
    return await prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.employee.count({
      where: {
        id,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  async findByAnniversaryDate(month: number, day: number): Promise<Employee[]> {
    const results = await prisma.$queryRaw<any[]>`
      SELECT * FROM employees
      WHERE deleted_at IS NULL
      AND EXTRACT(MONTH FROM start_date) = ${month}
      AND EXTRACT(DAY FROM start_date) = ${day}
    `;
    
    return results.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      startDate: row.start_date,
      birthDate: row.birth_date,
      timezone: row.timezone,
      locationDisplay: row.location_display,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    }));
  }


}

export default new EmployeeRepository();

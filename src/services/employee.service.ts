import employeeRepository from '../repositories/employee.repository';
import { CreateEmployeeDto } from '../schemas/employee.schema';
import { Employee } from '@prisma/client';
import logger from '../config/logger';

export class EmployeeService {
  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    logger.info({ data }, 'Creating new employee');

    try {
      const employee = await employeeRepository.create(data);
      
      logger.info({ employeeId: employee.id }, 'Employee created successfully');
      
      return employee;
    } catch (error) {
      logger.error({ error, data }, 'Failed to create employee');
      throw error;
    }
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    logger.debug({ employeeId: id }, 'Fetching employee by ID');
    
    const employee = await employeeRepository.findById(id);
    
    if (!employee) {
      logger.warn({ employeeId: id }, 'Employee not found');
    }
    
    return employee;
  }

  async getAllEmployees(): Promise<Employee[]> {
    logger.debug('Fetching all active employees');
    return await employeeRepository.findAll();
  }

  async deleteEmployee(id: string): Promise<void> {
    logger.info({ employeeId: id }, 'Deleting employee');

    const exists = await employeeRepository.exists(id);
    
    if (!exists) {
      const error = new Error('Employee not found');
      logger.warn({ employeeId: id }, 'Cannot delete: employee not found');
      throw error;
    }

    try {
      await employeeRepository.softDelete(id);
      
      logger.info({ employeeId: id }, 'Employee deleted successfully');
      
    } catch (error) {
      logger.error({ error, employeeId: id }, 'Failed to delete employee');
      throw error;
    }
  }
}

export default new EmployeeService();

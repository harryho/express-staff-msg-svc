import { Request, Response, NextFunction } from 'express';
import employeeService from '../services/employee.service';
import { createEmployeeSchema, employeeIdSchema } from '../schemas/employee.schema';
import { ZodError } from 'zod';
import logger from '../config/logger';

export class EmployeeController {
  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createEmployeeSchema.parse(req.body);

      const employee = await employeeService.createEmployee(validatedData);

      res.status(201).json({
        success: true,
        data: employee,
        message: 'Employee created successfully',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        logger.error({ error }, 'Error in createEmployee controller');
        next(error);
      }
    }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = employeeIdSchema.parse(req.params);

      const employee = await employeeService.getEmployeeById(id);

      if (!employee) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Employee not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        logger.error({ error }, 'Error in getEmployeeById controller');
        next(error);
      }
    }
  }

  /**
   * GET /api/v1/employee
   * Get all employees
   */
  async getAllEmployees(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employees = await employeeService.getAllEmployees();

      res.status(200).json({
        success: true,
        data: employees,
        count: employees.length,
      });
    } catch (error) {
      logger.error({ error }, 'Error in getAllEmployees controller');
      next(error);
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = employeeIdSchema.parse(req.params);

      await employeeService.deleteEmployee(id);

      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      } else if (error instanceof Error && error.message === 'Employee not found') {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: error.message,
        });
      } else {
        logger.error({ error }, 'Error in deleteEmployee controller');
        next(error);
      }
    }
  }
}

export default new EmployeeController();

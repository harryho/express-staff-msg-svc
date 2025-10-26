import { Router } from 'express';
import employeeController from '../controllers/employee.controller';

const router = Router();

router.post('/', (req, res, next) => {
  employeeController.createEmployee(req, res, next);
});

router.get('/', (req, res, next) => {
  employeeController.getAllEmployees(req, res, next);
});

router.get('/:id', (req, res, next) => {
  employeeController.getEmployeeById(req, res, next);
});

router.delete('/:id', (req, res, next) => {
  employeeController.deleteEmployee(req, res, next);
});

export default router;

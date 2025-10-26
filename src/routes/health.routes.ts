import { Router } from 'express';
import { 
  healthCheck, 
  readinessCheck, 
  livenessCheck, 
  metricsEndpoint 
} from '../controllers/health.controller';

const router = Router();

router.get('/health', healthCheck);

router.get('/ready', readinessCheck);

router.get('/live', livenessCheck);

router.get('/metrics', metricsEndpoint);

export default router;

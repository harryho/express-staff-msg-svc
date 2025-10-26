import { Router } from 'express';
import queueController from '../controllers/queue.controller';

const router = Router();

router.get('/stats', queueController.getStats);

router.post('/trigger-scheduler', queueController.triggerScheduler);

router.post('/trigger-recovery', queueController.triggerRecovery);

router.get('/failed-jobs', queueController.getFailedJobs);

router.post('/failed-jobs/retry-all', queueController.retryAllFailedJobs);

router.post('/failed-jobs/:jobId/retry', queueController.retryFailedJob);

router.delete('/failed-jobs/:jobId', queueController.removeFailedJob);

export default router;

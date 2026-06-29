import { Router, Request, Response, NextFunction } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', (req: Request, res: Response, next: NextFunction) => reportController.getDashboardStats(req, res, next));
router.get('/trends', (req: Request, res: Response, next: NextFunction) => reportController.getMonthlyTrends(req, res, next));
router.post('/generate', (req: Request, res: Response, next: NextFunction) => reportController.generate(req, res, next));
router.get('/history', (req: Request, res: Response, next: NextFunction) => reportController.getHistory(req, res, next));

export default router;

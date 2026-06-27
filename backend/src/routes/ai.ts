import { Router, Request, Response, NextFunction } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/analyze', (req: Request, res: Response, next: NextFunction) => aiController.analyzeSpending(req, res, next));
router.get('/predict', (req: Request, res: Response, next: NextFunction) => aiController.predictExpenses(req, res, next));
router.get('/summary', (req: Request, res: Response, next: NextFunction) => aiController.getFinancialSummary(req, res, next));

export default router;

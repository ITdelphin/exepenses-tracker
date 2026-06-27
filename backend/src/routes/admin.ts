import { Router, Request, Response, NextFunction } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', (req: Request, res: Response, next: NextFunction) => adminController.getUsers(req, res, next));
router.get('/analytics', (req: Request, res: Response, next: NextFunction) => adminController.getAnalytics(req, res, next));
router.delete('/expenses/:id', (req: Request, res: Response, next: NextFunction) => adminController.deleteExpense(req, res, next));
router.get('/categories', (req: Request, res: Response, next: NextFunction) => adminController.manageCategories(req, res, next));

export default router;

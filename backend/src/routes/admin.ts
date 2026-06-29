import { Router, Request, Response, NextFunction } from 'express';
import { adminController } from '../controllers/adminController';
import { settingsController } from '../controllers/settingsController';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', (req: Request, res: Response, next: NextFunction) => adminController.getUsers(req as AuthRequest, res, next));
router.get('/analytics', (req: Request, res: Response, next: NextFunction) => adminController.getAnalytics(req as AuthRequest, res, next));
router.get('/categories', (req: Request, res: Response, next: NextFunction) => adminController.manageCategories(req as AuthRequest, res, next));

router.get('/settings', (req: Request, res: Response, next: NextFunction) => settingsController.getSettings(req as AuthRequest, res, next));
router.put('/settings', (req: Request, res: Response, next: NextFunction) => settingsController.updateSetting(req as AuthRequest, res, next));

export default router;

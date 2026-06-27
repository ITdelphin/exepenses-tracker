import { Router, Request, Response, NextFunction } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => notificationController.getAll(req, res, next));
router.get('/unread-count', (req: Request, res: Response, next: NextFunction) => notificationController.getUnreadCount(req, res, next));
router.put('/:id/read', (req: Request, res: Response, next: NextFunction) => notificationController.markAsRead(req, res, next));
router.put('/read-all', (req: Request, res: Response, next: NextFunction) => notificationController.markAllAsRead(req, res, next));

export default router;

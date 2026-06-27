import { Router, Request, Response, NextFunction } from 'express';
import { categoryController } from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => categoryController.getAll(req, res, next));
router.post('/', (req: Request, res: Response, next: NextFunction) => categoryController.create(req, res, next));
router.put('/:id', (req: Request, res: Response, next: NextFunction) => categoryController.update(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => categoryController.delete(req, res, next));

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { goalController } from '../controllers/goalController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => goalController.getAll(req, res, next));
router.post('/', (req: Request, res: Response, next: NextFunction) => goalController.create(req, res, next));
router.put('/:id', (req: Request, res: Response, next: NextFunction) => goalController.update(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => goalController.delete(req, res, next));

export default router;

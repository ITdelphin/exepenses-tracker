import { Router, Request, Response, NextFunction } from 'express';
import { budgetController } from '../controllers/budgetController';
import { authenticate } from '../middleware/auth';
import { budgetValidation } from '../middleware/validate';

const router = Router();
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => budgetController.getAll(req, res, next));
router.get('/status', (req: Request, res: Response, next: NextFunction) => budgetController.getStatus(req, res, next));
router.post('/', budgetValidation, (req: Request, res: Response, next: NextFunction) => budgetController.create(req, res, next));
router.put('/:id', (req: Request, res: Response, next: NextFunction) => budgetController.update(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => budgetController.delete(req, res, next));

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { expenseController } from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import { expenseValidation } from '../middleware/validate';

const router = Router();
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => expenseController.getAll(req, res, next));
router.get('/summary', (req: Request, res: Response, next: NextFunction) => expenseController.getSummary(req, res, next));
router.get('/:id', (req: Request, res: Response, next: NextFunction) => expenseController.getById(req, res, next));
router.post('/', expenseValidation, (req: Request, res: Response, next: NextFunction) => expenseController.create(req, res, next));
router.put('/:id', (req: Request, res: Response, next: NextFunction) => expenseController.update(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => expenseController.delete(req, res, next));

export default router;

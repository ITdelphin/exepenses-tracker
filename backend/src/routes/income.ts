import { Router, Request, Response, NextFunction } from 'express';
import { incomeController } from '../controllers/incomeController';
import { authenticate } from '../middleware/auth';
import { incomeValidation } from '../middleware/validate';

const router = Router();
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.use(authenticate);

router.get('/', (req: Request, res: Response, next: NextFunction) => incomeController.getAll(req, res, next));
router.get('/summary', (req: Request, res: Response, next: NextFunction) => incomeController.getSummary(req, res, next));
router.get('/:id', (req: Request, res: Response, next: NextFunction) => incomeController.getById(req, res, next));
router.post('/', incomeValidation, (req: Request, res: Response, next: NextFunction) => incomeController.create(req, res, next));
router.put('/:id', (req: Request, res: Response, next: NextFunction) => incomeController.update(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => incomeController.delete(req, res, next));

export default router;

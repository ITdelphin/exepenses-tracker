import { Router, Request, Response, NextFunction } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { registerValidation, loginValidation } from '../middleware/validate';

const router = Router();
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.post('/register', registerValidation, asyncHandler((req: Request, res: Response, next: NextFunction) => authController.register(req, res, next)));
router.post('/login', loginValidation, asyncHandler((req: Request, res: Response, next: NextFunction) => authController.login(req, res, next)));
router.post('/refresh-token', (req: Request, res: Response, next: NextFunction) => authController.refreshTokens(req, res, next));
router.post('/logout', (req: Request, res: Response, next: NextFunction) => authController.logout(req, res, next));
router.get('/verify-email/:token', (req: Request, res: Response, next: NextFunction) => authController.verifyEmail(req, res, next));
router.post('/forgot-password', (req: Request, res: Response, next: NextFunction) => authController.forgotPassword(req, res, next));
router.post('/reset-password/:token', (req: Request, res: Response, next: NextFunction) => authController.resetPassword(req, res, next));
router.put('/change-password', authenticate, (req: Request, res: Response, next: NextFunction) => authController.changePassword(req, res, next));
router.get('/profile', authenticate, (req: Request, res: Response, next: NextFunction) => authController.getProfile(req, res, next));
router.put('/profile', authenticate, (req: Request, res: Response, next: NextFunction) => authController.updateProfile(req, res, next));
router.delete('/account', authenticate, (req: Request, res: Response, next: NextFunction) => authController.deleteAccount(req, res, next));

export default router;

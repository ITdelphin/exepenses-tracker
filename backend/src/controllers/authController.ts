import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const user = await authService.register(name, email, password);
      sendSuccess(res, user, 'Registration successful. Please verify your email.', 201);
    } catch (err) { next(err); }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (err) { next(err); }
  }

  async refreshTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      sendSuccess(res, result, 'Tokens refreshed');
    } catch (err) { next(err); }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) { next(err); }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      await authService.verifyEmail(token);
      sendSuccess(res, null, 'Email verified successfully');
    } catch (err) { next(err); }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const resetToken = await authService.forgotPassword(email);
      sendSuccess(res, { resetToken }, 'Password reset link sent');
    } catch (err) { next(err); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      await authService.resetPassword(token, password);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (err) { next(err); }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.id, currentPassword, newPassword);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (err) { next(err); }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getProfile(req.user!.id);
      sendSuccess(res, profile);
    } catch (err) { next(err); }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, avatar } = req.body;
      const profile = await authService.updateProfile(req.user!.id, { name, avatar });
      sendSuccess(res, profile, 'Profile updated');
    } catch (err) { next(err); }
  }

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.deleteAccount(req.user!.id);
      sendSuccess(res, null, 'Account deleted');
    } catch (err) { next(err); }
  }
}

export const authController = new AuthController();

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken';
import { AuthPayload } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 400);

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, verificationToken },
      select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
    });

    // Create default categories for new user
    const defaultCategories = [
      { name: 'Food', icon: '🍔', color: '#FF6B6B', type: 'expense', isDefault: true },
      { name: 'Transport', icon: '🚗', color: '#4ECDC4', type: 'expense', isDefault: true },
      { name: 'Rent', icon: '🏠', color: '#45B7D1', type: 'expense', isDefault: true },
      { name: 'Shopping', icon: '🛍️', color: '#96CEB4', type: 'expense', isDefault: true },
      { name: 'Health', icon: '💊', color: '#FFEAA7', type: 'expense', isDefault: true },
      { name: 'Education', icon: '📚', color: '#DDA0DD', type: 'expense', isDefault: true },
      { name: 'Entertainment', icon: '🎬', color: '#98D8C8', type: 'expense', isDefault: true },
      { name: 'Bills', icon: '📄', color: '#F7DC6F', type: 'expense', isDefault: true },
      { name: 'Travel', icon: '✈️', color: '#BB8FCE', type: 'expense', isDefault: true },
      { name: 'Investment', icon: '📈', color: '#85C1E9', type: 'expense', isDefault: true },
      { name: 'Salary', icon: '💰', color: '#82E0AA', type: 'income', isDefault: true },
      { name: 'Business', icon: '💼', color: '#F8C471', type: 'income', isDefault: true },
      { name: 'Other', icon: '📌', color: '#ABB2B9', type: 'expense', isDefault: true },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map(c => ({ ...c, userId: user.id })),
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    const payload: AuthPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(token: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) throw new AppError('User not found', 401);

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const payload: AuthPayload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) throw new AppError('Invalid verification token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    return resetToken;
  }

  async resetPassword(token: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gte: new Date() } },
    });
    if (!user) throw new AppError('Invalid or expired reset token', 400);

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExp: null },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AppError('Current password is incorrect', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, avatar: true, isVerified: true, twoFactorEnabled: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, avatar: true, isVerified: true, createdAt: true },
    });
  }

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  }
}

export const authService = new AuthService();

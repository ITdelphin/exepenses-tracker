import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, getPaginationParams, paginate } from '../utils/helpers';

export class AdminController {
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const { search } = req.query;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true, _count: { select: { expenses: true, incomes: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      sendSuccess(res, { users, pagination: paginate(page, limit, total) });
    } catch (err) { next(err); }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [totalUsers, activeUsers, verifiedUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
        prisma.user.count({ where: { isVerified: true } }),
      ]);

      sendSuccess(res, {
        totalUsers,
        activeUsers7Days: activeUsers,
        verifiedUsers,
        systemStatus: 'Healthy',
        uptime: process.uptime(),
        nodeVersion: process.version,
      });
    } catch (err) { next(err); }
  }


  async deleteExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.expense.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 'Expense deleted by admin');
    } catch (err) { next(err); }
  }

  async manageCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
      sendSuccess(res, categories);
    } catch (err) { next(err); }
  }
}

export const adminController = new AdminController();

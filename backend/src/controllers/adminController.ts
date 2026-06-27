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
      const [totalUsers, totalExpenses, totalIncome, activeUsers, categoryStats] = await Promise.all([
        prisma.user.count(),
        prisma.expense.aggregate({ _sum: { amount: true }, _count: true }),
        prisma.income.aggregate({ _sum: { amount: true }, _count: true }),
        prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
        prisma.expense.groupBy({ by: ['categoryId'], _sum: { amount: true }, _count: true }),
      ]);

      const categoryIds = categoryStats.map(c => c.categoryId);
      const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));

      sendSuccess(res, {
        totalUsers,
        totalExpensesAmount: totalExpenses._sum.amount || 0,
        totalExpensesCount: totalExpenses._count,
        totalIncomeAmount: totalIncome._sum.amount || 0,
        totalIncomeCount: totalIncome._count,
        activeUsers30Days: activeUsers,
        categoryBreakdown: categoryStats.map(c => ({
          category: categoryMap.get(c.categoryId) || 'Unknown',
          total: c._sum.amount || 0,
          count: c._count,
        })),
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

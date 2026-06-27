import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class BudgetController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budgets = await prisma.budget.findMany({
        where: { userId: req.user!.id },
        include: { category: true },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      sendSuccess(res, budgets);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { month, year, limit, categoryId } = req.body;

      const existing = await prisma.budget.findFirst({
        where: { userId: req.user!.id, month, year, categoryId: categoryId || null },
      });
      if (existing) throw new AppError('Budget already exists for this period', 400);

      const budget = await prisma.budget.create({
        data: { month, year, limit: parseFloat(limit), categoryId, userId: req.user!.id },
        include: { category: true },
      });

      sendSuccess(res, budget, 'Budget created', 201);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.budget.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });
      if (!existing) throw new AppError('Budget not found', 404);

      const { limit, month, year } = req.body;
      const budget = await prisma.budget.update({
        where: { id: req.params.id },
        data: { ...(limit && { limit: parseFloat(limit) }), ...(month && { month }), ...(year && { year }) },
        include: { category: true },
      });

      sendSuccess(res, budget, 'Budget updated');
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.budget.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });
      if (!existing) throw new AppError('Budget not found', 404);

      await prisma.budget.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 'Budget deleted');
    } catch (err) { next(err); }
  }

  async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const budgets = await prisma.budget.findMany({
        where: { userId: req.user!.id, month, year },
        include: { category: true },
      });

      const budgetStatus = budgets.map(b => ({
        ...b,
        usagePercent: b.limit > 0 ? (b.spent / b.limit) * 100 : 0,
        remaining: Math.max(0, b.limit - b.spent),
      }));

      sendSuccess(res, budgetStatus);
    } catch (err) { next(err); }
  }
}

export const budgetController = new BudgetController();

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, getPaginationParams, paginate } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class ExpenseController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const { search, category, startDate, endDate, minAmount, maxAmount, paymentMethod, isImportant } = req.query;

      const where: any = { userId: req.user!.id };

      if (search) where.title = { contains: search as string, mode: 'insensitive' };
      if (category) where.categoryId = category as string;
      if (paymentMethod) where.paymentMethod = paymentMethod as string;
      if (isImportant === 'true') where.isImportant = true;
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }
      if (minAmount || maxAmount) {
        where.amount = {};
        if (minAmount) where.amount.gte = parseFloat(minAmount as string);
        if (maxAmount) where.amount.lte = parseFloat(maxAmount as string);
      }

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          include: { category: true, receipt: true },
          orderBy: { date: 'desc' },
          skip,
          take: limit,
        }),
        prisma.expense.count({ where }),
      ]);

      sendSuccess(res, { expenses, pagination: paginate(page, limit, total) });
    } catch (err) { next(err); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expense = await prisma.expense.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
        include: { category: true, receipt: true },
      });
      if (!expense) throw new AppError('Expense not found', 404);
      sendSuccess(res, expense);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, amount, categoryId, date, paymentMethod, notes, isImportant, isRecurring, recurringInterval, receiptId } = req.body;

      const expense = await prisma.expense.create({
        data: {
          title, description, amount: parseFloat(amount), categoryId,
          date: new Date(date), paymentMethod, notes, isImportant: isImportant || false,
          isRecurring: isRecurring || false, recurringInterval, receiptId,
          userId: req.user!.id,
        },
        include: { category: true },
      });

      // Check budget alerts
      await this.checkBudgetAlerts(req.user!.id, categoryId, parseFloat(amount));

      sendSuccess(res, expense, 'Expense added successfully', 201);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.expense.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });
      if (!existing) throw new AppError('Expense not found', 404);

      const { title, description, amount, categoryId, date, paymentMethod, notes, isImportant, isRecurring, recurringInterval } = req.body;

      const expense = await prisma.expense.update({
        where: { id: req.params.id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(amount && { amount: parseFloat(amount) }),
          ...(categoryId && { categoryId }),
          ...(date && { date: new Date(date) }),
          ...(paymentMethod && { paymentMethod }),
          ...(notes !== undefined && { notes }),
          ...(isImportant !== undefined && { isImportant }),
          ...(isRecurring !== undefined && { isRecurring }),
          ...(recurringInterval !== undefined && { recurringInterval }),
        },
        include: { category: true },
      });

      sendSuccess(res, expense, 'Expense updated successfully');
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.expense.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });
      if (!existing) throw new AppError('Expense not found', 404);

      await prisma.expense.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 'Expense deleted successfully');
    } catch (err) { next(err); }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const [totalExpenses, monthlyExpenses, weeklyExpenses, categoryBreakdown, recentTransactions] = await Promise.all([
        prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: { userId, date: { gte: startOfMonth } }, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: { userId, date: { gte: startOfWeek } }, _sum: { amount: true } }),
        prisma.expense.groupBy({ by: ['categoryId'], where: { userId, date: { gte: startOfMonth } }, _sum: { amount: true } }),
        prisma.expense.findMany({ where: { userId }, include: { category: true }, orderBy: { date: 'desc' }, take: 5 }),
      ]);

      // Get category names
      const categoryIds = categoryBreakdown.map(c => c.categoryId);
      const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
      const categoryMap = new Map<string, { name: string; icon: string | null; color: string | null }>(categories.map(c => [c.id, c]));

      const breakdown = categoryBreakdown.map(c => ({
        categoryId: c.categoryId,
        categoryName: categoryMap.get(c.categoryId)?.name || 'Unknown',
        total: c._sum.amount || 0,
      }));

      sendSuccess(res, {
        totalExpenses: totalExpenses._sum.amount || 0,
        monthlyExpenses: monthlyExpenses._sum.amount || 0,
        weeklyExpenses: weeklyExpenses._sum.amount || 0,
        categoryBreakdown: breakdown,
        recentTransactions,
      });
    } catch (err) { next(err); }
  }

  private async checkBudgetAlerts(userId: string, categoryId: string, amount: number) {
    const now = new Date();
    const budget = await prisma.budget.findFirst({
      where: { userId, categoryId, month: now.getMonth() + 1, year: now.getFullYear() },
    });

    if (budget) {
      const newSpent = budget.spent + amount;
      const usagePercent = (newSpent / budget.limit) * 100;

      if (usagePercent >= 100) {
        await prisma.notification.create({
          data: {
            type: 'BUDGET_EXCEEDED',
            title: 'Budget Exceeded',
            message: `You have exceeded your budget for this category!`,
            userId,
          },
        });
      } else if (usagePercent >= 80) {
        await prisma.notification.create({
          data: {
            type: 'BUDGET_WARNING',
            title: 'Budget Warning',
            message: `You have used ${usagePercent.toFixed(0)}% of your budget for this category.`,
            userId,
          },
        });
      }

      await prisma.budget.update({
        where: { id: budget.id },
        data: { spent: newSpent },
      });
    }
  }
}

export const expenseController = new ExpenseController();

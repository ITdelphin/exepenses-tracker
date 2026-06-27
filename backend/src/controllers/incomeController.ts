import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, getPaginationParams, paginate } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class IncomeController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const { search, category, startDate, endDate } = req.query;

      const where: any = { userId: req.user!.id };
      if (search) where.source = { contains: search as string, mode: 'insensitive' };
      if (category) where.categoryId = category as string;
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      const [incomes, total] = await Promise.all([
        prisma.income.findMany({ where, include: { category: true }, orderBy: { date: 'desc' }, skip, take: limit }),
        prisma.income.count({ where }),
      ]);

      sendSuccess(res, { incomes, pagination: paginate(page, limit, total) });
    } catch (err) { next(err); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const income = await prisma.income.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
        include: { category: true },
      });
      if (!income) throw new AppError('Income not found', 404);
      sendSuccess(res, income);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { source, description, amount, categoryId, date, isRecurring, recurringInterval } = req.body;

      const income = await prisma.income.create({
        data: {
          source, description, amount: parseFloat(amount), categoryId,
          date: new Date(date), isRecurring: isRecurring || false, recurringInterval,
          userId: req.user!.id,
        },
        include: { category: true },
      });

      sendSuccess(res, income, 'Income added successfully', 201);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.income.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });
      if (!existing) throw new AppError('Income not found', 404);

      const { source, description, amount, categoryId, date, isRecurring, recurringInterval } = req.body;

      const income = await prisma.income.update({
        where: { id: req.params.id },
        data: {
          ...(source && { source }),
          ...(description !== undefined && { description }),
          ...(amount && { amount: parseFloat(amount) }),
          ...(categoryId && { categoryId }),
          ...(date && { date: new Date(date) }),
          ...(isRecurring !== undefined && { isRecurring }),
          ...(recurringInterval !== undefined && { recurringInterval }),
        },
        include: { category: true },
      });

      sendSuccess(res, income, 'Income updated successfully');
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.income.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });
      if (!existing) throw new AppError('Income not found', 404);

      await prisma.income.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 'Income deleted successfully');
    } catch (err) { next(err); }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalIncome, monthlyIncome] = await Promise.all([
        prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
        prisma.income.aggregate({ where: { userId, date: { gte: startOfMonth } }, _sum: { amount: true } }),
      ]);

      sendSuccess(res, {
        totalIncome: totalIncome._sum.amount || 0,
        monthlyIncome: monthlyIncome._sum.amount || 0,
      });
    } catch (err) { next(err); }
  }
}

export const incomeController = new IncomeController();

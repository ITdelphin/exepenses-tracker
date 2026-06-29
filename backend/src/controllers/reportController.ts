import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';
import { reportService } from '../services/reportService';

export class ReportController {
  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, period } = req.body;
      const report = await reportService.generateReport(req.user!.id, type, period);
      sendSuccess(res, report, 'Report generated');
    } catch (err) { next(err); }
  }

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reports = await prisma.report.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      sendSuccess(res, reports);
    } catch (err) { next(err); }
  }

  async getMonthlyTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const months = 6;
      const trends: { month: string; year: number; income: number; expenses: number }[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        const [income, expense] = await Promise.all([
          prisma.income.aggregate({ where: { userId, date: { gte: start, lte: end } }, _sum: { amount: true } }),
          prisma.expense.aggregate({ where: { userId, date: { gte: start, lte: end } }, _sum: { amount: true } }),
        ]);

        trends.push({
          month: start.toLocaleString('default', { month: 'short' }),
          year: start.getFullYear(),
          income: income._sum.amount || 0,
          expenses: expense._sum.amount || 0,
        });
      }

      sendSuccess(res, trends);
    } catch (err) { next(err); }
  }

  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalIncome, totalExpenses, monthlyIncome, monthlyExpenses, budgets] = await Promise.all([
        prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
        prisma.income.aggregate({ where: { userId, date: { gte: startOfMonth } }, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: { userId, date: { gte: startOfMonth } }, _sum: { amount: true } }),
        prisma.budget.findMany({ where: { userId, month: now.getMonth() + 1, year: now.getFullYear() } }),
      ]);

      const ti = totalIncome._sum.amount || 0;
      const te = totalExpenses._sum.amount || 0;
      const mi = monthlyIncome._sum.amount || 0;
      const me = monthlyExpenses._sum.amount || 0;
      const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
      const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

      sendSuccess(res, {
        totalIncome: ti,
        totalExpenses: te,
        balance: ti - te,
        monthlyIncome: mi,
        monthlyExpenses: me,
        monthlySavings: mi - me,
        budgetStatus: {
          totalBudget,
          totalSpent,
          remaining: totalBudget - totalSpent,
          usagePercent: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        },
      });
    } catch (err) { next(err); }
  }
}

export const reportController = new ReportController();

import prisma from '../config/database';

export class ReportService {
  async generateReport(userId: string, type: string, period: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [expenses, incomes, budgets, categoryExpenses] = await Promise.all([
      prisma.expense.findMany({ where: { userId, date: { gte: startDate, lte: endDate } }, include: { category: true } }),
      prisma.income.findMany({ where: { userId, date: { gte: startDate, lte: endDate } }, include: { category: true } }),
      prisma.budget.findMany({ where: { userId, month: now.getMonth() + 1, year: now.getFullYear() }, include: { category: true } }),
      prisma.expense.groupBy({
        by: ['categoryId'],
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const savings = totalIncome - totalExpenses;

    const categoryIds = categoryExpenses.map(c => c.categoryId);
    const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const topCategories = categoryExpenses
      .map(c => ({ categoryId: c.categoryId, categoryName: categoryMap.get(c.categoryId) || 'Unknown', total: c._sum.amount || 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const budgetUsage = budgets.map(b => ({
      categoryName: b.category?.name || 'Overall',
      limit: b.limit,
      spent: b.spent,
      usagePercent: b.limit > 0 ? (b.spent / b.limit) * 100 : 0,
    }));

    // Daily breakdown for charts
    const dailyData: { [key: string]: { income: number; expense: number } } = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dailyData[key] = { income: 0, expense: 0 };
    }
    expenses.forEach(exp => {
      const key = exp.date.toISOString().split('T')[0];
      if (dailyData[key]) dailyData[key].expense += exp.amount;
    });
    incomes.forEach(inc => {
      const key = inc.date.toISOString().split('T')[0];
      if (dailyData[key]) dailyData[key].income += inc.amount;
    });

    const reportData = {
      period,
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      savings,
      transactionCount: expenses.length + incomes.length,
      topCategories,
      budgetUsage,
      dailyData: Object.entries(dailyData).map(([date, data]) => ({ date, ...data })),
      recentExpenses: expenses.slice(0, 10),
      recentIncomes: incomes.slice(0, 10),
    };

    // Save report
    await prisma.report.create({
      data: { type, period, data: reportData, userId },
    });

    return reportData;
  }
}

export const reportService = new ReportService();

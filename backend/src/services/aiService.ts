import prisma from '../config/database';

export class AIService {
  async analyzeSpendingHabits(userId: string) {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    const incomes = await prisma.income.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      orderBy: { date: 'asc' },
    });

    // Monthly breakdown
    const monthlyData: { [key: string]: { income: number; expenses: number; categories: { [key: string]: number } } } = {};
    for (const exp of expenses) {
      const key = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { income: 0, expenses: 0, categories: {} };
      monthlyData[key].expenses += exp.amount;
      monthlyData[key].categories[exp.category.name] = (monthlyData[key].categories[exp.category.name] || 0) + exp.amount;
    }
    for (const inc of incomes) {
      const key = `${inc.date.getFullYear()}-${String(inc.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { income: 0, expenses: 0, categories: {} };
      monthlyData[key].income += inc.amount;
    }

    // Category totals
    const categoryTotals: { [key: string]: number } = {};
    for (const exp of expenses) {
      categoryTotals[exp.category.name] = (categoryTotals[exp.category.name] || 0) + exp.amount;
    }

    // Average monthly spending
    const months = Object.keys(monthlyData).length || 1;
    const avgMonthlySpending = expenses.reduce((s, e) => s + e.amount, 0) / months;

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const avgMonthlyIncome = totalIncome / months;
    const savingsRate = avgMonthlyIncome > 0 ? ((avgMonthlyIncome - avgMonthlySpending) / avgMonthlyIncome) * 100 : 0;

    // Insights
    const insights: string[] = [];
    const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];
    if (topCategory) {
      insights.push(`Your biggest expense category is "${topCategory[0]}" at $${topCategory[1].toFixed(2)} total.`);
    }

    if (savingsRate < 10) {
      insights.push('Your savings rate is low. Try to save at least 20% of your income.');
    } else if (savingsRate < 20) {
      insights.push('Good savings rate! Aim for 20% to build a stronger financial future.');
    } else {
      insights.push('Excellent savings rate! Keep up the good work.');
    }

    // Detect unusual spending
    const averageByCategory: { [key: string]: number } = {};
    const categoryCount: { [key: string]: number } = {};
    for (const exp of expenses) {
      const cat = exp.category.name;
      averageByCategory[cat] = (averageByCategory[cat] || 0) + exp.amount;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
    for (const cat of Object.keys(averageByCategory)) {
      averageByCategory[cat] /= categoryCount[cat];
    }

    const unusualTransactions = expenses.filter(exp => {
      const avg = averageByCategory[exp.category.name] || exp.amount;
      return exp.amount > avg * 2;
    });

    return {
      monthlyData,
      categoryTotals,
      avgMonthlySpending,
      avgMonthlyIncome,
      savingsRate,
      insights,
      unusualTransactions: unusualTransactions.slice(0, 5),
      totalExpenses: expenses.length,
      totalIncome,
    };
  }

  async predictFutureExpenses(userId: string) {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: threeMonthsAgo } },
      include: { category: true },
    });

    const monthlyTotals: { [key: string]: number } = {};
    for (const exp of expenses) {
      const key = `${exp.date.getFullYear()}-${exp.date.getMonth() + 1}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + exp.amount;
    }

    const values = Object.values(monthlyTotals);
    const avgExpense = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    // Simple linear regression for trend
    let trend = 0;
    if (values.length > 1) {
      const n = values.length;
      const xMean = (n - 1) / 2;
      const yMean = values.reduce((a, b) => a + b, 0) / n;
      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (values[i] - yMean);
        denominator += (i - xMean) ** 2;
      }
      trend = denominator > 0 ? numerator / denominator : 0;
    }

    const predictedNextMonth = avgExpense + trend;

    return {
      predictedNextMonthExpenses: Math.max(0, predictedNextMonth),
      averageMonthlyExpense: avgExpense,
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      trendAmount: trend,
      monthlyHistory: monthlyTotals,
      confidence: values.length >= 3 ? 'high' : values.length >= 2 ? 'medium' : 'low',
    };
  }
}

export const aiService = new AIService();

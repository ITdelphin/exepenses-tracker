import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';
import { aiService } from '../services/aiService';

export class AIController {
  async analyzeSpending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analysis = await aiService.analyzeSpendingHabits(req.user!.id);
      sendSuccess(res, analysis, 'Spending analysis complete');
    } catch (err) { next(err); }
  }

  async predictExpenses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prediction = await aiService.predictFutureExpenses(req.user!.id);
      sendSuccess(res, prediction, 'Prediction generated');
    } catch (err) { next(err); }
  }

  async getFinancialSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [analysis, prediction] = await Promise.all([
        aiService.analyzeSpendingHabits(req.user!.id),
        aiService.predictFutureExpenses(req.user!.id),
      ]);

      const summary = {
        insights: analysis.insights,
        savingsRate: analysis.savingsRate,
        avgMonthlySpending: analysis.avgMonthlySpending,
        avgMonthlyIncome: analysis.avgMonthlyIncome,
        predictedNextMonth: prediction.predictedNextMonthExpenses,
        trend: prediction.trend,
        unusualTransactions: analysis.unusualTransactions,
        topCategories: Object.entries(analysis.categoryTotals)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([category, amount]) => ({ category, amount })),
        recommendations: this.generateRecommendations(analysis),
      };

      sendSuccess(res, summary, 'Financial summary generated');
    } catch (err) { next(err); }
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (analysis.savingsRate < 20) {
      recommendations.push('Consider setting up automatic transfers to a savings account each month.');
    }

    const topCat = Object.entries(analysis.categoryTotals).sort(([, a]: any, [, b]: any) => b - a)[0];
    if (topCat) {
      recommendations.push(`Review your "${topCat[0]}" expenses and look for ways to reduce them by 10%.`);
    }

    if (analysis.unusualTransactions && analysis.unusualTransactions.length > 0) {
      recommendations.push('Review unusual transactions flagged in your spending analysis.');
    }

    recommendations.push('Set monthly budget limits for each category to track spending better.');
    recommendations.push('Aim to save 20% of your income each month for long-term financial health.');

    return recommendations;
  }
}

export const aiController = new AIController();

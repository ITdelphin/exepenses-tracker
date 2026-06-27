import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class GoalController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const goals = await prisma.goal.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' } });
      sendSuccess(res, goals);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, targetAmount, deadline, category } = req.body;
      const goal = await prisma.goal.create({
        data: { title, targetAmount: parseFloat(targetAmount), deadline: deadline ? new Date(deadline) : null, category, userId: req.user!.id },
      });
      sendSuccess(res, goal, 'Goal created', 201);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.goal.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
      if (!existing) throw new AppError('Goal not found', 404);

      const { title, targetAmount, currentAmount, deadline } = req.body;
      const goal = await prisma.goal.update({
        where: { id: req.params.id },
        data: {
          ...(title && { title }),
          ...(targetAmount && { targetAmount: parseFloat(targetAmount) }),
          ...(currentAmount !== undefined && { currentAmount: parseFloat(currentAmount) }),
          ...(deadline && { deadline: new Date(deadline) }),
        },
      });
      sendSuccess(res, goal, 'Goal updated');
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.goal.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
      sendSuccess(res, null, 'Goal deleted');
    } catch (err) { next(err); }
  }
}

export const goalController = new GoalController();

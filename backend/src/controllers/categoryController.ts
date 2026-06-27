import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class CategoryController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        where: { userId: req.user!.id },
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, categories);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, icon, color, type } = req.body;
      const category = await prisma.category.create({
        data: { name, icon, color, type: type || 'expense', userId: req.user!.id },
      });
      sendSuccess(res, category, 'Category created', 201);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, icon, color } = req.body;
      const category = await prisma.category.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });
      if (!category) throw new AppError('Category not found', 404);

      const updated = await prisma.category.update({
        where: { id: req.params.id },
        data: { ...(name && { name }), ...(icon && { icon }), ...(color && { color }) },
      });
      sendSuccess(res, updated, 'Category updated');
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await prisma.category.findFirst({
        where: { id: req.params.id, userId: req.user!.id, isDefault: false },
      });
      if (!category) throw new AppError('Category not found or cannot be deleted', 404);

      await prisma.category.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 'Category deleted');
    } catch (err) { next(err); }
  }
}

export const categoryController = new CategoryController();

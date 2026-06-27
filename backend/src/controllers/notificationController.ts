import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';

export class NotificationController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      sendSuccess(res, notifications);
    } catch (err) { next(err); }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user!.id, id: req.params.id },
        data: { read: true },
      });
      sendSuccess(res, null, 'Notification marked as read');
    } catch (err) { next(err); }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user!.id },
        data: { read: true },
      });
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (err) { next(err); }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await prisma.notification.count({
        where: { userId: req.user!.id, read: false },
      });
      sendSuccess(res, { count });
    } catch (err) { next(err); }
  }
}

export const notificationController = new NotificationController();

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';

export class SettingsController {
    async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const settings = await prisma.systemSettings.findMany();
            sendSuccess(res, settings);
        } catch (err) { next(err); }
    }

    async updateSetting(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { key, value, description } = req.body;
            const setting = await prisma.systemSettings.upsert({
                where: { key },
                update: { value, description },
                create: { key, value, description },
            });
            sendSuccess(res, setting, 'Setting updated');
        } catch (err) { next(err); }
    }
}

export const settingsController = new SettingsController();

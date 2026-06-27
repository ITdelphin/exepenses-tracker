import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthPayload } from '../types';

export const generateAccessToken = (payload: AuthPayload): string => {
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any };
  return jwt.sign(payload as object, process.env.JWT_SECRET!, options);
};

export const generateRefreshToken = (payload: AuthPayload): string => {
  const options: SignOptions = { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any };
  return jwt.sign(payload as object, process.env.JWT_REFRESH_SECRET!, options);
};

export const verifyAccessToken = (token: string): AuthPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as AuthPayload;
};

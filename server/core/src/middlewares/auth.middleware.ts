import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';
import { UnauthorizedException } from '../exceptions';

export type AuthRequest = Request & { user?: { _id: string } };

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Unauthorized');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret) as { userId: string };
    req.user = { _id: decoded.userId };
    next();
  } catch {
    throw new UnauthorizedException('Unauthorized');
  }
};

export default authMiddleware;

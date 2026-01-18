import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { AppError } from '../errors/AppError';
import { ERROR_CODES } from '../errors/errorCodes';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        name: string;
      };
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new AppError(ERROR_CODES.INVALID_TOKEN, 401);
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 403);
    }

    next();
  };
}

// Alias para manter compatibilidade
export const authenticate = authMiddleware;

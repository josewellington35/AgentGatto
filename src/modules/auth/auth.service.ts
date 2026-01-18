import { prisma } from '@/config/database';
import { AppError } from '@/shared/errors/AppError';
import { ERROR_CODES } from '@/shared/errors/errorCodes';
import { hashPassword, comparePassword } from '@/shared/utils/password';
import { generateToken } from '@/shared/utils/jwt';
import { emailService } from '@/shared/utils/email';
import { logger } from '@/shared/utils/logger';
import { RegisterInput, LoginInput, AuthResponse } from './auth.types';

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS, 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phoneNumber: data.phoneNumber,
        role: data.role || 'CLIENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
      },
    });

    const token = generateToken({
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    emailService.sendWelcomeEmail(user).catch((error) => {
      logger.error('Failed to send welcome email', { error, userId: user.id });
    });

    logger.info(`User registered: ${user.email}`, { userId: user.id });

    return { token, user };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    const token = generateToken({
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${user.email}`, { userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    };
  }
}

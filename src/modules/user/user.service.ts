import { prisma } from '@/config/database';
import { AppError } from '@/shared/errors/AppError';
import { ERROR_CODES } from '@/shared/errors/errorCodes';
import { logger } from '@/shared/utils/logger';
import { comparePassword, hashPassword } from '@/shared/utils/password';
import { UpdateProfileInput, ChangePasswordInput, UserProfile, UserStats } from './user.types';
import { BookingStatus } from '@prisma/client';

export class UserService {
  /**
   * Busca o perfil completo do usuário
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
    }

    return user;
  }

  /**
   * Atualiza o perfil do usuário
   */
  async updateProfile(userId: string, data: UpdateProfileInput): Promise<UserProfile> {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`User profile updated: ${updatedUser.email}`, {
      userId: updatedUser.id,
      changes: data,
    });

    return updatedUser;
  }

  /**
   * Altera a senha do usuário
   */
  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    // Buscar o usuário com a senha
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Verificar se a senha atual está correta
    const isPasswordValid = await comparePassword(data.currentPassword, user.password);

    if (!isPasswordValid) {
      logger.warn(`Failed password change attempt for user ${user.email}`, {
        userId: user.id,
      });
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(data.newPassword);

    // Atualizar a senha
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    logger.info(`Password changed for user: ${user.email}`, {
      userId: user.id,
    });
  }

  /**
   * Deleta a conta do usuário
   */
  async deleteAccount(userId: string): Promise<void> {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: {
          where: {
            status: {
              in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Verificar se há agendamentos ativos
    if (user.bookings.length > 0) {
      throw new AppError(
        'Não é possível deletar a conta com agendamentos ativos. Cancele ou conclua todos os agendamentos primeiro.',
        400
      );
    }

    // Deletar o usuário (cascade vai deletar relacionamentos)
    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`User account deleted: ${user.email}`, {
      userId: user.id,
    });
  }

  /**
   * Busca estatísticas do usuário
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Contar bookings por status
    const [totalBookings, completedBookings, cancelledBookings, pendingBookings] = await Promise.all([
      prisma.booking.count({
        where: { userId },
      }),
      prisma.booking.count({
        where: { userId, status: BookingStatus.COMPLETED },
      }),
      prisma.booking.count({
        where: { userId, status: BookingStatus.CANCELLED },
      }),
      prisma.booking.count({
        where: {
          userId,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
      }),
    ]);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
    };
  }
}

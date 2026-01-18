import { prisma } from '@/config/database';
import { AppError } from '@/shared/errors/AppError';
import { BookingStatus } from '@prisma/client';
import {
  CreateReviewDTO,
  UpdateReviewDTO,
  ReviewResponseDTO,
  GetReviewsQuery,
  ReviewStatsDTO,
} from './review.types';

export class ReviewService {
  /**
   * Formata response de uma review
   */
  private formatReviewResponse(review: any): ReviewResponseDTO {
    return {
      id: review.id,
      bookingId: review.bookingId,
      userId: review.userId,
      userName: review.user.name,
      serviceId: review.booking.serviceId,
      serviceName: review.booking.service.name,
      companyId: review.booking.service.companyId,
      companyName: review.booking.service.company.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  /**
   * Cria uma avaliação para um agendamento
   */
  async createReview(
    userId: string,
    data: CreateReviewDTO
  ): Promise<ReviewResponseDTO> {
    // Verificar se o booking existe e pertence ao usuário
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        service: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    if (booking.userId !== userId) {
      throw new AppError('Você não tem permissão para avaliar este agendamento', 403);
    }

    // Verificar se o agendamento foi concluído
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new AppError('Só é possível avaliar agendamentos concluídos', 400);
    }

    // Verificar se já existe uma avaliação para este booking
    const existingReview = await prisma.review.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existingReview) {
      throw new AppError('Este agendamento já foi avaliado', 400);
    }

    // Criar a review
    const review = await prisma.review.create({
      data: {
        userId,
        bookingId: data.bookingId,
        serviceId: booking.serviceId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: true,
        booking: {
          include: {
            service: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    // Atualizar rating do serviço
    await this.updateServiceRating(booking.serviceId);

    // Atualizar rating da empresa
    await this.updateCompanyRating(booking.service.companyId);

    return this.formatReviewResponse(review);
  }

  /**
   * Busca avaliações com filtros
   */
  async getReviews(query: GetReviewsQuery) {
    const {
      serviceId,
      companyId,
      userId,
      minRating,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (minRating) {
      where.rating = { gte: minRating };
    }

    if (serviceId) {
      where.booking = {
        serviceId,
      };
    }

    if (companyId) {
      where.booking = {
        service: {
          companyId,
        },
      };
    }

    // Buscar reviews
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          booking: {
            include: {
              service: {
                include: {
                  company: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews: reviews.map(this.formatReviewResponse),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Busca uma review por ID
   */
  async getReviewById(reviewId: string): Promise<ReviewResponseDTO> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: true,
        booking: {
          include: {
            service: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new AppError('Avaliação não encontrada', 404);
    }

    return this.formatReviewResponse(review);
  }

  /**
   * Atualiza uma review
   */
  async updateReview(
    reviewId: string,
    userId: string,
    data: UpdateReviewDTO
  ): Promise<ReviewResponseDTO> {
    // Verificar se a review existe e pertence ao usuário
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        booking: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!existingReview) {
      throw new AppError('Avaliação não encontrada', 404);
    }

    if (existingReview.userId !== userId) {
      throw new AppError('Você não tem permissão para editar esta avaliação', 403);
    }

    // Atualizar a review
    const review = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        user: true,
        booking: {
          include: {
            service: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    // Se o rating foi alterado, atualizar ratings do serviço e empresa
    if (data.rating !== undefined) {
      await this.updateServiceRating(existingReview.booking.serviceId);
      await this.updateCompanyRating(existingReview.booking.service.companyId);
    }

    return this.formatReviewResponse(review);
  }

  /**
   * Remove uma review
   */
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    // Verificar se a review existe e pertence ao usuário
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        booking: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!review) {
      throw new AppError('Avaliação não encontrada', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('Você não tem permissão para deletar esta avaliação', 403);
    }

    // Deletar a review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Atualizar ratings do serviço e empresa
    await this.updateServiceRating(review.booking.serviceId);
    await this.updateCompanyRating(review.booking.service.companyId);
  }

  /**
   * Busca estatísticas de avaliações de um serviço
   */
  async getServiceStats(serviceId: string): Promise<ReviewStatsDTO> {
    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    // Buscar todas as reviews do serviço
    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          serviceId,
        },
      },
      select: {
        rating: true,
      },
    });

    return this.calculateStats(reviews);
  }

  /**
   * Busca estatísticas de avaliações de uma empresa
   */
  async getCompanyStats(companyId: string): Promise<ReviewStatsDTO> {
    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    // Buscar todas as reviews da empresa
    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          service: {
            companyId,
          },
        },
      },
      select: {
        rating: true,
      },
    });

    return this.calculateStats(reviews);
  }

  /**
   * Calcula estatísticas de reviews
   */
  private calculateStats(reviews: { rating: number }[]): ReviewStatsDTO {
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let sumRatings = 0;

    reviews.forEach((review) => {
      sumRatings += review.rating;
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      averageRating: parseFloat((sumRatings / totalReviews).toFixed(2)),
      totalReviews,
      ratingDistribution,
    };
  }

  /**
   * Atualiza o rating de um serviço
   */
  private async updateServiceRating(serviceId: string): Promise<void> {
    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          serviceId,
        },
      },
      select: {
        rating: true,
      },
    });

    const stats = this.calculateStats(reviews);

    await prisma.service.update({
      where: { id: serviceId },
      data: {
        rating: stats.averageRating,
      },
    });
  }

  /**
   * Atualiza o rating de uma empresa
   */
  private async updateCompanyRating(companyId: string): Promise<void> {
    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          service: {
            companyId,
          },
        },
      },
      select: {
        rating: true,
      },
    });

    const stats = this.calculateStats(reviews);

    await prisma.company.update({
      where: { id: companyId },
      data: {
        rating: stats.averageRating,
      },
    });
  }
}

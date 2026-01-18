import { PrismaClient, Prisma, BookingStatus } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  UpdateCompanyStatusDTO,
  CreateTimeSlotDTO,
  UpdateTimeSlotDTO,
  SearchCompaniesQuery,
  CompanyResponseDTO,
  CompanyDetailResponseDTO,
  TimeSlotResponseDTO,
  CompanyStatsDTO,
  CompaniesListResponseDTO,
} from './company.types';

const prisma = new PrismaClient();

export class CompanyService {
  /**
   * Cria uma nova empresa (status PENDING)
   */
  async createCompany(data: CreateCompanyDTO): Promise<CompanyResponseDTO> {
    // Verificar se email já existe
    const existingCompany = await prisma.company.findUnique({
      where: { email: data.email },
    });

    if (existingCompany) {
      throw new AppError('Email já cadastrado', 409);
    }

    // Criar empresa com status PENDING
    const company = await prisma.company.create({
      data: {
        ...data,
        status: 'PENDING',
        rating: 0,
      },
    });

    return this.formatCompanyResponse(company);
  }

  /**
   * Lista empresas com filtros
   */
  async searchCompanies(query: SearchCompaniesQuery): Promise<CompaniesListResponseDTO> {
    const {
      search,
      category,
      city,
      status = 'APPROVED', // Padrão: apenas aprovadas
      minRating,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    // Construir filtros
    const where: Prisma.CompanyWhereInput = {
      status,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Construir ordenação
    const orderBy: Prisma.CompanyOrderByWithRelationInput = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Buscar empresas
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);

    return {
      companies: companies.map(this.formatCompanyResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca uma empresa por ID com detalhes
   */
  async getCompanyById(companyId: string, includeDetails = true): Promise<CompanyDetailResponseDTO> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: includeDetails
        ? {
            services: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                price: true,
                duration: true,
                rating: true,
              },
              take: 10,
            },
            timeSlots: {
              where: { isActive: true },
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            },
          }
        : undefined,
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    const formatted = this.formatCompanyResponse(company);

    if (!includeDetails) {
      return formatted;
    }

    // Buscar estatísticas
    const [totalServices, totalBookings, completedBookings, cancelledBookings] = await Promise.all([
      prisma.service.count({ where: { companyId } }),
      prisma.booking.count({
        where: {
          service: { companyId },
        },
      }),
      prisma.booking.count({
        where: {
          service: { companyId },
          status: BookingStatus.COMPLETED,
        },
      }),
      prisma.booking.count({
        where: {
          service: { companyId },
          status: BookingStatus.CANCELLED,
        },
      }),
    ]);

    return {
      ...formatted,
      services: (company as any).services?.map((service: any) => ({
        id: service.id,
        name: service.name,
        price: service.price.toString(),
        duration: service.duration,
        rating: service.rating,
      })),
      timeSlots: (company as any).timeSlots?.map(this.formatTimeSlotResponse),
      stats: {
        totalServices,
        totalBookings,
        completedBookings,
        cancelledBookings,
      },
    };
  }

  /**
   * Atualiza dados da empresa
   */
  async updateCompany(
    companyId: string,
    data: UpdateCompanyDTO
  ): Promise<CompanyResponseDTO> {
    // Verificar se empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    // Se está mudando email, verificar se já não existe
    if (data.email && data.email !== company.email) {
      const existingCompany = await prisma.company.findUnique({
        where: { email: data.email },
      });

      if (existingCompany) {
        throw new AppError('Email já cadastrado', 409);
      }
    }

    // Atualizar
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return this.formatCompanyResponse(updatedCompany);
  }

  /**
   * Atualiza status da empresa (ADMIN)
   */
  async updateCompanyStatus(
    companyId: string,
    data: UpdateCompanyStatusDTO
  ): Promise<CompanyResponseDTO> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        status: data.status,
        updatedAt: new Date(),
      },
    });

    // TODO: Enviar notificação para empresa sobre mudança de status

    return this.formatCompanyResponse(updatedCompany);
  }

  /**
   * Lista empresas pendentes (ADMIN)
   */
  async getPendingCompanies(): Promise<CompanyResponseDTO[]> {
    const companies = await prisma.company.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });

    return companies.map(this.formatCompanyResponse);
  }

  /**
   * Deleta uma empresa (soft delete - muda status para REJECTED)
   */
  async deleteCompany(companyId: string): Promise<void> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        services: {
          include: {
            bookings: true,
          },
        },
      },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    // Verificar se há agendamentos futuros
    const hasActiveBookings = company.services.some((service) =>
      service.bookings.some(
        (booking) =>
          (booking.status === 'PENDING' || booking.status === 'CONFIRMED') &&
          booking.date >= new Date()
      )
    );

    if (hasActiveBookings) {
      throw new AppError(
        'Não é possível deletar empresa com agendamentos ativos',
        400
      );
    }

    // Soft delete
    await prisma.company.update({
      where: { id: companyId },
      data: { status: 'REJECTED' },
    });
  }

  // ===== TIME SLOTS =====

  /**
   * Cria um time slot para a empresa
   */
  async createTimeSlot(data: CreateTimeSlotDTO): Promise<TimeSlotResponseDTO> {
    // Verificar se empresa existe e está aprovada
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    if (company.status !== 'APPROVED') {
      throw new AppError('Apenas empresas aprovadas podem criar horários', 403);
    }

    // Criar time slot
    const timeSlot = await prisma.timeSlot.create({
      data: {
        companyId: data.companyId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        isActive: true,
      },
    });

    return this.formatTimeSlotResponse(timeSlot);
  }

  /**
   * Lista time slots de uma empresa
   */
  async getCompanyTimeSlots(companyId: string, includeInactive = false): Promise<TimeSlotResponseDTO[]> {
    const where: Prisma.TimeSlotWhereInput = {
      companyId,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return timeSlots.map(this.formatTimeSlotResponse);
  }

  /**
   * Atualiza um time slot
   */
  async updateTimeSlot(
    timeSlotId: string,
    companyId: string,
    data: UpdateTimeSlotDTO
  ): Promise<TimeSlotResponseDTO> {
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    });

    if (!timeSlot) {
      throw new AppError('Horário não encontrado', 404);
    }

    if (timeSlot.companyId !== companyId) {
      throw new AppError('Sem permissão para atualizar este horário', 403);
    }

    const updatedTimeSlot = await prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return this.formatTimeSlotResponse(updatedTimeSlot);
  }

  /**
   * Deleta um time slot
   */
  async deleteTimeSlot(timeSlotId: string, companyId: string): Promise<void> {
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    });

    if (!timeSlot) {
      throw new AppError('Horário não encontrado', 404);
    }

    if (timeSlot.companyId !== companyId) {
      throw new AppError('Sem permissão para deletar este horário', 403);
    }

    await prisma.timeSlot.delete({
      where: { id: timeSlotId },
    });
  }

  /**
   * Busca estatísticas da empresa
   */
  async getCompanyStats(companyId: string): Promise<CompanyStatsDTO> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    const [
      totalServices,
      activeServices,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      revenueData,
      recentBookingsData,
    ] = await Promise.all([
      prisma.service.count({ where: { companyId } }),
      prisma.service.count({ where: { companyId, isActive: true } }),
      prisma.booking.count({
        where: { service: { companyId } },
      }),
      prisma.booking.count({
        where: {
          service: { companyId },
          status: BookingStatus.PENDING,
        },
      }),
      prisma.booking.count({
        where: {
          service: { companyId },
          status: BookingStatus.CONFIRMED,
        },
      }),
      prisma.booking.count({
        where: {
          service: { companyId },
          status: BookingStatus.COMPLETED,
        },
      }),
      prisma.booking.count({
        where: {
          service: { companyId },
          status: BookingStatus.CANCELLED,
        },
      }),
      prisma.booking.aggregate({
        where: {
          service: { companyId },
          status: BookingStatus.COMPLETED,
        },
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.booking.findMany({
        where: {
          service: { companyId },
        },
        include: {
          service: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalRevenue = Number(revenueData._sum.totalPrice || 0);

    const recentBookings = recentBookingsData.map((booking) => ({
      id: booking.id,
      date: booking.date.toISOString(),
      timeSlot: booking.timeSlot,
      status: booking.status,
      serviceName: booking.service.name,
      clientName: booking.user.name,
    }));

    return {
      totalServices,
      activeServices,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      averageRating: company.rating,
      recentBookings,
    };
  }

  /**
   * Formata a resposta de uma empresa
   */
  private formatCompanyResponse(company: any): CompanyResponseDTO {
    return {
      id: company.id,
      name: company.name,
      responsible: company.responsible,
      email: company.email,
      phoneNumber: company.phoneNumber,
      address: company.address,
      city: company.city,
      state: company.state,
      zipCode: company.zipCode,
      latitude: company.latitude,
      longitude: company.longitude,
      category: company.category,
      description: company.description,
      status: company.status,
      logo: company.logo,
      coverImage: company.coverImage,
      rating: company.rating,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    };
  }

  /**
   * Formata a resposta de um time slot
   */
  private formatTimeSlotResponse(timeSlot: any): TimeSlotResponseDTO {
    return {
      id: timeSlot.id,
      companyId: timeSlot.companyId,
      dayOfWeek: timeSlot.dayOfWeek,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      duration: timeSlot.duration,
      isActive: timeSlot.isActive,
      createdAt: timeSlot.createdAt.toISOString(),
      updatedAt: timeSlot.updatedAt.toISOString(),
    };
  }
}

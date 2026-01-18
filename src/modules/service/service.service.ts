import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import {
  CreateServiceDTO,
  UpdateServiceDTO,
  SearchServicesQuery,
  ServiceResponseDTO,
  ServiceDetailResponseDTO,
  ServicesListResponseDTO,
} from './service.types';

const prisma = new PrismaClient();

export class ServiceService {
  /**
   * Cria um novo serviço
   */
  async createService(data: CreateServiceDTO): Promise<ServiceResponseDTO> {
    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    // Verificar se a empresa está aprovada
    if (company.status !== 'APPROVED') {
      throw new AppError('Apenas empresas aprovadas podem criar serviços', 403);
    }

    // Criar o serviço
    const service = await prisma.service.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        category: data.category,
        imageUrl: data.imageUrl,
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
            city: true,
            rating: true,
            logo: true,
          },
        },
      },
    });

    return this.formatServiceResponse(service);
  }

  /**
   * Lista serviços com filtros e busca
   */
  async searchServices(query: SearchServicesQuery): Promise<ServicesListResponseDTO> {
    const {
      search,
      category,
      companyId,
      city,
      minPrice,
      maxPrice,
      isActive = true,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    // Construir filtros
    const where: Prisma.ServiceWhereInput = {
      isActive,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          company: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (category || city) {
      where.company = {};
      if (category) {
        where.company.category = category;
      }
      if (city) {
        where.company.city = { contains: city, mode: 'insensitive' };
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Construir ordenação
    const orderBy: Prisma.ServiceOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Buscar serviços
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              category: true,
              address: true,
              city: true,
              rating: true,
              logo: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return {
      services: services.map(this.formatServiceResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca um serviço por ID com detalhes
   */
  async getServiceById(serviceId: string): Promise<ServiceDetailResponseDTO> {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
            city: true,
            rating: true,
            logo: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    const formattedService = this.formatServiceResponse(service);

    // Adicionar reviews formatadas
    const reviews = service.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment || undefined,
      userName: review.user.name,
      createdAt: review.createdAt.toISOString(),
    }));

    return {
      ...formattedService,
      reviews,
    };
  }

  /**
   * Lista serviços de uma empresa
   */
  async getCompanyServices(companyId: string, includeInactive = false): Promise<ServiceResponseDTO[]> {
    const where: Prisma.ServiceWhereInput = {
      companyId,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
            city: true,
            rating: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return services.map(this.formatServiceResponse);
  }

  /**
   * Atualiza um serviço
   */
  async updateService(
    serviceId: string,
    companyId: string,
    data: UpdateServiceDTO
  ): Promise<ServiceResponseDTO> {
    // Buscar serviço
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    // Verificar se o serviço pertence à empresa
    if (service.companyId !== companyId) {
      throw new AppError('Sem permissão para atualizar este serviço', 403);
    }

    // Atualizar
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.duration && { duration: data.duration }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
            city: true,
            rating: true,
            logo: true,
          },
        },
      },
    });

    return this.formatServiceResponse(updatedService);
  }

  /**
   * Desativa um serviço (soft delete)
   */
  async deactivateService(serviceId: string, companyId: string): Promise<ServiceResponseDTO> {
    return this.updateService(serviceId, companyId, { isActive: false });
  }

  /**
   * Ativa um serviço
   */
  async activateService(serviceId: string, companyId: string): Promise<ServiceResponseDTO> {
    return this.updateService(serviceId, companyId, { isActive: true });
  }

  /**
   * Deleta um serviço permanentemente
   * Apenas se não houver agendamentos associados
   */
  async deleteService(serviceId: string, companyId: string): Promise<void> {
    // Buscar serviço
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        bookings: true,
      },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    // Verificar permissão
    if (service.companyId !== companyId) {
      throw new AppError('Sem permissão para deletar este serviço', 403);
    }

    // Verificar se há agendamentos
    if (service.bookings.length > 0) {
      throw new AppError(
        'Não é possível deletar serviço com agendamentos. Desative-o ao invés disso.',
        400
      );
    }

    // Deletar
    await prisma.service.delete({
      where: { id: serviceId },
    });
  }

  /**
   * Busca serviços populares (mais bem avaliados)
   */
  async getPopularServices(limit = 10): Promise<ServiceResponseDTO[]> {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        rating: { gt: 0 },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
            city: true,
            rating: true,
            logo: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
      take: limit,
    });

    return services.map(this.formatServiceResponse);
  }

  /**
   * Busca serviços recentes
   */
  async getRecentServices(limit = 10): Promise<ServiceResponseDTO[]> {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
            city: true,
            rating: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return services.map(this.formatServiceResponse);
  }

  /**
   * Formata a resposta de um serviço
   */
  private formatServiceResponse(service: any): ServiceResponseDTO {
    return {
      id: service.id,
      companyId: service.companyId,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price.toString(),
      isActive: service.isActive,
      imageUrl: service.imageUrl,
      rating: service.rating,
      totalReviews: service.totalReviews,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
      company: service.company,
    };
  }
}

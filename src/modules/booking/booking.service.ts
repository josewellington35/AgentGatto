import { PrismaClient, BookingStatus } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import {
  CreateBookingDTO,
  BookingResponseDTO,
  AvailabilityResponseDTO,
  AvailableSlot,
  GetBookingsQuery,
  GetCompanyBookingsQuery,
} from './booking.types';

const prisma = new PrismaClient();

export class BookingService {
  /**
   * Cria um novo agendamento com validação de disponibilidade
   */
  async createBooking(
    userId: string,
    data: CreateBookingDTO
  ): Promise<BookingResponseDTO> {
    // 1. Verificar se o serviço existe e está ativo
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            address: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    if (!service.isActive) {
      throw new AppError('Serviço não está disponível', 400);
    }

    // 2. Verificar se a data/horário não está no passado
    const bookingDateTime = new Date(`${data.date.split('T')[0]}T${data.timeSlot}:00`);
    const now = new Date();
    
    if (bookingDateTime < now) {
      throw new AppError(
        'Não é possível agendar em horários passados',
        400
      );
    }

    // 3. Verificar double booking - PREVENÇÃO CRÍTICA
    const existingBooking = await prisma.booking.findFirst({
      where: {
        serviceId: data.serviceId,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        status: {
          in: ['PENDING', 'CONFIRMED'], // Considera apenas agendamentos ativos
        },
      },
    });

    if (existingBooking) {
      throw new AppError(
        'Este horário já está reservado',
        409
      );
    }

    // 4. Verificar se o horário está dentro dos time slots da empresa
    const dayOfWeek = new Date(data.date).getDay();
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        companyId: service.companyId,
        isActive: true,
        OR: [
          { dayOfWeek: dayOfWeek },
          { dayOfWeek: null }, // Time slots que aplicam para todos os dias
        ],
      },
    });

    const isTimeSlotValid = timeSlots.some((slot) => {
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;
      return data.timeSlot >= slotStart && data.timeSlot < slotEnd;
    });

    if (!isTimeSlotValid) {
      throw new AppError(
        'Horário fora do expediente da empresa',
        400
      );
    }

    // 5. Criar o agendamento
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId: data.serviceId,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        totalPrice: service.price,
        notes: data.notes,
        status: 'PENDING',
      },
      include: {
        service: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                address: true,
                phoneNumber: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    // TODO: Enviar notificação para a empresa e usuário

    return this.formatBookingResponse(booking);
  }

  /**
   * Lista agendamentos do usuário
   */
  async getUserBookings(
    userId: string,
    query: GetBookingsQuery = {}
  ): Promise<{ bookings: BookingResponseDTO[]; total: number; page: number; limit: number }> {
    const { status, startDate, endDate, page = 1, limit = 10 } = query;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          service: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings: bookings.map(this.formatBookingResponse),
      total,
      page,
      limit,
    };
  }

  /**
   * Lista agendamentos de uma empresa (para empresas)
   */
  async getCompanyBookings(
    companyId: string,
    query: GetCompanyBookingsQuery = {}
  ): Promise<{ bookings: BookingResponseDTO[]; total: number; page: number; limit: number }> {
    const { status, serviceId, startDate, endDate, page = 1, limit = 10 } = query;

    const where: any = {
      service: {
        companyId,
      },
    };

    if (status) {
      where.status = status;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          service: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings: bookings.map(this.formatBookingResponse),
      total,
      page,
      limit,
    };
  }

  /**
   * Busca um agendamento por ID
   */
  async getBookingById(bookingId: string, userId: string): Promise<BookingResponseDTO> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                address: true,
                phoneNumber: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    // Verificar se o usuário tem permissão para ver este agendamento
    if (booking.userId !== userId) {
      throw new AppError('Sem permissão para acessar este agendamento', 403);
    }

    return this.formatBookingResponse(booking);
  }

  /**
   * Cancela um agendamento
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    cancellationReason?: string
  ): Promise<BookingResponseDTO> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    // Verificar permissão
    if (booking.userId !== userId) {
      throw new AppError('Sem permissão para cancelar este agendamento', 403);
    }

    // Verificar se já está cancelado
    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError('Agendamento já está cancelado', 400);
    }

    // Verificar se já foi concluído
    if (booking.status === BookingStatus.COMPLETED) {
      throw new AppError('Não é possível cancelar agendamento concluído', 400);
    }

    // Atualizar status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason,
        updatedAt: new Date(),
      },
      include: {
        service: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                address: true,
                phoneNumber: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    // TODO: Enviar notificação de cancelamento

    return this.formatBookingResponse(updatedBooking);
  }

  /**
   * Atualiza o status de um agendamento (para empresas)
   */
  async updateBookingStatus(
    bookingId: string,
    companyId: string,
    status: BookingStatus
  ): Promise<BookingResponseDTO> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    // Verificar se o agendamento pertence à empresa
    if (booking.service.companyId !== companyId) {
      throw new AppError('Sem permissão para atualizar este agendamento', 403);
    }

    // Atualizar status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        service: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                address: true,
                phoneNumber: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    // TODO: Enviar notificação de mudança de status

    return this.formatBookingResponse(updatedBooking);
  }

  /**
   * Verifica disponibilidade de horários para um serviço em uma data
   */
  async checkAvailability(serviceId: string, date: string): Promise<AvailabilityResponseDTO> {
    // 1. Buscar serviço
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        company: true,
      },
    });

    if (!service) {
      throw new AppError('Serviço não encontrado', 404);
    }

    // 2. Buscar time slots da empresa para o dia da semana
    const dayOfWeek = new Date(date).getDay();
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        companyId: service.companyId,
        isActive: true,
        OR: [
          { dayOfWeek: dayOfWeek },
          { dayOfWeek: null },
        ],
      },
    });

    if (timeSlots.length === 0) {
      return {
        date,
        slots: [],
      };
    }

    // 3. Buscar agendamentos existentes para a data
    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId,
        date: new Date(date),
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        timeSlot: true,
      },
    });

    const bookedSlots = new Set(existingBookings.map((b) => b.timeSlot));

    // 4. Gerar slots disponíveis
    const availableSlots: AvailableSlot[] = [];

    for (const timeSlot of timeSlots) {
      const startTime = this.parseTime(timeSlot.startTime);
      const endTime = this.parseTime(timeSlot.endTime);
      const duration = service.duration;

      let currentTime = startTime;

      while (currentTime + duration <= endTime) {
        const timeString = this.formatTime(currentTime);
        availableSlots.push({
          time: timeString,
          isAvailable: !bookedSlots.has(timeString),
        });

        currentTime += duration;
      }
    }

    // Ordenar por horário
    availableSlots.sort((a, b) => a.time.localeCompare(b.time));

    return {
      date,
      slots: availableSlots,
    };
  }

  /**
   * Formata a resposta de um booking
   */
  private formatBookingResponse(booking: any): BookingResponseDTO {
    return {
      id: booking.id,
      userId: booking.userId,
      serviceId: booking.serviceId,
      date: booking.date.toISOString(),
      timeSlot: booking.timeSlot,
      status: booking.status,
      totalPrice: booking.totalPrice.toString(),
      notes: booking.notes,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      service: booking.service
        ? {
            id: booking.service.id,
            name: booking.service.name,
            description: booking.service.description,
            duration: booking.service.duration,
            price: booking.service.price.toString(),
            companyId: booking.service.companyId,
            company: booking.service.company,
          }
        : undefined,
      user: booking.user,
    };
  }

  /**
   * Converte string de horário para minutos (ex: "09:00" -> 540)
   */
  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Converte minutos para string de horário (ex: 540 -> "09:00")
   */
  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}


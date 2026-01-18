import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';
import { BookingStatus } from '@prisma/client';
import {
  CreateBookingDTO,
  GetBookingsQuery,
  GetCompanyBookingsQuery,
} from './booking.types';

const bookingService = new BookingService();

export class BookingController {
  /**
   * POST /api/bookings
   * Cria um novo agendamento
   */
  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const bookingData: CreateBookingDTO = req.body;

      const booking = await bookingService.createBooking(userId, bookingData);

      res.status(201).json({
        success: true,
        message: 'Agendamento criado com sucesso',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bookings
   * Lista agendamentos do usuário
   */
  async getUserBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: GetBookingsQuery = {
        status: req.query.status as BookingStatus,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };

      const result = await bookingService.getUserBookings(userId, query);

      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bookings/:id
   * Busca um agendamento específico
   */
  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const bookingId = String(req.params.id);

      const booking = await bookingService.getBookingById(bookingId, userId);

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/bookings/:id/cancel
   * Cancela um agendamento
   */
  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const bookingId = String(req.params.id);
      const { cancellationReason } = req.body;

      const booking = await bookingService.cancelBooking(bookingId, userId, cancellationReason);

      res.status(200).json({
        success: true,
        message: 'Agendamento cancelado com sucesso',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bookings/availability/:serviceId
   * Verifica disponibilidade de horários
   */
  async checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceId = String(req.params.serviceId);
      const date = req.query.date as string;

      if (!date) {
        res.status(400).json({
          success: false,
          message: 'Data é obrigatória',
        });
        return;
      }

      const availability = await bookingService.checkAvailability(serviceId, date);

      res.status(200).json({
        success: true,
        data: availability,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bookings/company/:companyId
   * Lista agendamentos de uma empresa (apenas para empresas)
   */
  async getCompanyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = String(req.params.companyId);
      const query: GetCompanyBookingsQuery = {
        status: req.query.status as BookingStatus,
        serviceId: req.query.serviceId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };

      // TODO: Verificar se o usuário tem permissão para acessar essa empresa

      const result = await bookingService.getCompanyBookings(companyId, query);

      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/bookings/:id/status
   * Atualiza status do agendamento (apenas para empresas)
   */
  async updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingId = String(req.params.id);
      const { status } = req.body;
      const companyId = req.body.companyId; // TODO: Pegar do token JWT quando houver auth de empresa

      const booking = await bookingService.updateBookingStatus(bookingId, companyId, status);

      res.status(200).json({
        success: true,
        message: 'Status do agendamento atualizado',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }
}

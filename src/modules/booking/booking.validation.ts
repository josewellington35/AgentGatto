import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

// Validação para criação de booking
export const createBookingSchema = z.object({
  serviceId: z.string().uuid({ message: 'ID de serviço inválido' }),
  date: z.string()
    .datetime({ message: 'Data inválida. Use formato ISO 8601' })
    .refine((date) => {
      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bookingDate >= today;
    }, { message: 'Não é possível agendar em datas passadas' }),
  timeSlot: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { 
      message: 'Horário inválido. Use formato HH:MM (ex: 09:00)' 
    }),
  notes: z.string().max(500).optional(),
});

// Validação para atualização de status
export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus, {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
});

// Validação para cancelamento
export const cancelBookingSchema = z.object({
  cancellationReason: z.string().max(500).optional(),
});

// Validação para verificar disponibilidade
export const checkAvailabilitySchema = z.object({
  serviceId: z.string().uuid({ message: 'ID de serviço inválido' }),
  date: z.string()
    .datetime({ message: 'Data inválida. Use formato ISO 8601' })
    .refine((date) => {
      const checkDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return checkDate >= today;
    }, { message: 'Não é possível verificar datas passadas' }),
});

// Validação para query params de listagem
export const getBookingsQuerySchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
});

// Validação para query params de empresa
export const getCompanyBookingsQuerySchema = getBookingsQuerySchema.extend({
  serviceId: z.string().uuid().optional(),
});

// Validação de params com UUID
export const bookingIdParamSchema = z.object({
  id: z.string().uuid({ message: 'ID de agendamento inválido' }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;
export type GetBookingsQueryInput = z.infer<typeof getBookingsQuerySchema>;
export type GetCompanyBookingsQueryInput = z.infer<typeof getCompanyBookingsQuerySchema>;

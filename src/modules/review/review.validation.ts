import { z } from 'zod';

/**
 * Schemas de validação para Reviews
 */

export const createReviewSchema = z.object({
  bookingId: z.string().uuid('ID do agendamento inválido'),
  rating: z
    .number()
    .int('Rating deve ser um número inteiro')
    .min(1, 'Rating mínimo é 1')
    .max(5, 'Rating máximo é 5'),
  comment: z
    .string()
    .min(10, 'Comentário deve ter no mínimo 10 caracteres')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .optional(),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int('Rating deve ser um número inteiro')
    .min(1, 'Rating mínimo é 1')
    .max(5, 'Rating máximo é 5')
    .optional(),
  comment: z
    .string()
    .min(10, 'Comentário deve ter no mínimo 10 caracteres')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .optional(),
});

export const getReviewsQuerySchema = z.object({
  serviceId: z.string().uuid('ID do serviço inválido').optional(),
  companyId: z.string().uuid('ID da empresa inválido').optional(),
  userId: z.string().uuid('ID do usuário inválido').optional(),
  minRating: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1).max(5))
    .optional(),
  sortBy: z.enum(['rating', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1).max(100))
    .optional(),
});

export const reviewIdParamSchema = z.object({
  id: z.string().uuid('ID da avaliação inválido'),
});

export const serviceIdParamSchema = z.object({
  serviceId: z.string().uuid('ID do serviço inválido'),
});

export const companyIdParamSchema = z.object({
  companyId: z.string().uuid('ID da empresa inválido'),
});

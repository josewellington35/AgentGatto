import { z } from 'zod';
import { Category } from '@prisma/client';

// Validação para criação de serviço
export const createServiceSchema = z.object({
  companyId: z.string().uuid({ message: 'ID de empresa inválido' }),
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  duration: z.number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima é 15 minutos')
    .max(480, 'Duração máxima é 8 horas (480 minutos)'),
  price: z.number()
    .positive('Preço deve ser positivo')
    .max(99999.99, 'Preço máximo é R$ 99.999,99'),
  category: z.nativeEnum(Category, { message: 'Categoria inválida' }),
  imageUrl: z.string().url('URL de imagem inválida').optional(),
});

// Validação para atualização de serviço
export const updateServiceSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  description: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  duration: z.number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima é 15 minutos')
    .max(480, 'Duração máxima é 8 horas (480 minutos)')
    .optional(),
  price: z.number()
    .positive('Preço deve ser positivo')
    .max(99999.99, 'Preço máximo é R$ 99.999,99')
    .optional(),
  imageUrl: z.string().url('URL de imagem inválida').optional(),
  isActive: z.boolean().optional(),
});

// Validação para busca de serviços
export const searchServicesSchema = z.object({
  search: z.string().optional(),
  category: z.nativeEnum(Category, {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }).optional(),
  companyId: z.string().uuid().optional(),
  city: z.string().optional(),
  minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  isActive: z.string()
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['price', 'rating', 'name', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
});

// Validação de params com UUID
export const serviceIdParamSchema = z.object({
  id: z.string().uuid({ message: 'ID de serviço inválido' }),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type SearchServicesInput = z.infer<typeof searchServicesSchema>;

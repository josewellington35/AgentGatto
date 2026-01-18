import { z } from 'zod';
import { Category, CompanyStatus } from '@prisma/client';

// Validação para criação de empresa
export const createCompanySchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  responsible: z.string()
    .min(3, 'Nome do responsável deve ter no mínimo 3 caracteres')
    .max(100, 'Nome do responsável deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  phoneNumber: z.string()
    .min(10, 'Telefone deve ter no mínimo 10 caracteres')
    .max(20, 'Telefone deve ter no máximo 20 caracteres'),
  address: z.string()
    .min(10, 'Endereço deve ter no mínimo 10 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().max(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  category: z.nativeEnum(Category, {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }),
  description: z.string()
    .min(20, 'Descrição deve ter no mínimo 20 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  logo: z.string().url('URL do logo inválida').optional(),
  coverImage: z.string().url('URL da imagem de capa inválida').optional(),
});

// Validação para atualização de empresa
export const updateCompanySchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  responsible: z.string()
    .min(3, 'Nome do responsável deve ter no mínimo 3 caracteres')
    .max(100, 'Nome do responsável deve ter no máximo 100 caracteres')
    .optional(),
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .optional(),
  phoneNumber: z.string()
    .min(10, 'Telefone deve ter no mínimo 10 caracteres')
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .optional(),
  address: z.string()
    .min(10, 'Endereço deve ter no mínimo 10 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres')
    .optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().max(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  category: z.nativeEnum(Category).optional(),
  description: z.string()
    .min(20, 'Descrição deve ter no mínimo 20 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .optional(),
  logo: z.string().url('URL do logo inválida').optional(),
  coverImage: z.string().url('URL da imagem de capa inválida').optional(),
});

// Validação para atualização de status
export const updateCompanyStatusSchema = z.object({
  status: z.nativeEnum(CompanyStatus, {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  rejectionReason: z.string().max(500).optional(),
});

// Validação para criação de time slot
export const createTimeSlotSchema = z.object({
  companyId: z.string().uuid('ID de empresa inválido'),
  dayOfWeek: z.number()
    .int('Dia da semana deve ser um número inteiro')
    .min(0, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)')
    .max(6, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)')
    .optional(),
  startTime: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de início inválido. Use formato HH:MM'),
  endTime: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de término inválido. Use formato HH:MM'),
  duration: z.number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima é 15 minutos')
    .max(480, 'Duração máxima é 8 horas (480 minutos)'),
}).refine((data) => data.startTime < data.endTime, {
  message: 'Horário de início deve ser menor que horário de término',
  path: ['startTime'],
});

// Validação para atualização de time slot
export const updateTimeSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido')
    .optional(),
  endTime: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido')
    .optional(),
  duration: z.number().int().min(15).max(480).optional(),
  isActive: z.boolean().optional(),
});

// Validação para busca de empresas
export const searchCompaniesSchema = z.object({
  search: z.string().optional(),
  category: z.nativeEnum(Category).optional(),
  city: z.string().optional(),
  status: z.nativeEnum(CompanyStatus).optional(),
  minRating: z.string().transform(Number).pipe(z.number().min(0).max(5)).optional(),
  sortBy: z.enum(['rating', 'name', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
});

// Validação de params com UUID
export const companyIdParamSchema = z.object({
  id: z.string().uuid({ message: 'ID de empresa inválido' }),
});

export const timeSlotIdParamSchema = z.object({
  id: z.string().uuid({ message: 'ID de time slot inválido' }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateCompanyStatusInput = z.infer<typeof updateCompanyStatusSchema>;
export type CreateTimeSlotInput = z.infer<typeof createTimeSlotSchema>;
export type UpdateTimeSlotInput = z.infer<typeof updateTimeSlotSchema>;
export type SearchCompaniesInput = z.infer<typeof searchCompaniesSchema>;

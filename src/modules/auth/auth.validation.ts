import { z } from 'zod';
import { CONSTANTS } from '@/config/constants';

export const RegisterSchema = z.object({
  name: z.string()
    .min(CONSTANTS.VALIDATION.NAME_MIN_LENGTH, 'Nome deve ter no mínimo 3 caracteres')
    .max(CONSTANTS.VALIDATION.NAME_MAX_LENGTH, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[@$!%*?&]/, 'Senha deve conter pelo menos um caractere especial (@$!%*?&)'),
  phoneNumber: z.string().regex(CONSTANTS.VALIDATION.PHONE_REGEX, 'Telefone inválido').optional(),
  role: z.enum(['CLIENT', 'COMPANY', 'ADMIN']).optional().default('CLIENT'),
}).strict();

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
}).strict();

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

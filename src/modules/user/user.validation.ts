import { z } from 'zod';
import { CONSTANTS } from '@/config/constants';

// Schema para atualizar perfil
export const UpdateProfileSchema = z
  .object({
    name: z
      .string()
      .min(CONSTANTS.VALIDATION.NAME_MIN_LENGTH, 'Nome deve ter no mínimo 3 caracteres')
      .max(CONSTANTS.VALIDATION.NAME_MAX_LENGTH, 'Nome deve ter no máximo 100 caracteres')
      .optional(),
    phoneNumber: z.string().regex(CONSTANTS.VALIDATION.PHONE_REGEX, 'Telefone inválido').optional(),
  })
  .strict();

// Schema para alterar senha
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH, 'Nova senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Nova senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Nova senha deve conter pelo menos um número')
      .regex(/[@$!%*?&]/, 'Nova senha deve conter pelo menos um caractere especial (@$!%*?&)'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'A nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  });

// Tipos inferidos
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

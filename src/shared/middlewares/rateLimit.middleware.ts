import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '@/config/constants';

// Rate limiter geral para API
export const apiLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    message: 'Muitas requisições. Por favor, tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter mais restritivo para rotas de autenticação
export const authLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT.AUTH_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Por favor, aguarde 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Rate limiter para criação de agendamentos (prevenir spam)
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: CONSTANTS.RATE_LIMIT.BOOKING_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Você está criando agendamentos muito rapidamente. Por favor, aguarde um momento.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

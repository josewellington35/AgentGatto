export const CONSTANTS = {
  // Horários de funcionamento
  BUSINESS_HOURS: {
    START: 8,
    END: 18,
  },

  // Regras de agendamento
  BOOKING: {
    MIN_ADVANCE_HOURS: 2,
    MAX_ADVANCE_DAYS: 90,
    SLOT_DURATION_MINUTES: 60,
  },

  // Paginação
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS: 100,
    AUTH_MAX_REQUESTS: 5,
    BOOKING_MAX_REQUESTS: 5,
  },

  // Validação
  VALIDATION: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 100,
    PASSWORD_MIN_LENGTH: 8,
    PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  },

  // JWT
  JWT: {
    ISSUER: 'agentgatto-api',
    AUDIENCE: 'agentgatto-client',
  },

  // Email
  EMAIL: {
    FROM: process.env.EMAIL_FROM || 'noreply@agentgatto.com',
  },
};

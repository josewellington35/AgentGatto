export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  EMAIL_ALREADY_EXISTS: 'Email já cadastrado',
  INVALID_TOKEN: 'Token inválido',
  TOKEN_EXPIRED: 'Token expirado',
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso negado',

  // User errors
  USER_NOT_FOUND: 'Usuário não encontrado',
  USER_ALREADY_EXISTS: 'Usuário já existe',
  INVALID_USER_DATA: 'Dados de usuário inválidos',

  // Booking errors
  BOOKING_NOT_FOUND: 'Agendamento não encontrado',
  BOOKING_CONFLICT: 'Horário não disponível',
  BOOKING_PAST_DATE: 'Não é possível agendar em data passada',
  BOOKING_TOO_SOON: 'Agendamento deve ser feito com antecedência mínima',
  BOOKING_OUTSIDE_HOURS: 'Horário fora do expediente',
  BOOKING_SUNDAY: 'Não atendemos aos domingos',

  // Service errors
  SERVICE_NOT_FOUND: 'Serviço não encontrado',
  SERVICE_INACTIVE: 'Serviço não está ativo',

  // Company errors
  COMPANY_NOT_FOUND: 'Empresa não encontrada',
  COMPANY_PENDING: 'Empresa aguardando aprovação',

  // General errors
  RESOURCE_NOT_FOUND: 'Recurso não encontrado',
  RESOURCE_ALREADY_EXISTS: 'Recurso já existe',

  // Validation errors
  VALIDATION_ERROR: 'Erro de validação',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PASSWORD: 'Senha inválida',
  PASSWORD_TOO_SHORT: 'Senha muito curta',
  INVALID_PHONE: 'Telefone inválido',

  // System errors
  INTERNAL_ERROR: 'Erro interno do servidor',
  DATABASE_ERROR: 'Erro no banco de dados',
  EMAIL_SEND_ERROR: 'Erro ao enviar email',
};

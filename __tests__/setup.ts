import { PrismaClient } from '@prisma/client';

// Configuração global para testes
const prisma = new PrismaClient();

// Limpar banco de dados antes de cada teste
beforeEach(async () => {
  // Em produção, use um banco de dados de teste separado
  // await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "Company" CASCADE`;
  // etc...
});

// Cleanup após todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});

// Mock de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-minimum-32-characters-required';
process.env.JWT_EXPIRES_IN = '1h';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';

// Exportar prisma para uso nos testes
export { prisma };

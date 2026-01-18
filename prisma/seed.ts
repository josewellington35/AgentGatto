import { PrismaClient, UserRole, CompanyStatus, BookingStatus, Category } from '@prisma/client';
import { hashPassword } from '../src/shared/utils/password';
import { logger } from '../src/shared/utils/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seed...');

  // Limpar dados existentes
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.service.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  logger.info('✅ Cleared existing data');

  // Criar usuário admin
  const adminPassword = await hashPassword('Admin@123');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Master',
      email: 'admin@agentgatto.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      phoneNumber: '+55 11 99999-9999',
    },
  });
  logger.info(`✅ Created admin user: ${admin.email}`);

  // Criar usuário cliente
  const clientPassword = await hashPassword('Client@123');
  const client = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'cliente@example.com',
      password: clientPassword,
      role: UserRole.CLIENT,
      phoneNumber: '+55 11 98888-8888',
    },
  });
  logger.info(`✅ Created client user: ${client.email}`);

  // Criar empresa (Salão de Beleza)
  const company1 = await prisma.company.create({
    data: {
      name: 'Salão Beleza Total',
      description: 'Salão de beleza com atendimento especializado',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      phoneNumber: '+55 11 3333-3333',
      email: 'contato@salaobelezatotal.com',
      responsible: 'Maria Santos',
      category: Category.BEAUTY,
      status: CompanyStatus.APPROVED,
    },
  });
  logger.info(`✅ Created company: ${company1.name}`);

  // Criar serviços do salão
  const services = await prisma.service.createMany({
    data: [
      {
        companyId: company1.id,
        name: 'Corte de Cabelo Feminino',
        description: 'Corte, lavagem e finalização',
        price: 80.0,
        duration: 60,
        category: Category.BEAUTY,
        isActive: true,
      },
      {
        companyId: company1.id,
        name: 'Escova Progressiva',
        description: 'Alisamento com produtos de alta qualidade',
        price: 250.0,
        duration: 180,
        category: Category.BEAUTY,
        isActive: true,
      },
      {
        companyId: company1.id,
        name: 'Manicure',
        description: 'Esmaltação completa das unhas',
        price: 35.0,
        duration: 45,
        category: Category.BEAUTY,
        isActive: true,
      },
      {
        companyId: company1.id,
        name: 'Depilação de Pernas',
        description: 'Depilação completa com cera',
        price: 60.0,
        duration: 60,
        category: Category.BEAUTY,
        isActive: true,
      },
    ],
  });
  logger.info(`✅ Created ${services.count} services`);

  // Buscar os serviços criados para pegar os IDs
  const createdServices = await prisma.service.findMany({
    where: { companyId: company1.id },
  });

  // Criar algumas reservas de exemplo
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const booking1 = await prisma.booking.create({
    data: {
      userId: client.id,
      serviceId: createdServices[0].id,
      date: tomorrow,
      timeSlot: '10:00',
      status: BookingStatus.CONFIRMED,
      totalPrice: createdServices[0].price,
    },
  });

  logger.info(`✅ Created booking: ${booking1.id}`);

  // Criar uma avaliação
  await prisma.review.create({
    data: {
      userId: client.id,
      bookingId: booking1.id,
      serviceId: createdServices[0].id,
      rating: 5,
      comment: 'Excelente atendimento! Muito profissional.',
    },
  });
  logger.info(`✅ Created review for booking ${booking1.id}`);

  // Criar uma notificação
  await prisma.notification.create({
    data: {
      userId: client.id,
      title: 'Agendamento confirmado',
      message: 'Seu agendamento para amanhã às 10:00 foi confirmado.',
      type: 'booking_confirmed',
      isRead: false,
    },
  });
  logger.info(`✅ Created notification`);

  logger.info('');
  logger.info('🎉 Seed completed successfully!');
  logger.info('');
  logger.info('📝 Test accounts created:');
  logger.info('   Admin: admin@agentgatto.com / Admin@123');
  logger.info('   Cliente: cliente@example.com / Client@123');
  logger.info('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error('Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

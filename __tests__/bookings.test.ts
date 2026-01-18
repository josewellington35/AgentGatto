import request from 'supertest';
import { app } from '@/app';
import { prisma } from './setup';

describe('Bookings Module - Integration Tests', () => {
  let clientToken: string;
  let companyId: string;
  let serviceId: string;

  // Setup inicial: criar usuários, empresa e serviço
  beforeAll(async () => {
    // Criar cliente
    const clientResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Client',
        email: 'client-booking@test.com',
        password: 'Test@123',
        phoneNumber: '+55 11 91111-1111',
        role: 'CLIENT',
      });
    clientToken = clientResponse.body.data.token;

    // Criar empresa
    const companyResponse = await request(app).post('/api/companies').send({
      name: 'Test Company Bookings',
      responsible: 'Company Owner',
      email: 'company-booking@test.com',
      phoneNumber: '+55 11 92222-2222',
      address: 'Test Address, 123',
      category: 'BEAUTY',
    });
    companyId = companyResponse.body.data.id;

    // Aprovar empresa (em produção, isso seria feito por admin)
    await prisma.company.update({
      where: { id: companyId },
      data: { status: 'APPROVED' },
    });

    // Criar horário de funcionamento
    await request(app)
      .post(`/api/companies/${companyId}/timeslots`)
      .send({
        companyId,
        dayOfWeek: 1, // Segunda
        startTime: '09:00',
        endTime: '18:00',
        duration: 60,
      });

    // Criar serviço
    const serviceResponse = await request(app)
      .post('/api/services')
      .send({
        companyId,
        name: 'Corte de Cabelo',
        description: 'Corte masculino ou feminino',
        category: 'BEAUTY',
        price: 50.0,
        duration: 60,
      });
    serviceId = serviceResponse.body.data.id;
  });

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Garantir que seja segunda-feira (dayOfWeek = 1)
      while (tomorrow.getDay() !== 1) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          serviceId,
          date: tomorrow.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:00',
          notes: 'Teste de agendamento',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          serviceId,
          date: expect.any(String),
          startTime: '10:00',
          endTime: '11:00',
          status: 'PENDING',
        },
      });
    });

    it('should fail without authentication', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .post('/api/bookings')
        .send({
          serviceId,
          date: tomorrow.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:00',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid time format', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          serviceId,
          date: tomorrow.toISOString().split('T')[0],
          startTime: '25:00', // Hora inválida
          endTime: '11:00',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with past date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          serviceId,
          date: yesterday.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:00',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings', () => {
    it('should list user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          bookings: expect.any(Array),
          pagination: {
            total: expect.any(Number),
            page: 1,
            limit: 20,
          },
        },
      });
    });

    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings?status=PENDING')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.bookings.length > 0) {
        expect(response.body.data.bookings[0].status).toBe('PENDING');
      }
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/bookings').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings/availability/:serviceId', () => {
    it('should check availability for a service', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      while (tomorrow.getDay() !== 1) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }

      const response = await request(app)
        .get(`/api/bookings/availability/${serviceId}`)
        .query({
          date: tomorrow.toISOString().split('T')[0],
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          date: expect.any(String),
          availableSlots: expect.any(Array),
        },
      });

      // Verificar estrutura dos slots
      if (response.body.data.availableSlots.length > 0) {
        expect(response.body.data.availableSlots[0]).toMatchObject({
          startTime: expect.any(String),
          endTime: expect.any(String),
          isAvailable: expect.any(Boolean),
        });
      }
    });

    it('should fail with invalid service ID', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .get('/api/bookings/availability/invalid-uuid')
        .query({
          date: tomorrow.toISOString().split('T')[0],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/bookings/:id/cancel', () => {
    let bookingId: string;

    beforeEach(async () => {
      // Criar um booking para cancelar
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      while (tomorrow.getDay() !== 1) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          serviceId,
          date: tomorrow.toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '15:00',
        });

      bookingId = response.body.data.id;
    });

    it('should cancel booking successfully', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          cancelReason: 'Não posso mais comparecer',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: bookingId,
          status: 'CANCELLED',
          cancelReason: 'Não posso mais comparecer',
        },
      });
    });

    it('should fail to cancel non-existent booking', async () => {
      const response = await request(app)
        .patch('/api/bookings/550e8400-e29b-41d4-a716-446655440000/cancel')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          cancelReason: 'Test',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without cancel reason', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Cleanup
  afterAll(async () => {
    await prisma.booking.deleteMany({
      where: { service: { companyId } },
    });
    await prisma.service.deleteMany({ where: { companyId } });
    await prisma.timeSlot.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({
      where: { email: { contains: '-booking@test.com' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: '-booking@test.com' } },
    });
  });
});

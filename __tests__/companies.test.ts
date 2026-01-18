import request from 'supertest';
import { app } from '@/app';
import { prisma } from './setup';

describe('Companies Module - Integration Tests', () => {
  let adminToken: string;
  let companyId: string;

  // Setup: criar admin
  beforeAll(async () => {
    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin Test',
        email: 'admin-company@test.com',
        password: '$2b$10$YourHashedPasswordHere',
        phoneNumber: '+55 11 95555-5555',
        role: 'ADMIN',
      },
    });

    // Gerar token manualmente
    const { generateToken } = await import('@/shared/utils/jwt');
    adminToken = generateToken({
      id: adminUser.id,
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });
  });

  describe('POST /api/companies', () => {
    it('should create a company successfully', async () => {
      const response = await request(app)
        .post('/api/companies')
        .send({
          name: 'Beauty Studio Test',
          responsible: 'Maria Silva',
          email: 'beauty-test@company.com',
          phoneNumber: '+55 11 96666-6666',
          address: 'Rua das Flores, 100',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          category: 'BEAUTY',
          description: 'Salão de beleza para testes',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          name: 'Beauty Studio Test',
          email: 'beauty-test@company.com',
          status: 'PENDING',
          category: 'BEAUTY',
          isActive: true,
        },
      });

      companyId = response.body.data.id;
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/companies')
        .send({
          name: 'Test Company',
          responsible: 'Owner',
          email: 'invalid-email',
          phoneNumber: '+55 11 97777-7777',
          address: 'Test Address',
          category: 'BEAUTY',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      const response = await request(app)
        .post('/api/companies')
        .send({
          name: 'Another Beauty Studio',
          responsible: 'João Silva',
          email: 'beauty-test@company.com', // Email já usado
          phoneNumber: '+55 11 98888-8888',
          address: 'Another Address',
          category: 'BEAUTY',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should fail with invalid category', async () => {
      const response = await request(app)
        .post('/api/companies')
        .send({
          name: 'Test Company',
          responsible: 'Owner',
          email: 'test@company.com',
          phoneNumber: '+55 11 99999-9999',
          address: 'Test Address',
          category: 'INVALID_CATEGORY',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/companies', () => {
    beforeAll(async () => {
      // Criar mais empresas para testes
      await request(app).post('/api/companies').send({
        name: 'Oficina Mecânica Test',
        responsible: 'Carlos Santos',
        email: 'oficina-test@company.com',
        phoneNumber: '+55 11 91234-5678',
        address: 'Av Principal, 200',
        city: 'São Paulo',
        category: 'AUTOMOTIVE',
      });

      await request(app).post('/api/companies').send({
        name: 'Clínica Saúde Test',
        responsible: 'Dra. Ana Costa',
        email: 'clinica-test@company.com',
        phoneNumber: '+55 11 91234-9999',
        address: 'Rua Saúde, 300',
        city: 'Rio de Janeiro',
        category: 'HEALTH',
      });
    });

    it('should list all companies', async () => {
      const response = await request(app).get('/api/companies').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          companies: expect.any(Array),
          pagination: {
            total: expect.any(Number),
            page: 1,
            limit: 20,
          },
        },
      });

      expect(response.body.data.companies.length).toBeGreaterThan(0);
    });

    it('should filter companies by status', async () => {
      const response = await request(app)
        .get('/api/companies?status=PENDING')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.companies.length > 0) {
        response.body.data.companies.forEach((company: any) => {
          expect(company.status).toBe('PENDING');
        });
      }
    });

    it('should filter companies by category', async () => {
      const response = await request(app)
        .get('/api/companies?category=BEAUTY')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.companies.length > 0) {
        response.body.data.companies.forEach((company: any) => {
          expect(company.category).toBe('BEAUTY');
        });
      }
    });

    it('should filter companies by city', async () => {
      const response = await request(app)
        .get('/api/companies?city=São Paulo')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should search companies by name', async () => {
      const response = await request(app)
        .get('/api/companies?search=Beauty')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should get company by ID', async () => {
      const response = await request(app)
        .get(`/api/companies/${companyId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: companyId,
          name: 'Beauty Studio Test',
          email: 'beauty-test@company.com',
        },
      });
    });

    it('should get company with details', async () => {
      const response = await request(app)
        .get(`/api/companies/${companyId}?includeDetails=true`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('services');
      expect(response.body.data).toHaveProperty('timeSlots');
    });

    it('should fail with invalid UUID', async () => {
      const response = await request(app)
        .get('/api/companies/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent company', async () => {
      const response = await request(app)
        .get('/api/companies/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/companies/pending', () => {
    it('should list pending companies for admin', async () => {
      const response = await request(app)
        .get('/api/companies/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.any(Array));
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/companies/pending')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/companies/:id/status', () => {
    it('should approve company', async () => {
      const response = await request(app)
        .patch(`/api/companies/${companyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'APPROVED',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: companyId,
          status: 'APPROVED',
        },
      });
    });

    it('should reject company with reason', async () => {
      // Criar empresa para rejeitar
      const newCompany = await request(app).post('/api/companies').send({
        name: 'Company to Reject',
        responsible: 'Owner',
        email: 'reject-test@company.com',
        phoneNumber: '+55 11 91111-2222',
        address: 'Test Address',
        category: 'FOOD',
      });

      const response = await request(app)
        .patch(`/api/companies/${newCompany.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'REJECTED',
          reason: 'Documentação incompleta',
        })
        .expect(200);

      expect(response.body.data.status).toBe('REJECTED');

      // Cleanup
      await prisma.company.delete({
        where: { id: newCompany.body.data.id },
      });
    });

    it('should fail to reject without reason', async () => {
      const newCompany = await request(app).post('/api/companies').send({
        name: 'Company Test Reason',
        responsible: 'Owner',
        email: 'reason-test@company.com',
        phoneNumber: '+55 11 91111-3333',
        address: 'Test Address',
        category: 'OTHER',
      });

      const response = await request(app)
        .patch(`/api/companies/${newCompany.body.data.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'REJECTED',
          // Sem reason
        })
        .expect(400);

      expect(response.body.success).toBe(false);

      // Cleanup
      await prisma.company.delete({
        where: { id: newCompany.body.data.id },
      });
    });
  });

  describe('Time Slots Management', () => {
    describe('POST /api/companies/:id/timeslots', () => {
      it('should create time slot for approved company', async () => {
        const response = await request(app)
          .post(`/api/companies/${companyId}/timeslots`)
          .send({
            companyId,
            dayOfWeek: 1, // Segunda
            startTime: '09:00',
            endTime: '18:00',
            duration: 60,
          })
          .expect(201);

        expect(response.body).toMatchObject({
          success: true,
          data: {
            id: expect.any(String),
            companyId,
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '18:00',
            duration: 60,
            isActive: true,
          },
        });
      });

      it('should fail with invalid time format', async () => {
        const response = await request(app)
          .post(`/api/companies/${companyId}/timeslots`)
          .send({
            companyId,
            dayOfWeek: 2,
            startTime: '25:00', // Inválido
            endTime: '18:00',
            duration: 60,
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should fail with startTime >= endTime', async () => {
        const response = await request(app)
          .post(`/api/companies/${companyId}/timeslots`)
          .send({
            companyId,
            dayOfWeek: 3,
            startTime: '18:00',
            endTime: '09:00', // endTime menor que startTime
            duration: 60,
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/companies/:id/timeslots', () => {
      it('should list company time slots', async () => {
        const response = await request(app)
          .get(`/api/companies/${companyId}/timeslots`)
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          data: expect.any(Array),
        });

        if (response.body.data.length > 0) {
          expect(response.body.data[0]).toMatchObject({
            id: expect.any(String),
            dayOfWeek: expect.any(Number),
            startTime: expect.any(String),
            endTime: expect.any(String),
          });
        }
      });
    });
  });

  // Cleanup
  afterAll(async () => {
    await prisma.timeSlot.deleteMany({
      where: { company: { email: { contains: '-test@company.com' } } },
    });
    await prisma.company.deleteMany({
      where: { email: { contains: '-test@company.com' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: '-company@test.com' } },
    });
  });
});

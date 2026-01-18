import request from 'supertest';
import { app } from '@/app';
import { prisma } from './setup';

describe('Services Module - Integration Tests', () => {
  let companyId: string;

  // Setup: criar empresa aprovada
  beforeAll(async () => {
    const companyResponse = await request(app).post('/api/companies').send({
      name: 'Test Company Services',
      responsible: 'Service Owner',
      email: 'company-service@test.com',
      phoneNumber: '+55 11 93333-3333',
      address: 'Service Test Address, 456',
      city: 'São Paulo',
      category: 'BEAUTY',
    });
    companyId = companyResponse.body.data.id;

    // Aprovar empresa
    await prisma.company.update({
      where: { id: companyId },
      data: { status: 'APPROVED' },
    });
  });

  describe('POST /api/services', () => {
    it('should create a service successfully', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({
          companyId,
          name: 'Corte de Cabelo Premium',
          description: 'Corte profissional com lavagem',
          category: 'BEAUTY',
          price: 80.0,
          duration: 60,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          companyId,
          name: 'Corte de Cabelo Premium',
          category: 'BEAUTY',
          price: '80.00',
          duration: 60,
          isActive: true,
          rating: 0,
        },
      });
    });

    it('should fail with invalid price', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({
          companyId,
          name: 'Serviço Teste',
          category: 'BEAUTY',
          price: -10, // Preço negativo
          duration: 60,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid duration', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({
          companyId,
          name: 'Serviço Teste',
          category: 'BEAUTY',
          price: 50,
          duration: 10, // Menor que 15 min
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-approved company', async () => {
      // Criar empresa não aprovada
      const pendingCompany = await request(app).post('/api/companies').send({
        name: 'Pending Company',
        responsible: 'Owner',
        email: 'pending-service@test.com',
        phoneNumber: '+55 11 94444-4444',
        address: 'Pending Address, 789',
        category: 'HEALTH',
      });

      const response = await request(app)
        .post('/api/services')
        .send({
          companyId: pendingCompany.body.data.id,
          name: 'Serviço Teste',
          category: 'HEALTH',
          price: 50,
          duration: 60,
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('aprovada');

      // Cleanup
      await prisma.company.delete({
        where: { id: pendingCompany.body.data.id },
      });
    });
  });

  describe('GET /api/services', () => {
    beforeAll(async () => {
      // Criar vários serviços para teste
      await request(app).post('/api/services').send({
        companyId,
        name: 'Manicure',
        category: 'BEAUTY',
        price: 30.0,
        duration: 45,
      });

      await request(app).post('/api/services').send({
        companyId,
        name: 'Pedicure',
        category: 'BEAUTY',
        price: 35.0,
        duration: 45,
      });
    });

    it('should list all services', async () => {
      const response = await request(app).get('/api/services').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          services: expect.any(Array),
          pagination: {
            total: expect.any(Number),
            page: 1,
            limit: 20,
          },
        },
      });

      expect(response.body.data.services.length).toBeGreaterThan(0);
    });

    it('should filter services by category', async () => {
      const response = await request(app)
        .get('/api/services?category=BEAUTY')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.services.length > 0) {
        response.body.data.services.forEach((service: any) => {
          expect(service.category).toBe('BEAUTY');
        });
      }
    });

    it('should filter services by price range', async () => {
      const response = await request(app)
        .get('/api/services?minPrice=30&maxPrice=50')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.services.length > 0) {
        response.body.data.services.forEach((service: any) => {
          const price = parseFloat(service.price);
          expect(price).toBeGreaterThanOrEqual(30);
          expect(price).toBeLessThanOrEqual(50);
        });
      }
    });

    it('should search services by name', async () => {
      const response = await request(app)
        .get('/api/services?search=Corte')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.services.length > 0) {
        expect(
          response.body.data.services[0].name.toLowerCase()
        ).toContain('corte');
      }
    });

    it('should filter by city', async () => {
      const response = await request(app)
        .get('/api/services?city=São Paulo')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should sort services by price', async () => {
      const response = await request(app)
        .get('/api/services?sortBy=price&order=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      const services = response.body.data.services;
      
      if (services.length > 1) {
        for (let i = 1; i < services.length; i++) {
          const prevPrice = parseFloat(services[i - 1].price);
          const currPrice = parseFloat(services[i].price);
          expect(currPrice).toBeGreaterThanOrEqual(prevPrice);
        }
      }
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/services?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/services/:id', () => {
    let serviceId: string;

    beforeAll(async () => {
      const response = await request(app).post('/api/services').send({
        companyId,
        name: 'Serviço para Busca',
        category: 'BEAUTY',
        price: 45.0,
        duration: 30,
      });
      serviceId = response.body.data.id;
    });

    it('should get service by ID', async () => {
      const response = await request(app)
        .get(`/api/services/${serviceId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: serviceId,
          name: 'Serviço para Busca',
          price: '45.00',
          duration: 30,
        },
      });
    });

    it('should fail with invalid UUID', async () => {
      const response = await request(app)
        .get('/api/services/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent service', async () => {
      const response = await request(app)
        .get('/api/services/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/services/:id', () => {
    let serviceId: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/services').send({
        companyId,
        name: 'Serviço para Atualizar',
        category: 'BEAUTY',
        price: 50.0,
        duration: 60,
      });
      serviceId = response.body.data.id;
    });

    it('should update service successfully', async () => {
      const response = await request(app)
        .patch(`/api/services/${serviceId}`)
        .send({
          companyId,
          name: 'Serviço Atualizado',
          price: 60.0,
          description: 'Nova descrição',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: serviceId,
          name: 'Serviço Atualizado',
          price: '60.00',
          description: 'Nova descrição',
        },
      });
    });

    it('should fail with invalid price', async () => {
      const response = await request(app)
        .patch(`/api/services/${serviceId}`)
        .send({
          companyId,
          price: 100000, // Maior que 99999.99
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/services/:id/deactivate', () => {
    let serviceId: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/services').send({
        companyId,
        name: 'Serviço para Desativar',
        category: 'BEAUTY',
        price: 40.0,
        duration: 45,
      });
      serviceId = response.body.data.id;
    });

    it('should deactivate service successfully', async () => {
      const response = await request(app)
        .patch(`/api/services/${serviceId}/deactivate`)
        .send({ companyId })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: serviceId,
          isActive: false,
        },
      });
    });

    it('should activate service successfully', async () => {
      // Desativar primeiro
      await request(app)
        .patch(`/api/services/${serviceId}/deactivate`)
        .send({ companyId });

      // Ativar novamente
      const response = await request(app)
        .patch(`/api/services/${serviceId}/activate`)
        .send({ companyId })
        .expect(200);

      expect(response.body.data.isActive).toBe(true);
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete service without bookings', async () => {
      const response = await request(app).post('/api/services').send({
        companyId,
        name: 'Serviço para Deletar',
        category: 'BEAUTY',
        price: 25.0,
        duration: 30,
      });
      const serviceId = response.body.data.id;

      const deleteResponse = await request(app)
        .delete(`/api/services/${serviceId}`)
        .send({ companyId })
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Verificar que foi deletado
      await request(app)
        .get(`/api/services/${serviceId}`)
        .expect(404);
    });
  });

  // Cleanup
  afterAll(async () => {
    await prisma.service.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({
      where: { email: { contains: '-service@test.com' } },
    });
  });
});

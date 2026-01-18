import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import './setup';

describe('Reviews Module', () => {
  let authToken: string;
  let userId: string;
  let serviceId: string;
  let companyId: string;
  let bookingId: string;

  beforeAll(async () => {
    // Criar usuário de teste com email único
    const timestamp = Date.now();
    const uniqueEmail = `reviews-${timestamp}@test.com`;
    
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User Reviews',
        email: uniqueEmail,
        password: 'Test@123',
        phoneNumber: '11912345678',
      });

    if (!registerResponse.body.success) {
      throw new Error(`Registration failed: ${registerResponse.body.message}`);
    }

    userId = registerResponse.body.data.user.id;

    // Fazer login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Test@123',
      });

    authToken = loginResponse.body.data.token;

    // Criar empresa
    const company = await prisma.company.create({
      data: {
        name: 'Test Company Reviews',
        email: 'companyreviews@test.com',
        phoneNumber: '+55 11 98765-4321',
        category: 'BEAUTY',
        responsible: 'Test Responsible',
        description: 'Test company for reviews testing',
        address: 'Test Address',
        city: 'Test City',
        state: 'SP',
        zipCode: '12345-678',
        status: 'APPROVED',
      },
    });

    companyId = company.id;

    // Criar serviço
    const service = await prisma.service.create({
      data: {
        companyId,
        name: 'Test Service Reviews',
        description: 'Test description for reviews',
        duration: 60,
        price: 100.0,
        category: 'BEAUTY',
        isActive: true,
      },
    });

    serviceId = service.id;

    // Criar booking COMPLETED
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        date: new Date('2026-01-10'),
        timeSlot: '10:00',
        status: 'COMPLETED',
        totalPrice: 100.0,
      },
    });

    bookingId = booking.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.review.deleteMany({
      where: { userId },
    });
    await prisma.booking.deleteMany({
      where: { userId },
    });
    await prisma.service.deleteMany({
      where: { companyId },
    });
    await prisma.company.deleteMany({
      where: { id: companyId },
    });
    await prisma.user.deleteMany({
      where: { id: userId },
    });
  });

  describe('POST /api/reviews', () => {
    it('should create a review for completed booking', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookingId,
          rating: 5,
          comment: 'Excelente serviço!',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.comment).toBe('Excelente serviço!');
      expect(response.body.data.userName).toBe('Test User Reviews');
    });

    it('should not create review for already reviewed booking', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookingId,
          rating: 4,
          comment: 'Tentando avaliar novamente',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Este agendamento já foi avaliado');
    });

    it('should not create review without authentication', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          bookingId,
          rating: 5,
          comment: 'Test',
        });

      expect(response.status).toBe(401);
    });

    it('should not create review with invalid rating', async () => {
      // Criar outro booking para testar
      const newBooking = await prisma.booking.create({
        data: {
          userId,
          serviceId,
          date: new Date('2026-01-11'),
          timeSlot: '11:00',
          status: 'COMPLETED',
          totalPrice: 100.0,
        },
      });

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookingId: newBooking.id,
          rating: 6, // Inválido
          comment: 'Test',
        });

      expect(response.status).toBe(400);

      // Limpar
      await prisma.booking.delete({ where: { id: newBooking.id } });
    });
  });

  describe('GET /api/reviews', () => {
    it('should list all reviews', async () => {
      const response = await request(app)
        .get('/api/reviews');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter reviews by serviceId', async () => {
      const response = await request(app)
        .get(`/api/reviews?serviceId=${serviceId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.reviews.every((r: any) => r.serviceId === serviceId)).toBe(true);
    });

    it('should filter reviews by minRating', async () => {
      const response = await request(app)
        .get('/api/reviews?minRating=5');

      expect(response.status).toBe(200);
      expect(response.body.data.reviews.every((r: any) => r.rating >= 5)).toBe(true);
    });

    it('should sort reviews by rating desc', async () => {
      const response = await request(app)
        .get('/api/reviews?sortBy=rating&sortOrder=desc');

      expect(response.status).toBe(200);
      const ratings = response.body.data.reviews.map((r: any) => r.rating);
      const sortedRatings = [...ratings].sort((a, b) => b - a);
      expect(ratings).toEqual(sortedRatings);
    });

    it('should paginate reviews', async () => {
      const response = await request(app)
        .get('/api/reviews?page=1&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.data.reviews.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/reviews/:id', () => {
    let reviewId: string;

    beforeAll(async () => {
      const review = await prisma.review.findFirst({
        where: { userId },
      });
      reviewId = review!.id;
    });

    it('should get review by id', async () => {
      const response = await request(app)
        .get(`/api/reviews/${reviewId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(reviewId);
      expect(response.body.data).toHaveProperty('userName');
      expect(response.body.data).toHaveProperty('serviceName');
    });

    it('should return 404 for non-existent review', async () => {
      const response = await request(app)
        .get('/api/reviews/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/reviews/:id', () => {
    let reviewId: string;

    beforeAll(async () => {
      const review = await prisma.review.findFirst({
        where: { userId },
      });
      reviewId = review!.id;
    });

    it('should update review rating and comment', async () => {
      const response = await request(app)
        .patch(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 4,
          comment: 'Atualizado: Bom serviço!',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.rating).toBe(4);
      expect(response.body.data.comment).toBe('Atualizado: Bom serviço!');
    });

    it('should not update review without authentication', async () => {
      const response = await request(app)
        .patch(`/api/reviews/${reviewId}`)
        .send({
          rating: 3,
        });

      expect(response.status).toBe(401);
    });

    it('should not update review from different user', async () => {
      // Criar outro usuário
      const otherUserRegister = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other@test.com',
          password: 'Test@123',
          phoneNumber: '11999999999',
        });

      const otherUserLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@test.com',
          password: 'Test@123',
        });

      const otherToken = otherUserLogin.body.data.token;

      const response = await request(app)
        .patch(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          rating: 1,
        });

      expect(response.status).toBe(403);

      // Limpar
      await prisma.user.delete({
        where: { id: otherUserRegister.body.data.user.id },
      });
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('should delete review', async () => {
      // Criar novo booking e review para deletar
      const newBooking = await prisma.booking.create({
        data: {
          userId,
          serviceId,
          date: new Date('2026-01-12'),
          timeSlot: '12:00',
          status: 'COMPLETED',
          totalPrice: 100.0,
        },
      });

      const newReview = await prisma.review.create({
        data: {
          userId,
          bookingId: newBooking.id,
          serviceId,
          rating: 3,
          comment: 'Para deletar',
        },
      });

      const response = await request(app)
        .delete(`/api/reviews/${newReview.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verificar que foi deletado
      const deletedReview = await prisma.review.findUnique({
        where: { id: newReview.id },
      });
      expect(deletedReview).toBeNull();

      // Limpar booking
      await prisma.booking.delete({ where: { id: newBooking.id } });
    });

    it('should not delete review without authentication', async () => {
      const review = await prisma.review.findFirst({
        where: { userId },
      });

      const response = await request(app)
        .delete(`/api/reviews/${review!.id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/reviews/service/:serviceId/stats', () => {
    it('should get service rating statistics', async () => {
      const response = await request(app)
        .get(`/api/reviews/service/${serviceId}/stats`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('averageRating');
      expect(response.body.data).toHaveProperty('totalReviews');
      expect(response.body.data).toHaveProperty('ratingDistribution');
      expect(response.body.data.ratingDistribution).toHaveProperty('1');
      expect(response.body.data.ratingDistribution).toHaveProperty('5');
    });

    it('should return 404 for non-existent service', async () => {
      const response = await request(app)
        .get('/api/reviews/service/00000000-0000-0000-0000-000000000000/stats');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/reviews/company/:companyId/stats', () => {
    it('should get company rating statistics', async () => {
      const response = await request(app)
        .get(`/api/reviews/company/${companyId}/stats`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('averageRating');
      expect(response.body.data).toHaveProperty('totalReviews');
      expect(response.body.data).toHaveProperty('ratingDistribution');
    });

    it('should return 404 for non-existent company', async () => {
      const response = await request(app)
        .get('/api/reviews/company/00000000-0000-0000-0000-000000000000/stats');

      expect(response.status).toBe(404);
    });
  });
});

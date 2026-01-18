import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorMiddleware } from './shared/middlewares/error.middleware';
import { apiLimiter } from './shared/middlewares/rateLimit.middleware';

// Rotas
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import bookingRoutes from './modules/booking/booking.routes';
import serviceRoutes from './modules/service/service.routes';
import companyRoutes from './modules/company/company.routes';
import reviewRoutes from './modules/review/review.routes';

const app: Application = express();

// Middlewares de segurança
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting geral
app.use('/api', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Rota principal
app.get('/', (_req, res) => {
  res.json({
    message: 'AgentGatto API v2.0 - TypeScript + Prisma',
    version: '2.0.0',
    documentation: '/api/docs',
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/reviews', reviewRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.path,
  });
});

// Middleware de erro (deve ser o último)
app.use(errorMiddleware);

export { app };

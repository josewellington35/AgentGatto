import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '@/shared/middlewares/validation.middleware';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { authLimiter } from '@/shared/middlewares/rateLimit.middleware';
import { RegisterSchema, LoginSchema } from './auth.validation';

const router = Router();
const authController = new AuthController();

router.use(authLimiter);

router.post('/register', validateBody(RegisterSchema), async (req, res, next) => {
  try {
    await authController.register(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateBody(LoginSchema), async (req, res, next) => {
  try {
    await authController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    await authController.me(req, res);
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };

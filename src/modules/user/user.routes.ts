import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { validateBody } from '@/shared/middlewares/validation.middleware';
import { UpdateProfileSchema, ChangePasswordSchema } from './user.validation';

const router = Router();
const userController = new UserController();

// Todas as rotas de usuário requerem autenticação
router.use(authMiddleware);

// GET /api/users/profile - Buscar perfil do usuário
router.get('/profile', async (req, res, next) => {
  try {
    await userController.getProfile(req, res);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/profile - Atualizar perfil
router.patch('/profile', validateBody(UpdateProfileSchema), async (req, res, next) => {
  try {
    await userController.updateProfile(req, res);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/password - Alterar senha
router.patch('/password', validateBody(ChangePasswordSchema), async (req, res, next) => {
  try {
    await userController.changePassword(req, res);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/account - Deletar conta
router.delete('/account', async (req, res, next) => {
  try {
    await userController.deleteAccount(req, res);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/stats - Estatísticas do usuário
router.get('/stats', async (req, res, next) => {
  try {
    await userController.getStats(req, res);
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };

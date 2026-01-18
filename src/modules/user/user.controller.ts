import { Request, Response } from 'express';
import { UserService } from './user.service';
import { UpdateProfileSchema, ChangePasswordSchema } from './user.validation';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * GET /api/users/profile - Busca perfil do usuário autenticado
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const profile = await this.userService.getProfile(userId);

    res.json({
      success: true,
      data: profile,
    });
  }

  /**
   * PATCH /api/users/profile - Atualiza perfil do usuário
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const validatedData = UpdateProfileSchema.parse(req.body);

    const updatedProfile = await this.userService.updateProfile(userId, validatedData);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedProfile,
    });
  }

  /**
   * PATCH /api/users/password - Altera senha do usuário
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const validatedData = ChangePasswordSchema.parse(req.body);

    await this.userService.changePassword(userId, validatedData);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });
  }

  /**
   * DELETE /api/users/account - Deleta conta do usuário
   */
  async deleteAccount(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    await this.userService.deleteAccount(userId);

    res.json({
      success: true,
      message: 'Conta deletada com sucesso',
    });
  }

  /**
   * GET /api/users/stats - Busca estatísticas do usuário
   */
  async getStats(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const stats = await this.userService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  }
}

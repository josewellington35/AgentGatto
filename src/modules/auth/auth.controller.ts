import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema } from './auth.validation';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response): Promise<void> {
    const validatedData = RegisterSchema.parse(req.body);

    const result = await this.authService.register(validatedData);

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      data: result,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const validatedData = LoginSchema.parse(req.body);

    const result = await this.authService.login(validatedData);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: result,
    });
  }

  async me(req: Request, res: Response): Promise<void> {
    // Usuário já foi carregado pelo authMiddleware
    res.json({
      success: true,
      data: req.user,
    });
  }
}

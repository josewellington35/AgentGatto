import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';

const reviewService = new ReviewService();

export class ReviewController {
  /**
   * Cria uma avaliação
   */
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const review = await reviewService.createReview(userId, req.body);

      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista avaliações com filtros
   */
  async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await reviewService.getReviews(req.query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca uma avaliação específica
   */
  async getReviewById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.getReviewById(String(req.params.id));

      res.json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza uma avaliação
   */
  async updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const review = await reviewService.updateReview(
        String(req.params.id),
        userId,
        req.body
      );

      res.json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove uma avaliação
   */
  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await reviewService.deleteReview(String(req.params.id), userId);

      res.json({
        success: true,
        message: 'Avaliação removida com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Estatísticas de avaliações de um serviço
   */
  async getServiceStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await reviewService.getServiceStats(String(req.params.serviceId));

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Estatísticas de avaliações de uma empresa
   */
  async getCompanyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await reviewService.getCompanyStats(String(req.params.companyId));

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

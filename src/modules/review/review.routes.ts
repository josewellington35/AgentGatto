import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validateRequest } from '../../shared/middlewares/validation.middleware';
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewsQuerySchema,
  reviewIdParamSchema,
  serviceIdParamSchema,
  companyIdParamSchema,
} from './review.validation';

const router = Router();
const reviewController = new ReviewController();

/**
 * @route   POST /api/reviews
 * @desc    Cria uma avaliação para um agendamento
 * @access  Private (Cliente)
 */
router.post(
  '/',
  authenticate,
  validateRequest({ body: createReviewSchema }),
  reviewController.createReview.bind(reviewController)
);

/**
 * @route   GET /api/reviews
 * @desc    Lista avaliações com filtros
 * @access  Public
 */
router.get(
  '/',
  validateRequest({ query: getReviewsQuerySchema }),
  reviewController.getReviews.bind(reviewController)
);

/**
 * @route   GET /api/reviews/service/:serviceId/stats
 * @desc    Estatísticas de avaliações de um serviço
 * @access  Public
 */
router.get(
  '/service/:serviceId/stats',
  validateRequest({ params: serviceIdParamSchema }),
  reviewController.getServiceStats.bind(reviewController)
);

/**
 * @route   GET /api/reviews/company/:companyId/stats
 * @desc    Estatísticas de avaliações de uma empresa
 * @access  Public
 */
router.get(
  '/company/:companyId/stats',
  validateRequest({ params: companyIdParamSchema }),
  reviewController.getCompanyStats.bind(reviewController)
);

/**
 * @route   GET /api/reviews/:id
 * @desc    Busca uma avaliação específica
 * @access  Public
 */
router.get(
  '/:id',
  validateRequest({ params: reviewIdParamSchema }),
  reviewController.getReviewById.bind(reviewController)
);

/**
 * @route   PATCH /api/reviews/:id
 * @desc    Atualiza uma avaliação
 * @access  Private (Autor da review)
 */
router.patch(
  '/:id',
  authenticate,
  validateRequest({
    params: reviewIdParamSchema,
    body: updateReviewSchema,
  }),
  reviewController.updateReview.bind(reviewController)
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Remove uma avaliação
 * @access  Private (Autor da review)
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: reviewIdParamSchema }),
  reviewController.deleteReview.bind(reviewController)
);

export default router;

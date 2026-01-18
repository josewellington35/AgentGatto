import { Router } from 'express';
import { ServiceController } from './service.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validateRequest } from '../../shared/middlewares/validation.middleware';
import {
  createServiceSchema,
  updateServiceSchema,
  searchServicesSchema,
  serviceIdParamSchema,
} from './service.validation';

const router = Router();
const serviceController = new ServiceController();

/**
 * @route   GET /api/services/popular
 * @desc    Busca serviços populares (mais bem avaliados)
 * @access  Public
 */
router.get('/popular', serviceController.getPopularServices.bind(serviceController));

/**
 * @route   GET /api/services/recent
 * @desc    Busca serviços recentes
 * @access  Public
 */
router.get('/recent', serviceController.getRecentServices.bind(serviceController));

/**
 * @route   GET /api/services/company/:companyId
 * @desc    Lista serviços de uma empresa
 * @access  Public
 */
router.get(
  '/company/:companyId',
  validateRequest({
    params: serviceIdParamSchema.pick({ id: true }).extend({
      companyId: serviceIdParamSchema.shape.id,
    }),
  }),
  serviceController.getCompanyServices.bind(serviceController)
);

/**
 * @route   POST /api/services
 * @desc    Cria um novo serviço
 * @access  Private (Empresa)
 */
router.post(
  '/',
  authenticate,
  validateRequest({ body: createServiceSchema }),
  serviceController.createService.bind(serviceController)
);

/**
 * @route   GET /api/services
 * @desc    Busca serviços com filtros
 * @access  Public
 */
router.get(
  '/',
  validateRequest({ query: searchServicesSchema }),
  serviceController.searchServices.bind(serviceController)
);

/**
 * @route   GET /api/services/:id
 * @desc    Busca um serviço específico
 * @access  Public
 */
router.get(
  '/:id',
  validateRequest({ params: serviceIdParamSchema }),
  serviceController.getServiceById.bind(serviceController)
);

/**
 * @route   PATCH /api/services/:id
 * @desc    Atualiza um serviço
 * @access  Private (Empresa)
 */
router.patch(
  '/:id',
  authenticate,
  validateRequest({
    params: serviceIdParamSchema,
    body: updateServiceSchema,
  }),
  serviceController.updateService.bind(serviceController)
);

/**
 * @route   PATCH /api/services/:id/deactivate
 * @desc    Desativa um serviço
 * @access  Private (Empresa)
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  validateRequest({ params: serviceIdParamSchema }),
  serviceController.deactivateService.bind(serviceController)
);

/**
 * @route   PATCH /api/services/:id/activate
 * @desc    Ativa um serviço
 * @access  Private (Empresa)
 */
router.patch(
  '/:id/activate',
  authenticate,
  validateRequest({ params: serviceIdParamSchema }),
  serviceController.activateService.bind(serviceController)
);

/**
 * @route   DELETE /api/services/:id
 * @desc    Deleta um serviço permanentemente
 * @access  Private (Empresa)
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: serviceIdParamSchema }),
  serviceController.deleteService.bind(serviceController)
);

export default router;

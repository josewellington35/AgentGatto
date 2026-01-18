import { Router } from 'express';
import { CompanyController } from './company.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validateRequest } from '../../shared/middlewares/validation.middleware';
import {
  createCompanySchema,
  updateCompanySchema,
  updateCompanyStatusSchema,
  createTimeSlotSchema,
  updateTimeSlotSchema,
  searchCompaniesSchema,
  companyIdParamSchema,
  timeSlotIdParamSchema,
} from './company.validation';

const router = Router();
const companyController = new CompanyController();

/**
 * @route   GET /api/companies/pending
 * @desc    Lista empresas pendentes de aprovação
 * @access  Private (Admin)
 */
router.get(
  '/pending',
  authenticate,
  // TODO: adicionar middleware requireRole(['ADMIN'])
  companyController.getPendingCompanies.bind(companyController)
);

/**
 * @route   POST /api/companies
 * @desc    Cadastra uma nova empresa
 * @access  Public (mas fica pendente de aprovação)
 */
router.post(
  '/',
  validateRequest({ body: createCompanySchema }),
  companyController.createCompany.bind(companyController)
);

/**
 * @route   GET /api/companies
 * @desc    Busca empresas com filtros
 * @access  Public
 */
router.get(
  '/',
  validateRequest({ query: searchCompaniesSchema }),
  companyController.searchCompanies.bind(companyController)
);

/**
 * @route   GET /api/companies/:id/stats
 * @desc    Busca estatísticas da empresa
 * @access  Private (Empresa/Admin)
 */
router.get(
  '/:id/stats',
  authenticate,
  validateRequest({ params: companyIdParamSchema }),
  companyController.getCompanyStats.bind(companyController)
);

/**
 * @route   GET /api/companies/:id
 * @desc    Busca uma empresa específica
 * @access  Public
 */
router.get(
  '/:id',
  validateRequest({ params: companyIdParamSchema }),
  companyController.getCompanyById.bind(companyController)
);

/**
 * @route   PATCH /api/companies/:id
 * @desc    Atualiza dados da empresa
 * @access  Private (Empresa)
 */
router.patch(
  '/:id',
  authenticate,
  validateRequest({
    params: companyIdParamSchema,
    body: updateCompanySchema,
  }),
  companyController.updateCompany.bind(companyController)
);

/**
 * @route   PATCH /api/companies/:id/status
 * @desc    Atualiza status da empresa (aprovar/rejeitar)
 * @access  Private (Admin)
 */
router.patch(
  '/:id/status',
  authenticate,
  // TODO: adicionar middleware requireRole(['ADMIN'])
  validateRequest({
    params: companyIdParamSchema,
    body: updateCompanyStatusSchema,
  }),
  companyController.updateCompanyStatus.bind(companyController)
);

/**
 * @route   DELETE /api/companies/:id
 * @desc    Remove uma empresa (soft delete)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  // TODO: adicionar middleware requireRole(['ADMIN'])
  validateRequest({ params: companyIdParamSchema }),
  companyController.deleteCompany.bind(companyController)
);

// ===== TIME SLOTS =====

/**
 * @route   POST /api/companies/:id/timeslots
 * @desc    Cria um horário de funcionamento
 * @access  Private (Empresa)
 */
router.post(
  '/:id/timeslots',
  authenticate,
  validateRequest({
    params: companyIdParamSchema,
    body: createTimeSlotSchema,
  }),
  companyController.createTimeSlot.bind(companyController)
);

/**
 * @route   GET /api/companies/:id/timeslots
 * @desc    Lista horários de funcionamento da empresa
 * @access  Public
 */
router.get(
  '/:id/timeslots',
  validateRequest({ params: companyIdParamSchema }),
  companyController.getCompanyTimeSlots.bind(companyController)
);

/**
 * @route   PATCH /api/companies/:id/timeslots/:timeSlotId
 * @desc    Atualiza um horário de funcionamento
 * @access  Private (Empresa)
 */
router.patch(
  '/:id/timeslots/:timeSlotId',
  authenticate,
  validateRequest({
    params: companyIdParamSchema.extend({
      timeSlotId: timeSlotIdParamSchema.shape.id,
    }),
    body: updateTimeSlotSchema,
  }),
  companyController.updateTimeSlot.bind(companyController)
);

/**
 * @route   DELETE /api/companies/:id/timeslots/:timeSlotId
 * @desc    Remove um horário de funcionamento
 * @access  Private (Empresa)
 */
router.delete(
  '/:id/timeslots/:timeSlotId',
  authenticate,
  validateRequest({
    params: companyIdParamSchema.extend({
      timeSlotId: timeSlotIdParamSchema.shape.id,
    }),
  }),
  companyController.deleteTimeSlot.bind(companyController)
);

export default router;

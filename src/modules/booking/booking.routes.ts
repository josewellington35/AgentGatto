import { Router } from 'express';
import { BookingController } from './booking.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validateRequest } from '../../shared/middlewares/validation.middleware';
import {
  createBookingSchema,
  cancelBookingSchema,
  updateBookingStatusSchema,
  checkAvailabilitySchema,
  getBookingsQuerySchema,
  getCompanyBookingsQuerySchema,
  bookingIdParamSchema,
} from './booking.validation';

const router = Router();
const bookingController = new BookingController();

/**
 * @route   POST /api/bookings
 * @desc    Cria um novo agendamento
 * @access  Private (Cliente)
 */
router.post(
  '/',
  authenticate,
  validateRequest({ body: createBookingSchema }),
  bookingController.createBooking.bind(bookingController)
);

/**
 * @route   GET /api/bookings
 * @desc    Lista agendamentos do usuário
 * @access  Private (Cliente)
 */
router.get(
  '/',
  authenticate,
  validateRequest({ query: getBookingsQuerySchema }),
  bookingController.getUserBookings.bind(bookingController)
);

/**
 * @route   GET /api/bookings/availability/:serviceId
 * @desc    Verifica disponibilidade de horários
 * @access  Public
 */
router.get(
  '/availability/:serviceId',
  validateRequest({ 
    params: bookingIdParamSchema.pick({ id: true }).extend({ serviceId: bookingIdParamSchema.shape.id }),
    query: checkAvailabilitySchema.pick({ date: true })
  }),
  bookingController.checkAvailability.bind(bookingController)
);

/**
 * @route   GET /api/bookings/company/:companyId
 * @desc    Lista agendamentos de uma empresa
 * @access  Private (Empresa)
 */
router.get(
  '/company/:companyId',
  authenticate,
  validateRequest({ 
    params: bookingIdParamSchema.pick({ id: true }).extend({ companyId: bookingIdParamSchema.shape.id }),
    query: getCompanyBookingsQuerySchema 
  }),
  bookingController.getCompanyBookings.bind(bookingController)
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Busca um agendamento específico
 * @access  Private (Cliente)
 */
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: bookingIdParamSchema }),
  bookingController.getBookingById.bind(bookingController)
);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancela um agendamento
 * @access  Private (Cliente)
 */
router.patch(
  '/:id/cancel',
  authenticate,
  validateRequest({ 
    params: bookingIdParamSchema,
    body: cancelBookingSchema 
  }),
  bookingController.cancelBooking.bind(bookingController)
);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Atualiza status do agendamento
 * @access  Private (Empresa)
 */
router.patch(
  '/:id/status',
  authenticate,
  validateRequest({ 
    params: bookingIdParamSchema,
    body: updateBookingStatusSchema 
  }),
  bookingController.updateBookingStatus.bind(bookingController)
);

export default router;

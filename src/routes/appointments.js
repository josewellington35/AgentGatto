const express = require('express');
const AppointmentController = require('../controllers/appointmentController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas de agendamento
router.post('/', AppointmentController.create);
router.get('/', AppointmentController.getAll);
router.get('/available', AppointmentController.getAvailableSlots);
router.get('/:id', AppointmentController.getById);
router.patch('/:id/status', AppointmentController.updateStatus);
router.delete('/:id', AppointmentController.delete);

module.exports = router;

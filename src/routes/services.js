const express = require('express');
const ServiceController = require('../controllers/serviceController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas
router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);

// Rotas protegidas (apenas admin)
router.post('/', authenticate, isAdmin, ServiceController.create);
router.put('/:id', authenticate, isAdmin, ServiceController.update);
router.delete('/:id', authenticate, isAdmin, ServiceController.delete);

module.exports = router;

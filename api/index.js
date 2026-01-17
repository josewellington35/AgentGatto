require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Rotas
const authRoutes = require('../src/routes/auth');
const serviceRoutes = require('../src/routes/services');
const appointmentRoutes = require('../src/routes/appointments');

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://client-bay-two-67.vercel.app',
  'https://client-josewellington35s-projects.vercel.app'
];

// Middleware CORS dinâmico
app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Permite origens da lista ou qualquer .vercel.app
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Log de requisições em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rotas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Agendamento',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      appointments: '/api/appointments'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API de Agendamento funcionando!',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile'
      },
      services: {
        list: 'GET /api/services',
        get: 'GET /api/services/:id',
        create: 'POST /api/services (admin)',
        update: 'PUT /api/services/:id (admin)',
        delete: 'DELETE /api/services/:id (admin)'
      },
      appointments: {
        create: 'POST /api/appointments',
        list: 'GET /api/appointments',
        get: 'GET /api/appointments/:id',
        updateStatus: 'PATCH /api/appointments/:id/status',
        delete: 'DELETE /api/appointments/:id',
        available: 'GET /api/appointments/available?date=YYYY-MM-DD'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor (apenas em ambiente local)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📚 Documentação: http://localhost:${PORT}/api`);
  });
}

// Export para Vercel
module.exports = app;

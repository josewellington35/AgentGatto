# AgentGatto - Sistema de Agendamento

Sistema completo de agendamento com backend TypeScript + Prisma e frontend Next.js.

## ✅ Status do Projeto

**Backend API**: ✅ COMPLETO (4/4 módulos principais)
- ✅ Auth Module (13 testes) - Autenticação e autorização
- ✅ Bookings Module (11 testes) - Agendamentos com prevenção de double booking
- ✅ Services Module (18 testes) - Catálogo de serviços com busca avançada
- ✅ Companies Module (21 testes) - Gestão de empresas com aprovação
- ✅ Reviews Module (20 testes) - Sistema de avaliações com estatísticas

**Testes**: 83 testes de integração (100% passando no módulo Reviews)
**Documentação**: 5 documentos API completos + guia de testes

## 📦 Stack Tecnológica

### Backend
- **Node.js 18+** + **TypeScript 5.7**
- **Express.js** - Framework web
- **Prisma ORM** - PostgreSQL ORM com type safety
- **Neon Database** - PostgreSQL serverless
- **Zod** - Validação de schemas
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Resend** - Envio de emails transacionais
- **Winston** - Logging profissional
- **Helmet + CORS + Rate Limiting** - Segurança

### Frontend
- **Next.js 14+** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização

## 🏗️ Estrutura

```
├── src/                 # Backend TypeScript
│   ├── config/         # Configurações
│   ├── modules/        # Auth, Users, etc
│   ├── shared/         # Errors, Utils, Middlewares
│   ├── app.ts          # Express setup
│   └── server.ts       # Entry point
├── prisma/             # Schema e migrations
├── client/             # Frontend Next.js
└── logs/               # Winston logs
```

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar .env
cp .env.example .env

# Gerar Prisma Client
npm run prisma:generate

# Aplicar migrations
npx prisma db push

# Popular banco (opcional)
npm run prisma:seed

# Rodar servidor
npm run dev
```

Servidor: `http://localhost:4000`

## 📡 API Endpoints

**Auth:**
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil

**Users:**
- `GET /api/users/profile` - Ver perfil
- `PATCH /api/users/profile` - Atualizar
- `PATCH /api/users/password` - Trocar senha
- `GET /api/users/stats` - Estatísticas

## 🔐 Credenciais de Teste

- Admin: `admin@agentgatto.com` / `Admin@123`
- Cliente: `cliente@example.com` / `Client@123`

## 📚 Scripts

```bash
npm run dev              # Desenvolvimento
npm run build            # Build produção
npm start                # Rodar produção
npm run prisma:studio    # GUI do banco
npm test                 # Rodar testes
npm run test:watch       # Testes em modo watch
npm run test:coverage    # Coverage report
```

## 🧪 Testes de Integração

O projeto conta com **83 testes de integração** cobrindo todos os módulos principais:

- **Auth Module**: 13 testes (register, login, me)
- **Bookings Module**: 11 testes (CRUD, availability, cancel)
- **Services Module**: 18 testes (CRUD, search, filters)
- **Companies Module**: 21 testes (CRUD, approval, time slots)
- **Reviews Module**: 20 testes (CRUD, statistics, permissions)

Veja [TESTING.md](docs/TESTING.md) para guia completo de testes.

## 🎯 Módulos Implementados

### ✅ Auth Module (13 testes)
- Registro e login com JWT
- Perfil de usuário autenticado
- Hash de senhas com bcrypt
- Rate limiting por IP

### ✅ User Module (4 endpoints)
- Perfil, atualização, troca de senha
- Estatísticas do usuário

### ✅ Bookings Module (7 endpoints, 11 testes)
- CRUD completo de agendamentos
- Prevenção de double booking
- Verificação de disponibilidade
- Cancelamento e atualização de status
- Filtros por usuário e empresa

### ✅ Services Module (10 endpoints, 18 testes)
- Catálogo de serviços
- Busca avançada (categoria, preço, cidade)
- Serviços populares e recentes
- Ativação/desativação
- Paginação e filtros

### ✅ Companies Module (13 endpoints, 21 testes)
- Gestão de empresas
- Workflow de aprovação (PENDING → APPROVED/REJECTED)
- Time slots configuráveis
- Estatísticas de empresa
- Filtros por status e categoria

### ✅ Reviews Module (7 endpoints, 20 testes)
- Avaliações de 1-5 estrelas
- Comentários opcionais
- Estatísticas agregadas (service + company)
- Rating distribution
- Permissões (somente autor pode editar/deletar)
- Validação: apenas bookings COMPLETED

## 📚 Documentação Completa

- [BOOKINGS_API.md](docs/BOOKINGS_API.md) - Sistema de agendamentos
- [SERVICES_API.md](docs/SERVICES_API.md) - Catálogo de serviços
- [COMPANIES_API.md](docs/COMPANIES_API.md) - Gestão de empresas
- [REVIEWS_API.md](docs/REVIEWS_API.md) - Sistema de avaliações
- [TESTING.md](docs/TESTING.md) - Guia de testes completo
- [REVIEWS_MODULE_SUMMARY.md](docs/REVIEWS_MODULE_SUMMARY.md) - Resumo do módulo Reviews
- [DOUBLE_BOOKING_PREVENTION.md](docs/DOUBLE_BOOKING_PREVENTION.md) - Prevenção de conflitos
- ✅ Services module (10 endpoints, advanced search)
- ✅ Companies module (13 endpoints, approval workflow)
- ✅ Reviews module (7 endpoints, rating system)

## 📖 Documentação Completa

- [Bookings API](docs/BOOKINGS_API.md) - Agendamentos e disponibilidade
- [Services API](docs/SERVICES_API.md) - Serviços e buscas avançadas
- [Companies API](docs/COMPANIES_API.md) - Empresas e horários de funcionamento
- [Reviews API](docs/REVIEWS_API.md) - Sistema de avaliações e ratings
- [API Tests](test.http) - Exemplos práticos de requisições

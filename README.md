# 📅 App de Agendamento - Node.js + Neon

Sistema completo de agendamento com autenticação, gerenciamento de serviços e agendamentos, usando Node.js, Express e Neon Database.

## 🚀 Tecnologias

- **Node.js** + **Express** - API REST
- **Neon Database** - Banco de dados PostgreSQL serverless
- **JWT** - Autenticação segura
- **bcryptjs** - Hash de senhas

## 📁 Estrutura do Projeto

```
.
├── api/
│   └── index.js              # Entry point da API (Vercel)
├── src/
│   ├── controllers/          # Controladores
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   └── appointmentController.js
│   ├── routes/               # Rotas da API
│   │   ├── auth.js
│   │   ├── services.js
│   │   └── appointments.js
│   ├── middleware/           # Middlewares
│   │   └── auth.js
│   └── db/                   # Database
│       ├── database.js       # Queries SQL
│       └── migrate.js        # Migrations
├── .env.example              # Exemplo de variáveis de ambiente
├── vercel.json               # Configuração Vercel
└── package.json
```

## 🛠️ Instalação Local

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd app-agendamento
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com sua connection string do Neon:

```env
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="sua_chave_secreta_forte_aqui"
PORT=3000
```

### 4. Execute as migrations

```bash
npm run migrate
```

### 5. Inicie o servidor local

```bash
npm run dev
```

Servidor estará rodando em `http://localhost:3000`

## 🚀 Deploy na Vercel

### 1. Instale a CLI da Vercel

```bash
npm i -g vercel
```

### 2. Faça login na Vercel

```bash
vercel login
```

### 3. Crie o banco de dados Neon

1. Acesse [console.neon.tech](https://console.neon.tech/)
2. Crie uma conta gratuita
3. Clique em **Create Project**
4. Escolha a região mais próxima
5. Copie a **Connection String**

**Plano Gratuito Neon:**
- ✅ 512 MB de armazenamento
- ✅ 1 projeto ativo
- ✅ Branching ilimitado
- ✅ Auto-scaling

### 4. Configure as variáveis de ambiente na Vercel

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

Cole os valores correspondentes:
- `DATABASE_URL`: Cole a connection string do Neon
- `JWT_SECRET`: Uma string aleatória forte

### 5. Deploy

```bash
vercel
```

Siga as instruções no terminal. Seu app estará disponível em `https://seu-projeto.vercel.app`

### 6. Execute as migrations no ambiente de produção

```bash
# Configure temporariamente a DATABASE_URL de produção no .env
# Depois execute:
npm run migrate
```

## 📚 Endpoints da API

### Autenticação

#### `POST /api/auth/register`
Cadastrar novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "phone": "11999999999"
}
```

#### `POST /api/auth/login`
Login de usuário.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "client"
  }
}
```

#### `GET /api/auth/profile`
Buscar perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

#### `PUT /api/auth/profile`
Atualizar perfil.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "João Silva Santos",
  "phone": "11988888888"
}
```

### Serviços

#### `GET /api/services`
Listar todos os serviços ativos.

**Query params:** `?active=false` (para listar todos, incluindo inativos)

#### `GET /api/services/:id`
Buscar serviço por ID.

#### `POST /api/services` (Admin)
Criar novo serviço.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Corte de Cabelo",
  "description": "Corte masculino tradicional",
  "duration": 30,
  "price": 50.00
}
```

#### `PUT /api/services/:id` (Admin)
Atualizar serviço.

#### `DELETE /api/services/:id` (Admin)
Remover serviço.

### Agendamentos

#### `POST /api/appointments`
Criar novo agendamento.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "service_id": 1,
  "appointment_date": "2026-01-20T14:00:00",
  "notes": "Preferência por profissional experiente"
}
```

#### `GET /api/appointments`
Listar agendamentos (do usuário ou todos se admin).

**Headers:** `Authorization: Bearer <token>`

**Query params:** `?status=pending` (pending, confirmed, cancelled, completed)

#### `GET /api/appointments/:id`
Buscar agendamento por ID.

**Headers:** `Authorization: Bearer <token>`

#### `PATCH /api/appointments/:id/status`
Atualizar status do agendamento.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "confirmed"
}
```

Status válidos: `pending`, `confirmed`, `cancelled`, `completed`

#### `DELETE /api/appointments/:id`
Remover agendamento.

**Headers:** `Authorization: Bearer <token>`

#### `GET /api/appointments/available?date=2026-01-20`
Verificar horários ocupados em uma data.

**Headers:** `Authorization: Bearer <token>`

## 🔐 Autenticação

Todas as rotas protegidas requerem o header:

```
Authorization: Bearer <seu_token_jwt>
```

### Roles de Usuário

- **client** - Usuário padrão (pode criar e gerenciar seus próprios agendamentos)
- **admin** - Administrador (pode gerenciar serviços, ver todos agendamentos e alterar status)

Para criar um admin, altere manualmente no banco de dados:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@email.com';
```

## 📊 Schema do Banco de Dados

### Tabela: users
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | ID único |
| name | VARCHAR(255) | Nome do usuário |
| email | VARCHAR(255) | Email (único) |
| password | VARCHAR(255) | Senha hash |
| phone | VARCHAR(20) | Telefone |
| role | VARCHAR(50) | client ou admin |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### Tabela: services
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | ID único |
| name | VARCHAR(255) | Nome do serviço |
| description | TEXT | Descrição |
| duration | INTEGER | Duração em minutos |
| price | DECIMAL(10,2) | Preço |
| active | BOOLEAN | Se está ativo |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### Tabela: appointments
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | ID único |
| user_id | INTEGER | ID do usuário |
| service_id | INTEGER | ID do serviço |
| appointment_date | TIMESTAMP | Data/hora do agendamento |
| status | VARCHAR(50) | Status do agendamento |
| notes | TEXT | Observações |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

## 🧪 Testando a API

Use o [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/) ou `curl`:

```bash
# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "phone": "11999999999"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'

# Listar serviços
curl http://localhost:3000/api/services

# Criar agendamento (substitua TOKEN pelo token recebido no login)
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "service_id": 1,
    "appointment_date": "2026-01-20T14:00:00",
    "notes": "Primeira vez"
  }'
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor local com auto-reload
- `npm start` - Inicia servidor em modo produção
- `npm run migrate` - Executa migrations do banco de dados

## 🔧 Troubleshooting

### Erro de conexão com banco de dados

Verifique se:
1. A `DATABASE_URL` no `.env` está correta
2. A connection string do Neon inclui `?sslmode=require`
3. O projeto Neon está ativo
4. Você executou as migrations

### Token inválido

Certifique-se de:
1. Incluir o header `Authorization: Bearer <token>`
2. O token não expirou (válido por 7 dias)
3. O `JWT_SECRET` está configurado

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando Node.js, Neon Database e Vercel**

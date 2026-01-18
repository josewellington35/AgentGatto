# Guia de Testes de Integração

Este guia explica como executar e escrever testes de integração para o AgentGatto.

## 📦 Configuração

### Dependências Instaladas
- **Jest** - Framework de testes
- **ts-jest** - Preset TypeScript para Jest
- **Supertest** - Testes HTTP de integração
- **@types/jest** e **@types/supertest** - Type definitions

### Arquivos de Configuração
- `jest.config.ts` - Configuração do Jest
- `__tests__/setup.ts` - Setup global dos testes

## 🚀 Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage

# Executar teste específico
npm test auth.test.ts
```

## 📁 Estrutura de Testes

```
__tests__/
├── setup.ts              # Configuração global
├── auth.test.ts          # Testes de autenticação
├── bookings.test.ts      # Testes de agendamentos
├── services.test.ts      # Testes de serviços
└── companies.test.ts     # Testes de empresas
```

## 📝 Cobertura de Testes

### Auth Module (auth.test.ts)
- ✅ POST /api/auth/register
  - Registro com sucesso
  - Falha com email inválido
  - Falha com senha fraca
  - Falha com email duplicado
  - Falha com campos obrigatórios faltando
  
- ✅ POST /api/auth/login
  - Login com credenciais corretas
  - Falha com senha incorreta
  - Falha com email não existente
  - Falha sem credenciais
  
- ✅ GET /api/auth/me
  - Sucesso com token válido
  - Falha sem token
  - Falha com token inválido
  - Falha com header malformado

**Total: 13 testes**

### Bookings Module (bookings.test.ts)
- ✅ POST /api/bookings
  - Criar agendamento com sucesso
  - Falha sem autenticação
  - Falha com formato de hora inválido
  - Falha com data passada
  
- ✅ GET /api/bookings
  - Listar agendamentos do usuário
  - Filtrar por status
  - Falha sem autenticação
  
- ✅ GET /api/bookings/availability/:serviceId
  - Verificar disponibilidade
  - Falha com ID de serviço inválido
  
- ✅ PATCH /api/bookings/:id/cancel
  - Cancelar agendamento
  - Falha com agendamento não existente
  - Falha sem motivo de cancelamento

**Total: 11 testes**

### Services Module (services.test.ts)
- ✅ POST /api/services
  - Criar serviço com sucesso
  - Falha com preço inválido
  - Falha com duração inválida
  - Falha com empresa não aprovada
  
- ✅ GET /api/services
  - Listar todos os serviços
  - Filtrar por categoria
  - Filtrar por faixa de preço
  - Buscar por nome
  - Filtrar por cidade
  - Ordenar por preço
  - Paginação
  
- ✅ GET /api/services/:id
  - Buscar serviço por ID
  - Falha com UUID inválido
  - Falha com serviço não existente
  
- ✅ PATCH /api/services/:id
  - Atualizar serviço
  - Falha com preço inválido
  
- ✅ PATCH /api/services/:id/deactivate
  - Desativar serviço
  - Ativar serviço
  
- ✅ DELETE /api/services/:id
  - Deletar serviço sem agendamentos

**Total: 18 testes**

### Companies Module (companies.test.ts)
- ✅ POST /api/companies
  - Criar empresa com sucesso
  - Falha com email inválido
  - Falha com email duplicado
  - Falha com categoria inválida
  
- ✅ GET /api/companies
  - Listar todas as empresas
  - Filtrar por status
  - Filtrar por categoria
  - Filtrar por cidade
  - Buscar por nome
  
- ✅ GET /api/companies/:id
  - Buscar empresa por ID
  - Buscar com detalhes
  - Falha com UUID inválido
  - Falha com empresa não existente
  
- ✅ GET /api/companies/pending
  - Listar empresas pendentes (admin)
  - Falha sem autenticação
  
- ✅ PATCH /api/companies/:id/status
  - Aprovar empresa
  - Rejeitar empresa com motivo
  - Falha ao rejeitar sem motivo
  
- ✅ POST /api/companies/:id/timeslots
  - Criar horário de funcionamento
  - Falha com formato de hora inválido
  - Falha com startTime >= endTime
  
- ✅ GET /api/companies/:id/timeslots
  - Listar horários da empresa

**Total: 21 testes**

## 📊 Resumo Geral
```
✅ Auth: 13 testes
✅ Bookings: 11 testes  
✅ Services: 18 testes
✅ Companies: 21 testes
━━━━━━━━━━━━━━━━━━━━━
📊 Total: 63 testes de integração
```

## 🔧 Banco de Dados de Teste

### Importante
Os testes usam o mesmo banco de dados configurado em `DATABASE_URL`. Para produção, você deve:

1. Criar banco de dados de teste separado
2. Configurar `DATABASE_URL` no arquivo de setup
3. Limpar dados entre testes (implementado no setup.ts)

### Exemplo de .env.test
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/agentgatto_test"
NODE_ENV=test
JWT_SECRET=test-secret-key
```

## ✍️ Escrever Novos Testes

### Template Básico
```typescript
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '../setup';

describe('Module Name - Integration Tests', () => {
  // Setup antes de todos os testes
  beforeAll(async () => {
    // Criar dados necessários
  });

  // Setup antes de cada teste
  beforeEach(async () => {
    // Resetar estado se necessário
  });

  describe('POST /api/endpoint', () => {
    it('should do something successfully', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send({ data: 'value' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Object),
      });
    });
  });

  // Cleanup após todos os testes
  afterAll(async () => {
    // Limpar dados criados
    await prisma.model.deleteMany({ where: { ... } });
  });
});
```

### Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Cleanup**: Sempre limpar dados criados
3. **Nomenclatura**: Descrever claramente o que o teste faz
4. **Assertions**: Usar `toMatchObject` para flexibilidade
5. **Status Codes**: Verificar códigos HTTP corretos
6. **Autenticação**: Testar rotas protegidas com e sem token

### Estrutura de Assertions
```typescript
// Verificar estrutura do response
expect(response.body).toMatchObject({
  success: true,
  data: {
    id: expect.any(String),
    name: 'Expected Name',
    createdAt: expect.any(String),
  },
});

// Verificar que campos sensíveis não são retornados
expect(response.body.data.password).toBeUndefined();

// Verificar arrays
expect(response.body.data.items).toEqual(expect.any(Array));
expect(response.body.data.items.length).toBeGreaterThan(0);
```

## 🐛 Debugging

### Modo Verbose
Jest já está configurado com `verbose: true` no `jest.config.ts`.

### Ver Logs Completos
```typescript
console.log(JSON.stringify(response.body, null, 2));
```

### Testar Endpoint Isolado
```bash
npm test -- auth.test.ts -t "should login successfully"
```

## 🔍 Coverage Report

Após executar `npm run test:coverage`, o relatório estará em:
```
coverage/
├── lcov-report/
│   └── index.html    # Abrir no navegador
└── lcov.info
```

### Visualizar Coverage
```bash
npm run test:coverage
# Abrir coverage/lcov-report/index.html no navegador
```

## 🚀 CI/CD

Para integrar com CI/CD (GitHub Actions, GitLab CI, etc.):

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: agentgatto_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/agentgatto_test
          
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 📚 Referências

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Última atualização:** 18/01/2026

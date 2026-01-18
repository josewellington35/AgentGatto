# Bookings API - Documentação

## Visão Geral
API completa para gestão de agendamentos com prevenção de double booking, validação de horários e controle de status.

---

## Endpoints Disponíveis

### 1. Verificar Disponibilidade
**Endpoint:** `GET /api/bookings/availability/:serviceId`  
**Auth:** Não requerida  
**Query Params:**
- `date` (obrigatório): Data no formato ISO 8601

**Exemplo:**
```http
GET http://localhost:4000/api/bookings/availability/uuid-servico?date=2026-01-25T00:00:00.000Z
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-01-25T00:00:00.000Z",
    "slots": [
      { "time": "09:00", "isAvailable": true },
      { "time": "09:30", "isAvailable": false },
      { "time": "10:00", "isAvailable": true },
      { "time": "10:30", "isAvailable": true }
    ]
  }
}
```

---

### 2. Criar Agendamento
**Endpoint:** `POST /api/bookings`  
**Auth:** Bearer Token (Cliente)

**Body:**
```json
{
  "serviceId": "uuid-do-servico",
  "date": "2026-01-25T00:00:00.000Z",
  "timeSlot": "09:00",
  "notes": "Primeira visita, preciso de atendimento especial"
}
```

**Validações:**
- `serviceId`: UUID válido
- `date`: ISO 8601, não pode ser data/hora passada
- `timeSlot`: Formato HH:MM (ex: 09:00, 14:30)
- `notes`: Opcional, máximo 500 caracteres

**Response Success (201):**
```json
{
  "success": true,
  "message": "Agendamento criado com sucesso",
  "data": {
    "id": "booking-uuid",
    "userId": "user-uuid",
    "serviceId": "service-uuid",
    "date": "2026-01-25T00:00:00.000Z",
    "timeSlot": "09:00",
    "status": "PENDING",
    "totalPrice": "50.00",
    "notes": "Primeira visita",
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z",
    "service": {
      "id": "service-uuid",
      "name": "Corte de Cabelo Masculino",
      "description": "Corte completo com finalização",
      "duration": 30,
      "price": "50.00",
      "companyId": "company-uuid",
      "company": {
        "id": "company-uuid",
        "name": "Barbearia X",
        "address": "Rua das Flores, 123",
        "phoneNumber": "+55 11 99999-8888"
      }
    }
  }
}
```

**Erros Comuns:**
- `409` - Horário já está reservado (double booking)
- `400` - Serviço não está disponível
- `400` - Horário fora do expediente da empresa
- `400` - Data/hora no passado

---

### 3. Listar Meus Agendamentos
**Endpoint:** `GET /api/bookings`  
**Auth:** Bearer Token (Cliente)

**Query Params (todos opcionais):**
- `status`: PENDING | CONFIRMED | CANCELLED | COMPLETED
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máx: 100)

**Exemplos:**
```http
# Todos os agendamentos
GET http://localhost:4000/api/bookings
Authorization: Bearer {token}

# Apenas confirmados
GET http://localhost:4000/api/bookings?status=CONFIRMED
Authorization: Bearer {token}

# Por período
GET http://localhost:4000/api/bookings?startDate=2026-01-20T00:00:00.000Z&endDate=2026-01-31T23:59:59.999Z
Authorization: Bearer {token}

# Com paginação
GET http://localhost:4000/api/bookings?page=2&limit=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "date": "2026-01-25T00:00:00.000Z",
      "timeSlot": "09:00",
      "status": "CONFIRMED",
      "totalPrice": "50.00",
      "service": {
        "name": "Corte de Cabelo",
        "company": {
          "name": "Barbearia X"
        }
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### 4. Buscar Agendamento Específico
**Endpoint:** `GET /api/bookings/:id`  
**Auth:** Bearer Token (Cliente)

**Exemplo:**
```http
GET http://localhost:4000/api/bookings/booking-uuid
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "userId": "user-uuid",
    "serviceId": "service-uuid",
    "date": "2026-01-25T00:00:00.000Z",
    "timeSlot": "09:00",
    "status": "CONFIRMED",
    "totalPrice": "50.00",
    "notes": "Primeira visita",
    "service": {
      "name": "Corte de Cabelo",
      "company": {
        "name": "Barbearia X",
        "address": "Rua das Flores, 123",
        "phoneNumber": "+55 11 99999-8888"
      }
    },
    "user": {
      "name": "João Silva",
      "email": "joao@example.com",
      "phoneNumber": "+55 11 98888-7777"
    }
  }
}
```

---

### 5. Cancelar Agendamento
**Endpoint:** `PATCH /api/bookings/:id/cancel`  
**Auth:** Bearer Token (Cliente)

**Body:**
```json
{
  "cancellationReason": "Não poderei comparecer neste horário"
}
```

**Exemplo:**
```http
PATCH http://localhost:4000/api/bookings/booking-uuid/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "cancellationReason": "Surgiu um compromisso urgente"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agendamento cancelado com sucesso",
  "data": {
    "id": "booking-uuid",
    "status": "CANCELLED",
    "cancellationReason": "Surgiu um compromisso urgente",
    "updatedAt": "2026-01-18T11:30:00.000Z"
  }
}
```

**Validações:**
- Não pode cancelar agendamento já cancelado
- Não pode cancelar agendamento já concluído
- Apenas o dono do agendamento pode cancelar

---

### 6. Listar Agendamentos da Empresa (Empresa)
**Endpoint:** `GET /api/bookings/company/:companyId`  
**Auth:** Bearer Token (Empresa/Admin)

**Query Params:**
- `status`: PENDING | CONFIRMED | CANCELLED | COMPLETED
- `serviceId`: Filtrar por serviço específico
- `startDate`: ISO 8601
- `endDate`: ISO 8601
- `page`: Número da página
- `limit`: Itens por página

**Exemplo:**
```http
GET http://localhost:4000/api/bookings/company/company-uuid?status=PENDING
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "date": "2026-01-25T00:00:00.000Z",
      "timeSlot": "09:00",
      "status": "PENDING",
      "totalPrice": "50.00",
      "service": {
        "name": "Corte de Cabelo"
      },
      "user": {
        "name": "João Silva",
        "email": "joao@example.com",
        "phoneNumber": "+55 11 98888-7777"
      }
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 7. Atualizar Status do Agendamento (Empresa)
**Endpoint:** `PATCH /api/bookings/:id/status`  
**Auth:** Bearer Token (Empresa/Admin)

**Body:**
```json
{
  "status": "CONFIRMED",
  "companyId": "company-uuid"
}
```

**Status Válidos:**
- `PENDING`: Aguardando confirmação
- `CONFIRMED`: Confirmado pela empresa
- `CANCELLED`: Cancelado
- `COMPLETED`: Serviço foi concluído

**Exemplo:**
```http
PATCH http://localhost:4000/api/bookings/booking-uuid/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "CONFIRMED",
  "companyId": "company-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status do agendamento atualizado",
  "data": {
    "id": "booking-uuid",
    "status": "CONFIRMED",
    "updatedAt": "2026-01-18T11:45:00.000Z"
  }
}
```

---

## Regras de Negócio

### Prevenção de Double Booking
- O sistema verifica automaticamente se o horário está disponível
- Constraint no banco: `@@unique([serviceId, date, timeSlot])`
- Apenas agendamentos PENDING e CONFIRMED bloqueiam horários

### Validação de Horários
- Horários devem estar dentro dos time slots da empresa
- Respeitam o dia da semana configurado
- Validam a duração do serviço

### Fluxo de Status
```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED (pode ser cancelado em qualquer momento antes de COMPLETED)
```

### Permissões
- **Clientes**: Podem criar, ver seus próprios e cancelar
- **Empresas**: Podem ver todos os agendamentos e atualizar status
- **Admin**: Acesso total

---

## Códigos de Erro

| Código | Mensagem | Solução |
|--------|----------|---------|
| 400 | Horário fora do expediente | Verificar time slots da empresa |
| 400 | Data/hora no passado | Usar data futura |
| 400 | Serviço não disponível | Verificar se serviço está ativo |
| 403 | Sem permissão | Verificar autenticação e ownership |
| 404 | Agendamento não encontrado | Verificar ID |
| 409 | Horário já reservado | Escolher outro horário |

---

## Testes Recomendados

1. **Fluxo Completo Cliente:**
   - Verificar disponibilidade
   - Criar agendamento
   - Listar agendamentos
   - Cancelar agendamento

2. **Fluxo Empresa:**
   - Listar agendamentos pendentes
   - Confirmar agendamento
   - Marcar como concluído

3. **Testes de Validação:**
   - Tentar agendar em data passada (deve falhar)
   - Tentar double booking (deve falhar)
   - Tentar horário fora do expediente (deve falhar)

---

## Próximas Melhorias

- [ ] Notificações por email/SMS
- [ ] Lembretes automáticos
- [ ] Sistema de fila de espera
- [ ] Reagendamento automático
- [ ] Integração com calendários (Google, Outlook)

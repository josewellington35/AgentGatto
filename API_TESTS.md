# Backend v2 - Tests

## Testar Health Check
```bash
GET http://localhost:4000/health
```

## Auth - Register
```bash
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "name": "Teste User",
  "email": "teste@example.com",
  "password": "Test@123",
  "phoneNumber": "+55 11 99999-8888",
  "role": "CLIENT"
}
```

## Auth - Login
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "Client@123"
}
```

## Auth - Me
```bash
GET http://localhost:4000/api/auth/me
Authorization: Bearer {token}
```

## Users - Get Profile
```bash
GET http://localhost:4000/api/users/profile
Authorization: Bearer {token}
```

## Users - Update Profile
```bash
PATCH http://localhost:4000/api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Novo Nome",
  "phoneNumber": "+55 11 98888-7777"
}
```

## Users - Change Password
```bash
PATCH http://localhost:4000/api/users/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "Client@123",
  "newPassword": "NewPassword@456",
  "confirmPassword": "NewPassword@456"
}
```

## Users - Stats
```bash
GET http://localhost:4000/api/users/stats
Authorization: Bearer {token}
```

---

# Bookings (Agendamentos)

## Bookings - Check Availability
Verifica horários disponíveis para um serviço em uma data específica.

```bash
GET http://localhost:4000/api/bookings/availability/{serviceId}?date=2026-01-25T00:00:00.000Z
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
      { "time": "10:00", "isAvailable": true }
    ]
  }
}
```

## Bookings - Create
Cria um novo agendamento.

```bash
POST http://localhost:4000/api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceId": "uuid-do-servico",
  "date": "2026-01-25T00:00:00.000Z",
  "timeSlot": "09:00",
  "notes": "Primeira visita"
}
```

**Validações:**
- serviceId: UUID válido
- date: ISO 8601, não pode ser passada
- timeSlot: Formato HH:MM (ex: 09:00)
- notes: Opcional, máx 500 caracteres

## Bookings - List User Bookings
```bash
GET http://localhost:4000/api/bookings
Authorization: Bearer {token}
```

**Query Params:** status, startDate, endDate, page, limit

## Bookings - Get by ID
```bash
GET http://localhost:4000/api/bookings/{bookingId}
Authorization: Bearer {token}
```

## Bookings - Cancel
```bash
PATCH http://localhost:4000/api/bookings/{bookingId}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "cancellationReason": "Não poderei comparecer"
}
```

## Bookings - List Company Bookings (Empresa)
```bash
GET http://localhost:4000/api/bookings/company/{companyId}
Authorization: Bearer {token}
```

## Bookings - Update Status (Empresa)
```bash
PATCH http://localhost:4000/api/bookings/{bookingId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "CONFIRMED",
  "companyId": "company-uuid"
}
```

**Status:** PENDING, CONFIRMED, CANCELLED, COMPLETED

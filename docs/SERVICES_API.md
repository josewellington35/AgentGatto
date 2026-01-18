# Services API - Documentação

## Visão Geral
API completa para gestão de serviços: criação, busca avançada, filtros, ativação/desativação e exclusão.

---

## Endpoints Disponíveis

### 1. Buscar Serviços Populares
**Endpoint:** `GET /api/services/popular`  
**Auth:** Não requerida

**Query Params:**
- `limit` (opcional): Número de serviços (padrão: 10)

**Exemplo:**
```http
GET http://localhost:4000/api/services/popular?limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "service-uuid",
      "name": "Corte de Cabelo",
      "description": "Corte profissional",
      "duration": 30,
      "price": "50.00",
      "rating": 4.8,
      "totalReviews": 156,
      "company": {
        "name": "Barbearia X",
        "category": "BEAUTY"
      }
    }
  ]
}
```

---

### 2. Buscar Serviços Recentes
**Endpoint:** `GET /api/services/recent`  
**Auth:** Não requerida

**Query Params:**
- `limit` (opcional): Número de serviços (padrão: 10)

**Exemplo:**
```http
GET http://localhost:4000/api/services/recent?limit=15
```

---

### 3. Buscar Serviços com Filtros
**Endpoint:** `GET /api/services`  
**Auth:** Não requerida

**Query Params (todos opcionais):**
- `search`: Texto para buscar no nome/descrição
- `category`: BEAUTY | AUTOMOTIVE | HEALTH | FOOD | OTHER
- `companyId`: UUID da empresa
- `city`: Nome da cidade
- `minPrice`: Preço mínimo
- `maxPrice`: Preço máximo
- `isActive`: true | false (padrão: true)
- `sortBy`: price | rating | name | createdAt (padrão: createdAt)
- `sortOrder`: asc | desc (padrão: desc)
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máx: 100)

**Exemplos:**
```http
# Buscar por categoria
GET http://localhost:4000/api/services?category=BEAUTY&page=1&limit=10

# Buscar por texto
GET http://localhost:4000/api/services?search=corte&sortBy=rating&sortOrder=desc

# Buscar por faixa de preço
GET http://localhost:4000/api/services?minPrice=20&maxPrice=100

# Buscar em uma cidade específica
GET http://localhost:4000/api/services?city=São Paulo&category=AUTOMOTIVE

# Combinar múltiplos filtros
GET http://localhost:4000/api/services?search=manicure&city=Rio&minPrice=30&sortBy=price
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "service-uuid",
      "companyId": "company-uuid",
      "name": "Corte Masculino",
      "description": "Corte completo com finalização",
      "duration": 30,
      "price": "50.00",
      "isActive": true,
      "imageUrl": "https://...",
      "rating": 4.8,
      "totalReviews": 156,
      "company": {
        "id": "company-uuid",
        "name": "Barbearia X",
        "category": "BEAUTY",
        "address": "Rua das Flores, 123",
        "city": "São Paulo",
        "rating": 4.7
      }
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 4. Buscar Serviço por ID
**Endpoint:** `GET /api/services/:id`  
**Auth:** Não requerida

**Exemplo:**
```http
GET http://localhost:4000/api/services/service-uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "service-uuid",
    "name": "Corte de Cabelo",
    "description": "Corte profissional",
    "duration": 30,
    "price": "50.00",
    "isActive": true,
    "rating": 4.8,
    "totalReviews": 156,
    "company": {
      "name": "Barbearia X",
      "address": "Rua das Flores, 123",
      "city": "São Paulo"
    },
    "reviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Excelente atendimento!",
        "userName": "João Silva",
        "createdAt": "2026-01-10T14:30:00.000Z"
      }
    ]
  }
}
```

---

### 5. Buscar Serviços de uma Empresa
**Endpoint:** `GET /api/services/company/:companyId`  
**Auth:** Não requerida

**Query Params:**
- `includeInactive`: true | false (padrão: false)

**Exemplo:**
```http
GET http://localhost:4000/api/services/company/company-uuid?includeInactive=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "service-uuid",
      "name": "Corte Masculino",
      "price": "50.00",
      "isActive": true
    },
    {
      "id": "service-uuid-2",
      "name": "Barba",
      "price": "30.00",
      "isActive": false
    }
  ]
}
```

---

### 6. Criar Serviço (Empresa)
**Endpoint:** `POST /api/services`  
**Auth:** Bearer Token (Empresa)

**Body:**
```json
{
  "companyId": "company-uuid",
  "name": "Corte de Cabelo Masculino",
  "description": "Corte completo com lavagem, finalização e acabamento profissional. Produtos de qualidade premium.",
  "duration": 30,
  "price": 50.00,
  "imageUrl": "https://example.com/image.jpg"
}
```

**Validações:**
- `companyId`: UUID válido
- `name`: 3-100 caracteres
- `description`: 10-1000 caracteres
- `duration`: 15-480 minutos (15 min - 8 horas)
- `price`: Positivo, máx R$ 99.999,99
- `imageUrl`: URL válida (opcional)

**Regras de Negócio:**
- Empresa deve existir
- Empresa deve estar com status APPROVED

**Response Success (201):**
```json
{
  "success": true,
  "message": "Serviço criado com sucesso",
  "data": {
    "id": "service-uuid",
    "companyId": "company-uuid",
    "name": "Corte de Cabelo Masculino",
    "description": "Corte completo...",
    "duration": 30,
    "price": "50.00",
    "isActive": true,
    "rating": 0,
    "totalReviews": 0,
    "createdAt": "2026-01-18T10:00:00.000Z",
    "updatedAt": "2026-01-18T10:00:00.000Z"
  }
}
```

**Erros Comuns:**
- `404` - Empresa não encontrada
- `403` - Empresa não está aprovada

---

### 7. Atualizar Serviço (Empresa)
**Endpoint:** `PATCH /api/services/:id`  
**Auth:** Bearer Token (Empresa)

**Body (todos campos opcionais):**
```json
{
  "companyId": "company-uuid",
  "name": "Corte Premium",
  "description": "Nova descrição",
  "duration": 45,
  "price": 60.00,
  "imageUrl": "https://...",
  "isActive": true
}
```

**Exemplo:**
```http
PATCH http://localhost:4000/api/services/service-uuid
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyId": "company-uuid",
  "price": 60.00,
  "duration": 45
}
```

**Response:**
```json
{
  "success": true,
  "message": "Serviço atualizado com sucesso",
  "data": {
    "id": "service-uuid",
    "name": "Corte Premium",
    "price": "60.00",
    "duration": 45,
    "updatedAt": "2026-01-18T11:30:00.000Z"
  }
}
```

**Validações:**
- Apenas o dono do serviço pode atualizar
- Mesmas regras de validação do create

---

### 8. Desativar Serviço (Empresa)
**Endpoint:** `PATCH /api/services/:id/deactivate`  
**Auth:** Bearer Token (Empresa)

**Body:**
```json
{
  "companyId": "company-uuid"
}
```

**Exemplo:**
```http
PATCH http://localhost:4000/api/services/service-uuid/deactivate
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyId": "company-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Serviço desativado com sucesso",
  "data": {
    "id": "service-uuid",
    "isActive": false
  }
}
```

**Nota:** Serviços desativados não aparecem nas buscas públicas, mas agendamentos existentes são mantidos.

---

### 9. Ativar Serviço (Empresa)
**Endpoint:** `PATCH /api/services/:id/activate`  
**Auth:** Bearer Token (Empresa)

**Body:**
```json
{
  "companyId": "company-uuid"
}
```

**Exemplo:**
```http
PATCH http://localhost:4000/api/services/service-uuid/activate
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyId": "company-uuid"
}
```

---

### 10. Deletar Serviço (Empresa)
**Endpoint:** `DELETE /api/services/:id`  
**Auth:** Bearer Token (Empresa)

**Body:**
```json
{
  "companyId": "company-uuid"
}
```

**Exemplo:**
```http
DELETE http://localhost:4000/api/services/service-uuid
Authorization: Bearer {token}
Content-Type: application/json

{
  "companyId": "company-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Serviço deletado com sucesso"
}
```

**Validações:**
- Apenas o dono pode deletar
- **Não pode deletar se houver agendamentos associados**
- Recomendado: desativar ao invés de deletar

**Erro:**
```json
{
  "success": false,
  "message": "Não é possível deletar serviço com agendamentos. Desative-o ao invés disso."
}
```

---

## Regras de Negócio

### Criação de Serviços
- Apenas empresas APROVADAS podem criar serviços
- Todos os serviços são criados como ATIVOS por padrão
- Duração mínima: 15 minutos, máxima: 8 horas

### Busca e Filtros
- Busca por texto: case-insensitive, busca em nome/descrição/empresa
- Filtros podem ser combinados
- Ordenação padrão: mais recentes primeiro
- Apenas serviços ativos aparecem por padrão

### Ativação/Desativação
- Desativar: serviço não aparece em buscas, mas agendamentos existentes são mantidos
- Ativar: serviço volta a aparecer normalmente
- Soft delete: preferido ao invés de deletar

### Exclusão
- Apenas permitida se NÃO houver agendamentos
- Validação automática antes de deletar
- Recomendação: usar desativação ao invés de exclusão

### Permissões
- **Público**: Buscar, listar, ver detalhes
- **Empresas**: Criar, atualizar, ativar/desativar, deletar (apenas seus próprios)
- **Admin**: Acesso total

---

## Categorias Disponíveis

```typescript
enum Category {
  BEAUTY = "BEAUTY",        // Beleza (salões, barbearias, spa)
  AUTOMOTIVE = "AUTOMOTIVE", // Automotivo (oficinas, lavacar)
  HEALTH = "HEALTH",        // Saúde (clínicas, consultórios)
  FOOD = "FOOD",            // Alimentação (restaurantes, cafés)
  OTHER = "OTHER"           // Outros
}
```

---

## Exemplos de Uso Completo

### 1. Empresa cria serviço
```http
POST /api/services
{
  "companyId": "abc-123",
  "name": "Corte + Barba",
  "description": "Pacote completo",
  "duration": 60,
  "price": 80.00
}
```

### 2. Cliente busca serviços
```http
GET /api/services?category=BEAUTY&city=São Paulo&minPrice=30&maxPrice=100
```

### 3. Cliente vê detalhes
```http
GET /api/services/service-uuid
```

### 4. Cliente agenda (usando Bookings API)
```http
POST /api/bookings
{
  "serviceId": "service-uuid",
  "date": "2026-01-25T00:00:00.000Z",
  "timeSlot": "14:00"
}
```

### 5. Empresa atualiza preço
```http
PATCH /api/services/service-uuid
{
  "companyId": "abc-123",
  "price": 90.00
}
```

---

## Códigos de Erro

| Código | Mensagem | Solução |
|--------|----------|---------|
| 400 | Nome muito curto/longo | Ajustar tamanho do nome |
| 400 | Duração inválida | Use 15-480 minutos |
| 403 | Empresa não aprovada | Aguardar aprovação |
| 403 | Sem permissão | Verificar ownership |
| 404 | Serviço não encontrado | Verificar ID |
| 404 | Empresa não encontrada | Verificar companyId |
| 400 | Não pode deletar com agendamentos | Desativar ao invés |

---

## Integração com Outros Módulos

### Com Bookings
- Serviços são referenciados em agendamentos
- Validação de serviço ativo ao criar booking
- Impede exclusão se houver bookings

### Com Reviews (futuro)
- Rating e totalReviews são atualizados automaticamente
- Reviews aparecem nos detalhes do serviço

### Com Companies
- Serviço sempre vinculado a uma empresa
- Herda categoria da empresa
- Valida status APPROVED da empresa

---

## Performance e Otimizações

### Índices do Banco
- `isActive`: Para filtrar ativos/inativos
- `rating`: Para ordenar por popularidade
- `companyId`: Para buscar por empresa

### Paginação
- Limite padrão: 10 itens
- Máximo: 100 itens por página
- Use paginação para grandes resultados

### Cache (futuro)
- Serviços populares podem ser cacheados
- Invalidar cache ao atualizar serviço
- TTL recomendado: 5-10 minutos

---

## Próximas Melhorias

- [ ] Upload de imagens (integração com S3/Cloudinary)
- [ ] Sistema de tags/etiquetas
- [ ] Serviços em destaque/promocionais
- [ ] Histórico de alterações de preço
- [ ] Agendamento recorrente
- [ ] Pacotes de serviços (combos)
- [ ] Cupons de desconto por serviço

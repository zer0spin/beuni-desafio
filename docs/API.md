# Beuni API Documentation

## 🚀 Overview

The Beuni Birthday Management Platform API provides a comprehensive RESTful interface for managing employee birthdays, user authentication, gift deliveries, and corporate information with multi-tenant support.

**Base URL**: `http://localhost:3001` (development)
**API Version**: v1.2.0
**Documentation**: Available at `/api/docs` (Swagger UI)

## 🔐 Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and generate JWT token with organization context
- **Rate Limit**: 5 attempts per minute

#### Request
```json
{
    "email": "ana.rh@beunidemo.com",
    "password": "123456"
}
```

#### Response
- **200 OK**:
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "uuid",
        "email": "ana.rh@beunidemo.com",
        "nomeCompleto": "Ana Silva",
        "role": "admin",
        "organizationId": "uuid",
        "organizacao": {
            "id": "uuid",
            "nome": "Beuni Demo Corp",
            "cnpj": "12.345.678/0001-90"
        }
    }
}
```
- **401 Unauthorized**: Invalid credentials
- **429 Too Many Requests**: Rate limit exceeded

### Register
- **Endpoint**: `POST /auth/register`
- **Description**: Register new user (creates organization if first user)

#### Request
```json
{
    "email": "user@company.com",
    "password": "SecurePass123!",
    "nomeCompleto": "John Doe",
    "organizacao": {
        "nome": "Company Name",
        "cnpj": "12.345.678/0001-90"
    }
}
```

### Get Profile
- **Endpoint**: `GET /auth/profile`
- **Authentication**: Required
- **Description**: Get current user profile with organization details

#### Response
```json
{
    "id": "uuid",
    "email": "user@company.com",
    "nomeCompleto": "John Doe",
    "role": "admin",
    "organizationId": "uuid",
    "organizacao": {
        "nome": "Company Name",
        "cnpj": "12.345.678/0001-90"
    }
}
```

## 👷 Colaboradores (Employees) Module

### List Collaborators
- **Endpoint**: `GET /colaboradores`
- **Authentication**: Required
- **Description**: List all employees in user's organization with pagination
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10, max: 100)
  - `search`: String (search by name, department, or position)
  - `departamento`: String (filter by department)

#### Response
```json
{
    "colaboradores": [
        {
            "id": "uuid",
            "nomeCompleto": "Maria Santos",
            "dataNascimento": "1990-05-15",
            "cargo": "Desenvolvedora",
            "departamento": "Tecnologia",
            "telefone": "(11) 99999-9999",
            "endereco": {
                "cep": "01310-100",
                "logradouro": "Av. Paulista",
                "numero": "123",
                "complemento": "Sala 456",
                "bairro": "Bela Vista",
                "cidade": "São Paulo",
                "uf": "SP"
            },
            "organizationId": "uuid",
            "createdAt": "2025-01-01T00:00:00.000Z",
            "updatedAt": "2025-01-01T00:00:00.000Z"
        }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
}
```

### Get Collaborator
- **Endpoint**: `GET /colaboradores/:id`
- **Authentication**: Required
- **Description**: Get specific collaborator details

### Create Collaborator
- **Endpoint**: `POST /colaboradores`
- **Authentication**: Required

#### Request
```json
{
    "nomeCompleto": "João Silva",
    "dataNascimento": "1985-12-25",
    "cargo": "Designer",
    "departamento": "Marketing",
    "telefone": "(11) 88888-8888",
    "endereco": {
        "cep": "04567-890",
        "numero": "789",
        "complemento": "Apto 101"
    }
}
```

### Update Collaborator
- **Endpoint**: `PUT /colaboradores/:id`
- **Authentication**: Required

### Delete Collaborator
- **Endpoint**: `DELETE /colaboradores/:id`
- **Authentication**: Required

### Upcoming Birthdays
- **Endpoint**: `GET /colaboradores/aniversariantes-proximos`
- **Authentication**: Required
- **Description**: Get employees with birthdays in the next 30 days

#### Response
```json
{
    "aniversariantes": [
        {
            "id": "uuid",
            "nomeCompleto": "Carlos Eduardo",
            "dataNascimento": "1988-10-15",
            "cargo": "Analista",
            "departamento": "Financeiro",
            "diasParaAniversario": 14
        }
    ],
    "total": 3
}
```

## 🎁 Envio de Brindes (Gift Deliveries) Module

### List Gift Deliveries
- **Endpoint**: `GET /envio-brindes`
- **Authentication**: Required
- **Query Parameters**:
  - `status`: Enum (PENDENTE, PRONTO_PARA_ENVIO, ENVIADO, ENTREGUE, CANCELADO)
  - `ano`: Number (default: current year)
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)
  - `colaboradorId`: UUID (filter by specific employee)

#### Response
```json
{
    "envios": [
        {
            "id": "uuid",
            "colaboradorId": "uuid",
            "anoAniversario": 2025,
            "status": "PRONTO_PARA_ENVIO",
            "dataGatilhoEnvio": "2025-10-01T06:00:00.000Z",
            "dataEnvio": null,
            "dataEntrega": null,
            "observacoes": null,
            "colaborador": {
                "nomeCompleto": "Ana Costa",
                "cargo": "Gerente",
                "departamento": "Vendas",
                "endereco": {
                    "cidade": "Rio de Janeiro",
                    "uf": "RJ"
                }
            },
            "createdAt": "2025-09-24T06:00:00.000Z"
        }
    ],
    "total": 15,
    "page": 1,
    "limit": 10
}
```

### Mark as Sent
- **Endpoint**: `PATCH /envio-brindes/:id/marcar-enviado`
- **Authentication**: Required
- **Description**: Mark gift delivery as sent

#### Request
```json
{
    "observacoes": "Enviado via Correios - Código: BR123456789"
}
```

### Get Statistics
- **Endpoint**: `GET /envio-brindes/estatisticas`
- **Authentication**: Required
- **Query Parameters**:
  - `ano`: Number (default: current year)

#### Response
```json
{
    "totalEnvios": 45,
    "pendentes": 12,
    "prontosParaEnvio": 8,
    "enviados": 20,
    "entregues": 5,
    "cancelados": 0,
    "taxaSucesso": 0.89,
    "porMes": {
        "janeiro": { "enviados": 4, "pendentes": 1 },
        "fevereiro": { "enviados": 3, "pendentes": 2 },
        // ... outros meses
    }
}
```

### Ready for Shipment
- **Endpoint**: `GET /envio-brindes/prontos-para-envio`
- **Authentication**: Required
- **Description**: Get all gift deliveries ready to be shipped

## 🏠 CEP (Address Validation) Module

### Validate CEP
- **Endpoint**: `GET /cep/:cep`
- **Authentication**: Required
- **Description**: Validate Brazilian postal code and retrieve address details
- **Rate Limit**: 30 requests per minute
- **Cache**: Redis cache (24 hours TTL)

#### Parameters
- `cep`: String (8 digits, with or without hyphen)

#### Response
- **200 OK**:
```json
{
    "cep": "01310-100",
    "logradouro": "Avenida Paulista",
    "complemento": "de 612 ao fim - lado par",
    "bairro": "Bela Vista",
    "localidade": "São Paulo",
    "uf": "SP",
    "ibge": "3550308",
    "gia": "1004",
    "ddd": "11",
    "siafi": "7107"
}
```
- **400 Bad Request**: Invalid CEP format
- **404 Not Found**: CEP not found
- **429 Too Many Requests**: Rate limit exceeded

## 📊 System Module

### Health Check
- **Endpoint**: `GET /health`
- **Authentication**: Not required
- **Description**: System health status

#### Response
```json
{
    "status": "ok",
    "info": {
        "database": { "status": "up" },
        "redis": { "status": "up" },
        "memory_heap": { "status": "up" },
        "memory_rss": { "status": "up" }
    },
    "error": {},
    "details": {
        "database": { "status": "up" },
        "redis": { "status": "up" },
        "memory_heap": { "status": "up", "used": 45.2 },
        "memory_rss": { "status": "up", "used": 123.4 }
    }
}
```

## 🛡️ Error Handling

### Standard Error Response Format
```json
{
    "statusCode": 400,
    "message": "Validation failed",
    "error": "Bad Request",
    "details": [
        {
            "field": "email",
            "code": "invalid_email",
            "message": "Email must be a valid email address"
        }
    ]
}
```

### Common Error Codes
- **400 Bad Request**: Invalid input data or missing required fields
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have permission for this operation
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **422 Unprocessable Entity**: Validation failed
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server error

### Validation Error Examples

#### Invalid Email Format
```json
{
    "statusCode": 400,
    "message": "Email must be a valid email address",
    "error": "Bad Request",
    "field": "email"
}
```

#### Weak Password
```json
{
    "statusCode": 400,
    "message": "Password must be at least 12 characters long and contain uppercase, lowercase, numbers, and special characters",
    "error": "Bad Request",
    "field": "password"
}
```

#### CEP Not Found
```json
{
    "statusCode": 404,
    "message": "CEP not found",
    "error": "Not Found"
}
```

## � Rate Limiting

Rate limits are applied per IP address:

| Endpoint Pattern | Limit | Window |
|-----------------|-------|---------|
| `POST /auth/login` | 5 requests | 1 minute |
| `POST /auth/register` | 3 requests | 10 minutes |
| `GET /cep/*` | 30 requests | 1 minute |
| All other endpoints | 100 requests | 1 minute |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1696176000
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: HS256 algorithm with secure secret
- **Multi-tenancy**: Organization-based data isolation
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: Secure HTTP-only cookies option

### Input Validation
- **Class Validator**: Comprehensive input validation
- **DTO Transformation**: Automatic type conversion and validation
- **Sanitization**: XSS protection and input sanitization
- **File Upload**: Secure file upload with type validation

### Security Headers
- **Helmet**: Security headers middleware
- **CORS**: Configurable cross-origin resource sharing
- **CSP**: Content Security Policy headers
- **HSTS**: HTTP Strict Transport Security

### Data Protection
- **Organization Isolation**: All queries filtered by organization
- **Audit Logging**: Comprehensive request/response logging
- **Sensitive Data**: Passwords excluded from responses
- **PII Protection**: Personal data handling compliance

## � Data Models

### User
```typescript
interface User {
    id: string;
    email: string;
    nomeCompleto: string;
    role: 'admin' | 'user';
    organizationId: string;
    profileImageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

### Organization
```typescript
interface Organization {
    id: string;
    nome: string;
    cnpj: string;
    createdAt: Date;
    updatedAt: Date;
}
```

### Collaborator
```typescript
interface Collaborator {
    id: string;
    nomeCompleto: string;
    dataNascimento: string; // Format: YYYY-MM-DD
    cargo: string;
    departamento: string;
    telefone?: string;
    endereco: Address;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}
```

### Address
```typescript
interface Address {
    id: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    colaboradorId: string;
}
```

### Gift Delivery
```typescript
interface GiftDelivery {
    id: string;
    colaboradorId: string;
    anoAniversario: number;
    status: 'PENDENTE' | 'PRONTO_PARA_ENVIO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
    dataGatilhoEnvio?: Date;
    dataEnvio?: Date;
    dataEntrega?: Date;
    observacoes?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

## 🚀 Production Considerations

### Performance
- **Database Indexing**: Optimized queries with proper indexes
- **Caching Strategy**: Redis caching for external APIs and frequent queries
- **Pagination**: All list endpoints support pagination
- **Connection Pooling**: Database connection optimization

### Monitoring
- **Health Checks**: Comprehensive system health monitoring
- **Logging**: Structured logging with correlation IDs
- **Metrics**: Performance and business metrics collection
- **Error Tracking**: Detailed error reporting and tracking

### Deployment
- **Environment Variables**: All configuration externalized
- **Docker Support**: Multi-stage builds for production
- **Database Migrations**: Versioned schema migrations
- **Graceful Shutdown**: Proper application lifecycle management

---

## 📞 Support

- **Swagger Documentation**: `/api/docs`
- **Health Check**: `/health`
- **Version**: Current API version is 1.2.0

For additional support or questions about the API, please refer to the technical documentation in the `/docs` directory.

---

*Last updated: October 1st, 2025*

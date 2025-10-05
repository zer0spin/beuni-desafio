# API Documentation

> **Last Updated**: October 4, 2025
> **API Version**: 1.0.0
> **Base URL (Production)**: https://beuni-desafio-production-41c7.up.railway.app

Complete API documentation for the Beuni Birthday Management Platform backend services.

---

## 📋 Quick Navigation

| Document | Purpose | Key Topics |
|----------|---------|------------|
| **[API.md](./API.md)** | Complete API reference with all endpoints | Authentication, CRUD operations, business logic endpoints |
| **[GLOBAL_DELETE_OPERATIONS.md](./GLOBAL_DELETE_OPERATIONS.md)** | Global delete operations documentation | Bulk deletion, organization isolation, safety measures |

---

## 🚀 Getting Started

### Base URLs

**Production**:
```
https://beuni-desafio-production-41c7.up.railway.app
```

**Development**:
```
http://localhost:3001
```

### API Documentation (Swagger)

**Production**: https://beuni-desafio-production-41c7.up.railway.app/api/docs
**Development**: http://localhost:3001/api/docs

---

## 🔐 Authentication

All API endpoints (except login/register) require JWT authentication via httpOnly cookies.

### Authentication Flow

1. **Login** - `POST /auth/login`
   - Returns JWT in httpOnly cookie
   - Returns CSRF token in response

2. **Use Protected Endpoints**
   - Include cookie automatically (browser)
   - Include CSRF token in headers (if required)

3. **Logout** - `POST /auth/logout`
   - Clears authentication cookie

### Example Request

```typescript
// Login
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include' // Important: includes cookies
});

// Use protected endpoint
const data = await fetch('/colaboradores', {
  credentials: 'include' // Sends authentication cookie
});
```

---

## 📚 API Modules

### 1. Authentication & Authorization

**Endpoints**:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

**Features**:
- JWT with httpOnly cookies
- CSRF protection
- Rate limiting (5 req/min)
- bcrypt password hashing

### 2. Organizations

**Endpoints**:
- `GET /organizacoes` - List organizations
- `GET /organizacoes/:id` - Get organization
- `POST /organizacoes` - Create organization
- `PUT /organizacoes/:id` - Update organization
- `DELETE /organizacoes/:id` - Delete organization

**Features**:
- Multi-tenant isolation
- Organization-scoped queries

### 3. Users

**Endpoints**:
- `GET /usuarios` - List users
- `GET /usuarios/:id` - Get user
- `POST /usuarios` - Create user
- `PUT /usuarios/:id` - Update user
- `DELETE /usuarios/:id` - Delete user

**Features**:
- Role-based access control
- Organization membership

### 4. Employees (Colaboradores)

**Endpoints**:
- `GET /colaboradores` - List employees with pagination
- `GET /colaboradores/:id` - Get employee details
- `POST /colaboradores` - Create employee
- `PUT /colaboradores/:id` - Update employee
- `DELETE /colaboradores/:id` - Delete employee
- `DELETE /colaboradores/delete-all` - **Delete all employees** (organization-scoped)

**Features**:
- Pagination and filtering
- Photo upload support
- Birthday tracking
- Organization isolation

**See**: [GLOBAL_DELETE_OPERATIONS.md](./GLOBAL_DELETE_OPERATIONS.md) for bulk deletion details

### 5. Gift Shipments (Envio de Brindes)

**Endpoints**:
- `GET /envio-brindes` - List shipments with filters
- `GET /envio-brindes/:id` - Get shipment details
- `POST /envio-brindes` - Create shipment
- `PUT /envio-brindes/:id` - Update shipment
- `DELETE /envio-brindes/:id` - Delete shipment
- `POST /envio-brindes/bulk` - **Bulk create shipments** for a year
- `DELETE /envio-brindes/delete-all-year` - **Delete all shipments** for a year (organization-scoped)
- `POST /envio-brindes/fix-gatilho-dates` - Fix trigger dates for shipments

**Features**:
- Business day calculations (7 days before birthday)
- Status tracking (pending, sent, delivered)
- Bulk operations for annual planning
- Organization isolation

**See**: [GLOBAL_DELETE_OPERATIONS.md](./GLOBAL_DELETE_OPERATIONS.md) for bulk operations

### 6. Products (Produtos/Brindes)

**Endpoints**:
- `GET /produtos` - List products
- `GET /produtos/:id` - Get product
- `POST /produtos` - Create product
- `PUT /produtos/:id` - Update product
- `DELETE /produtos/:id` - Delete product

**Features**:
- Product catalog management
- Category and pricing

### 7. Notifications

**Endpoints**:
- `GET /notificacoes` - List notifications
- `GET /notificacoes/unread-count` - Get unread count
- `PUT /notificacoes/:id/read` - Mark as read
- `PUT /notificacoes/mark-all-read` - Mark all as read

**Features**:
- Birthday reminders
- Shipment deadline alerts
- Priority-based notifications

### 8. CEP (Address Lookup)

**Endpoints**:
- `GET /cep/:cep` - Lookup address by CEP

**Features**:
- ViaCEP integration
- Redis caching
- Automatic formatting

### 9. Reports & Analytics

**Endpoints**:
- `GET /relatorios/dashboard` - Dashboard statistics
- `GET /relatorios/birthdays-by-month` - Birthday distribution
- `GET /relatorios/shipment-status` - Shipment statistics
- `GET /relatorios/upcoming-birthdays` - Next birthdays

**Features**:
- Monthly/yearly filters
- Chart-ready data formats
- KPI calculations

---

## 🗑️ Global Delete Operations

### Overview

Global delete operations allow bulk deletion of records with strict organization isolation and safety measures.

**Key Features**:
- Organization-scoped deletion (cannot delete other organization's data)
- Confirmation required (multi-step process)
- Cascade deletion for related records
- Detailed operation feedback

### Endpoints

#### Delete All Employees
```http
DELETE /colaboradores/delete-all
Authorization: Bearer <token>
X-Organization-Id: <org-id>
```

**Response**:
```json
{
  "message": "All employees deleted successfully",
  "deletedCount": 150
}
```

#### Delete All Shipments for Year
```http
DELETE /envio-brindes/delete-all-year?year=2025
Authorization: Bearer <token>
X-Organization-Id: <org-id>
```

**Response**:
```json
{
  "message": "All shipments for year 2025 deleted successfully",
  "deletedCount": 365
}
```

### Safety Measures

1. **Organization Isolation**: Only deletes records belonging to authenticated user's organization
2. **Authentication Required**: JWT token mandatory
3. **Confirmation Flow**: Frontend requires explicit confirmation
4. **Audit Trail**: Deletions logged for compliance
5. **No Soft Delete Bypass**: Permanently removes records

**Full Documentation**: [GLOBAL_DELETE_OPERATIONS.md](./GLOBAL_DELETE_OPERATIONS.md)

---

## 📊 Response Formats

### Success Response
```json
{
  "id": "uuid",
  "name": "John Doe",
  "createdAt": "2025-10-04T10:00:00Z"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

## 🔧 Common Request Headers

```http
Content-Type: application/json
Authorization: Bearer <jwt-token>
X-CSRF-Token: <csrf-token>
X-Organization-Id: <org-id>
```

---

## 🛠️ Development Tools

### Testing API Endpoints

#### Using cURL
```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beuni.com","password":"Admin@123"}'

# Get employees
curl http://localhost:3001/colaboradores \
  -H "Authorization: Bearer <token>"
```

#### Using Postman

1. Import Swagger documentation: http://localhost:3001/api/docs-json
2. Configure environment variables
3. Test endpoints with auto-complete

#### Using Swagger UI

Visit: http://localhost:3001/api/docs

- Interactive API explorer
- Try endpoints directly
- See request/response examples

---

## 📈 Rate Limiting

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Authentication | 5 requests | 1 minute |
| Read Operations | 100 requests | 1 minute |
| Write Operations | 20 requests | 1 minute |
| Delete Operations | 5 requests | 1 minute |

---

## 🚨 Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 400 | Bad Request | Invalid input data, validation failure |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions, wrong organization |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error, check logs |

---

## 🔗 Related Documentation

### Internal Links
- [Main README](../../README.md)
- [Documentation Index](../README.md)
- [Security Documentation](../security/README.md)
- [Development Guide](../development/SETUP_GUIDE.md)
- [Testing Guide](../testing/README.md)

### External Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)

---

## 📝 Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-04 | 1.1.0 | Added global delete operations, fixed date calculations |
| 2025-10-03 | 1.0.1 | Enhanced shipment endpoints, business day fixes |
| 2025-10-02 | 1.0.0 | Initial API documentation |

---

**Maintained By**: Backend Development Team
**API Version**: 1.0.0
**Last Updated**: October 4, 2025

---

*For technical support or API questions, refer to the [Development Guide](../development/SETUP_GUIDE.md) or contact the backend team.*

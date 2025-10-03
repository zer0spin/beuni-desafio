# Security Testing Guide

> DEPRECATED: This guide has been consolidated. For the up-to-date, unified security documentation, see docs/security/SECURITY_CONSOLIDATED.md.
# Security Testing Guide

## Post-Remediation Validation

This guide helps validate that all security fixes are working correctly.

---

## 1. SQL Injection Prevention Testing

### Test 1: Malicious OrganizationId
```bash
# Try to inject SQL through API
curl -X GET "http://localhost:3001/api/colaboradores/aniversariantes-proximos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "organizationId: 1' OR '1'='1"

# Expected: Query should fail safely or return empty results
# Should NOT expose SQL errors
```

### Test 2: Month Parameter Injection
```bash
# Try SQL injection through query params
curl -X GET "http://localhost:3001/api/colaboradores/estatisticas/aniversarios-mes?ano=2024' OR '1'='1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: Validation error or safe handling
```

---

## 2. Error Handling Validation

### Test 1: Production Error Sanitization
```bash
# Set NODE_ENV=production
export NODE_ENV=production

# Trigger an error
curl -X GET "http://localhost:3001/api/colaboradores/invalid-id-12345" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "statusCode": 404,
  "message": "Colaborador não encontrado",
  "timestamp": "2025-10-02T...",
  "path": "/api/colaboradores/invalid-id-12345"
}

# Should NOT contain: stack traces, file paths, or internal details
```

### Test 2: Development Error Details
```bash
# Set NODE_ENV=development
export NODE_ENV=development

# Same request should show more details (for debugging)
# But still no stack traces exposed to client
```

---

## 3. Password Security Testing

### Test 1: Weak Password Rejection
```bash
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "weak"
  }'

# Expected: 400 Bad Request with validation error
# "Senha deve ter pelo menos 12 caracteres"
```

### Test 2: Strong Password Acceptance
```bash
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Strong@Pass123!@#"
  }'

# Expected: 201 Created with JWT token
```

### Test 3: Bcrypt Verification
```typescript
// In your test suite
import * as bcrypt from 'bcryptjs';

test('should use 12 salt rounds', async () => {
  const password = 'Test@Password123';
  const hash = await bcrypt.hash(password, 12);
  
  // Bcrypt hash format: $2a$12$...
  // The "12" indicates salt rounds
  expect(hash).toMatch(/^\$2[aby]\$12\$/);
});
```

---

## 4. Input Validation Testing

### Test 1: Invalid CEP Format
```bash
curl -X POST "http://localhost:3001/api/colaboradores" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Test User",
    "data_nascimento": "1990-01-01",
    "cargo": "Developer",
    "departamento": "IT",
    "endereco": {
      "cep": "123",
      "numero": "100"
    }
  }'

# Expected: 400 Bad Request
# "CEP deve conter apenas 8 dígitos numéricos"
```

### Test 2: Invalid Email
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notanemail",
    "password": "password123"
  }'

# Expected: 400 Bad Request
# "E-mail deve ter um formato válido"
```

---

## 5. Authentication Testing

### Test 1: JWT Validation
```bash
# Try accessing protected endpoint without token
curl -X GET "http://localhost:3001/api/colaboradores"

# Expected: 401 Unauthorized
```

### Test 2: Invalid JWT
```bash
curl -X GET "http://localhost:3001/api/colaboradores" \
  -H "Authorization: Bearer invalid.jwt.token"

# Expected: 401 Unauthorized
```

### Test 3: Expired JWT
```bash
# Use an expired token (change JWT_EXPIRES_IN to 1s for testing)
# Expected: 401 Unauthorized with "Token expired" message
```

---

## 6. Authorization Testing (Multi-tenant)

### Test 1: Organization Isolation
```bash
# User from Organization A tries to access Organization B data
# Login as User A
TOKEN_A=$(curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "userA@orgA.com", "password": "password"}' \
  | jq -r '.access_token')

# Try to access another organization's data
curl -X GET "http://localhost:3001/api/colaboradores" \
  -H "Authorization: Bearer $TOKEN_A"

# Expected: Should only return colaboradores from User A's organization
```

---

## 7. Rate Limiting Testing

### Test 1: Login Rate Limit
```bash
# Attempt 6 login requests rapidly (limit is 5 per minute)
for i in {1..6}; do
  curl -X POST "http://localhost:3001/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "test@test.com", "password": "wrong"}'
  echo "Request $i"
done

# Expected: 6th request should return 429 Too Many Requests
```

---

## 8. CORS Testing

### Test 1: Valid Origin
```bash
curl -X OPTIONS "http://localhost:3001/api/colaboradores" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"

# Expected: CORS headers present
# Access-Control-Allow-Origin: http://localhost:3000
```

### Test 2: Invalid Origin
```bash
curl -X OPTIONS "http://localhost:3001/api/colaboradores" \
  -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: GET"

# Expected: CORS headers blocked or origin rejected
```

---

## 9. Security Headers Testing

### Test Headers Present
```bash
curl -I "http://localhost:3001/api/docs"

# Expected Headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=15552000
# Content-Security-Policy: ...
```

---

## 10. Automated Security Scanning

### NPM Audit
```bash
cd backend
npm audit

# Expected: No high or critical vulnerabilities
```

### Dependency Check
```bash
npm outdated

# Keep dependencies updated
npm update
```

---

## Security Test Checklist

### SQL Injection Prevention ✅
- [ ] organizationId injection blocked
- [ ] Query parameter injection blocked
- [ ] All raw SQL replaced with ORM

### Error Handling ✅
- [ ] Production errors sanitized
- [ ] No stack traces exposed
- [ ] Detailed server-side logging works

### Authentication ✅
- [ ] JWT validation working
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected

### Authorization ✅
- [ ] Multi-tenant isolation enforced
- [ ] Users can only access their org data

### Input Validation ✅
- [ ] Invalid CEP rejected
- [ ] Invalid email rejected
- [ ] Weak passwords rejected
- [ ] String length limits enforced

### Cryptography ✅
- [ ] Bcrypt using 12 salt rounds
- [ ] Passwords properly hashed
- [ ] JWT secret from environment

### Security Headers ✅
- [ ] Helmet headers present
- [ ] CSP configured
- [ ] CORS working correctly

### Rate Limiting ✅
- [ ] Login rate limit enforced
- [ ] API rate limits working

---

## Running Tests

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:cov
```

---

## Penetration Testing Checklist

- [ ] SQL Injection attempts
- [ ] XSS attempts
- [ ] CSRF attempts
- [ ] Authentication bypass
- [ ] Authorization bypass
- [ ] Session hijacking
- [ ] Brute force attacks
- [ ] Information disclosure
- [ ] Insecure deserialization
- [ ] XML External Entities (XXE)

---

**Last Updated:** 2025-10-02
**By:** Trinity Security Team

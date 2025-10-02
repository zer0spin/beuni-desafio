# Security Quick Reference Card

## Critical Security Fixes Applied

### 1. SQL Injection Prevention
**DO:** Use Prisma Query Builder
```typescript
// CORRECT
const users = await prisma.user.findMany({
  where: { organizationId }
});
```

**DON'T:** Use raw SQL with user input
```typescript
// WRONG - SQL Injection vulnerability
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE org_id = ${organizationId}
`;
```

### 2. Error Handling
**DO:** Let global exception filter handle errors
```typescript
// CORRECT - throw standard exceptions
throw new NotFoundException('Resource not found');
throw new UnauthorizedException('Invalid credentials');
```

**DON'T:** Expose internal details
```typescript
// WRONG - leaks information
throw new Error(`Database error: ${dbError.stack}`);
```

### 3. Password Security
**DO:** Use bcrypt with 12+ salt rounds
```typescript
// CORRECT
const saltRounds = 12;
const hash = await bcrypt.hash(password, saltRounds);
```

**DON'T:** Use weak hashing
```typescript
// WRONG
const hash = md5(password); // Never use MD5
const hash = await bcrypt.hash(password, 8); // Too weak
```

### 4. Input Validation
**DO:** Always validate with DTOs
```typescript
// CORRECT
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @MinLength(12)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;
}
```

**DON'T:** Trust user input
```typescript
// WRONG - no validation
async createUser(data: any) {
  return await prisma.user.create({ data });
}
```

## Security Checklist for New Code

- [ ] No raw SQL queries with user input
- [ ] All DTOs have validation decorators
- [ ] Sensitive data is hashed/encrypted
- [ ] Authorization checks on all endpoints
- [ ] Error handling doesn't leak info
- [ ] Input is sanitized and validated
- [ ] Rate limiting applied where needed

## Security Headers (Already Configured)

✅ Helmet.js active
✅ CORS configured
✅ CSP headers set
✅ Rate limiting enabled

## Quick Commands

```bash
# Security audit
npm audit

# Run tests
npm test

# Build check
npm run build

# Type check
npm run lint
```

## Report Security Issues

Found a vulnerability? Report to: security@beuni.com

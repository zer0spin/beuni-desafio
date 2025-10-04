# 🔧 Troubleshooting - Beuni Platform

Complete troubleshooting guide for the Beuni project.

---

## 📋 Index

1. [Login Errors](#login-errors)
2. [API Connection Errors](#api-connection-errors)
3. [Database Errors](#database-errors)
4. [Deployment Errors](#deployment-errors)
5. [Useful Commands](#useful-commands)

---

## 🔐 Login Errors

### Error: "Request failed with status code 500"

**Cause**: Database without migrations or tables not created.

**Solution**:
```bash
# 1. Connect via SSH to Railway and run migrations
cd backend
railway ssh "npx prisma migrate deploy"

# 2. Verify tables were created
railway ssh "cd /app && npx prisma studio"
```

---

### Error: "Bad Request (400)" on login

**Cause**: Frontend sending incorrect fields in request body.

**Check**:
- Backend DTO expects `email` and `password`
- Frontend is sending these fields correctly

**Correct example**:
```json
{
  "email": "admin@beuni.com",
  "password": "Admin@123"
}
```

---

### Error: "Invalid credentials (401)"

**Cause**: User doesn't exist in database or incorrect password.

**Solution - Create test user**:
```bash
cd backend
railway ssh "cd /app && cat > create-user.js << 'EOFSCRIPT'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
async function createTestUser() {
  const prisma = new PrismaClient();
  try {
    let org = await prisma.organizacao.findFirst({ where: { nome: 'Beuni HQ' } });
    if (!org) {
      org = await prisma.organizacao.create({ data: { nome: 'Beuni HQ' } });
      console.log('✅ Organization created:', org.id);
    }
    const existingUser = await prisma.usuario.findUnique({ where: { email: 'admin@beuni.com' } });
    if (existingUser) {
      console.log('ℹ️  User already exists');
      await prisma.\$disconnect();
      return;
    }
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const user = await prisma.usuario.create({
      data: {
        nome: 'Admin Beuni',
        email: 'admin@beuni.com',
        senhaHash: hashedPassword,
        organizationId: org.id
      }
    });
    console.log('✅ Admin user created:', user.email);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}
createTestUser();
EOFSCRIPT
node create-user.js && rm create-user.js"
```

**Created credentials**:
- Email: `admin@beuni.com`
- Password: `Admin@123`

---

## 🌐 API Connection Errors

### Error: "Network Error" or "ERR_NETWORK"

**Cause**: Frontend trying to connect to incorrect backend URL.

**Check frontend configuration**:
```env
# .env.local (frontend)
NEXT_PUBLIC_API_URL=https://beuni-desafio-production.up.railway.app
```

**Verify CORS configuration**:
```bash
# Check backend CORS settings
railway logs --tail
```

**Check CORS configuration in backend**:
```typescript
// main.ts
app.enableCors({
  origin: 'https://beuni-frontend-one.vercel.app',
  credentials: true
});
```

---

### Error: "CORS Error"

**Cause**: Backend not configured to accept requests from frontend domain.

**Solution**:
```bash
# Update CORS_ORIGIN variable in Railway
CORS_ORIGIN=https://beuni-frontend-one.vercel.app
```

---

## 🗄️ Database Errors

### Error: "PrismaClientInitializationError"

**Cause**: Migrations not executed in production database.

**Solution**:
```bash
# Apply migrations in production
railway ssh "npx prisma migrate deploy"

# Verify database schema
railway ssh "npx prisma db pull"
```

---

### Error: "Table doesn't exist"

**Cause**: Database schema not up to date.

**Solution**:
```bash
# Reset and recreate database (DEVELOPMENT ONLY)
railway ssh "npx prisma migrate reset"

# In production, use:
railway ssh "npx prisma migrate deploy"
```

---

## 🚀 Deployment Errors

### Error: "Application failed to respond"

**Cause**: PORT variable incorrectly configured.

**Solution**:
```env
# Correct configuration (no quotes)
PORT=${{PORT}}

# Incorrect configuration
PORT="${{PORT}}"
```

**Complete fix steps:**
1. Access Railway Dashboard
2. Go to Backend service → Variables
3. Find the PORT line
4. Remove quotes: change `PORT="${{PORT}}"` to `PORT=${{PORT}}`
5. Save changes (press Enter or click outside)
6. Wait 3-5 minutes for automatic redeploy

### Error: "Variables not being substituted"

**Cause**: Railway variable references not working correctly.

**Manual URL Copy Solution (100% guaranteed)**:

#### Step 1: Copy PostgreSQL URL
1. Railway Dashboard → Your Project
2. Click **Postgres** service
3. Click **Variables** tab
4. Find `DATABASE_URL`
5. Click the eye icon 👁️ to reveal password
6. Copy the complete URL

Example:
```
postgresql://postgres:AbCd1234EfGh5678@containers-us-west-123.railway.app:5432/railway
```

#### Step 2: Copy Redis URL
1. Click **Redis** service
2. Click **Variables** tab
3. Find `REDIS_URL`
4. Click eye icon 👁️ to reveal password
5. Copy the complete URL

Example:
```
redis://default:XyZ9876WqRsTuV5432@containers-us-west-456.railway.app:6379
```

#### Step 3: Configure Backend with Real URLs
1. Go back to **Backend** service
2. Click **Variables** tab
3. Click settings ⚙️ → **Raw Editor**
4. Delete everything and paste this JSON (replace URLs):

```json
{
  "CORS_ORIGIN": "https://beuni-frontend-one.vercel.app",
  "DATABASE_URL": "PASTE_YOUR_POSTGRES_URL_HERE",
  "JWT_EXPIRES_IN": "7d",
  "JWT_SECRET": "fa68e27a-4848-47e5-8535-af2f25b8866a",
  "NODE_ENV": "production",
  "PORT": "3001",
  "RATE_LIMIT_CEP": "30",
  "RATE_LIMIT_LOGIN": "5",
  "REDIS_URL": "PASTE_YOUR_REDIS_URL_HERE",
  "VIACEP_API_URL": "https://viacep.com.br/ws"
}
```

5. Click **Save Variables**
6. Wait for automatic redeploy (~3-5 minutes)

---

## 🐛 Docker build failed

**Cause**: Docker image build issues.

**Check**:
- Dockerfile uses correct base image
- All dependencies are included
- Build context is correct

**Solution**:
```dockerfile
# Use Debian instead of Alpine for Prisma
FROM node:18-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates
```

---

## 🛠️ Useful Commands

### Railway CLI Commands
```bash
# Login to Railway
railway login

# Link project
railway link

# View logs
railway logs --tail

# Access shell
railway ssh

# View environment variables
railway variables

# Deploy
railway up
```

### Prisma Commands
```bash
# Generate client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Reset database (DEVELOPMENT ONLY)
npx prisma migrate reset

# View database
npx prisma studio

# Pull database schema
npx prisma db pull
```

### Docker Commands
```bash
# Build image
docker build -t beuni-backend .

# Run container
docker run -p 3001:3001 beuni-backend

# View logs
docker logs <container-id>

# Access container
docker exec -it <container-id> /bin/bash
```

---

## 🔍 Diagnostic Commands

### Check Application Health
```bash
# Test health endpoint
curl https://beuni-desafio-production.up.railway.app/health

# Test API documentation
curl https://beuni-desafio-production.up.railway.app/api/docs
```

### Database Connection Test
```bash
# Test database connection
railway ssh "npx prisma db pull"

# Count records in tables
railway ssh "npx prisma db seed --preview-feature"
```

### Redis Connection Test
```bash
# Test Redis connection
railway ssh "redis-cli -u \$REDIS_URL ping"
```

---

## 📋 Production Checklist

### Before Deployment
- [ ] Test user created in database
- [ ] Environment variables configured
- [ ] CORS origin correctly set
- [ ] Migrations applied
- [ ] Health endpoint responding
- [ ] API documentation accessible
- [ ] Redis connection working
- [ ] Production URLs correct in all files

### After Deployment
- [ ] Application responding on production URL
- [ ] Login working with test credentials
- [ ] Database queries executing correctly
- [ ] Error handling working properly
- [ ] Logs showing structured information
- [ ] Monitoring alerts configured

---

## 🆘 Emergency Procedures

### Application Down
1. Check Railway deployment logs
2. Verify database connection
3. Check environment variables
4. Restart services if needed

### Database Issues
1. Check connection string
2. Verify migrations status
3. Check disk space
4. Review recent schema changes

### Performance Issues
1. Check resource usage (CPU/Memory)
2. Analyze slow queries
3. Review Redis cache hit rate
4. Check for memory leaks

---

**Last Updated**: October 4, 2025  
**Maintained By**: Development Team  
**Status**: Production Ready
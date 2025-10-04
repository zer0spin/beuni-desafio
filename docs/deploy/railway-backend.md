# 🚂 Railway Backend Deployment - Complete Guide

## 📋 **OVERVIEW**

This guide documents the complete process for deploying the NestJS backend on Railway, including PostgreSQL database and Redis configuration.

### **Technical Stack:**
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Database**: PostgreSQL (managed)
- **Cache**: Redis (managed)
- **Deploy**: Railway with automatic CI/CD
- **URL**: https://beuni-desafio-production.up.railway.app

---

## 🚀 **STEP-BY-STEP - INITIAL DEPLOYMENT**

### **1. Repository Preparation**
```bash
# Required structure:
/beuni-desafio/
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
└── frontend/
```

### **2. Create Railway Project**
1. **Access**: https://railway.app
2. **Login**: "Login with GitHub"
3. **New Project**: "New Project" → "Deploy from GitHub repo"
4. **Select**: "zer0spin/beuni-desafio"

### **3. Configure Services**

#### **3.1 PostgreSQL Database**
```bash
# In Railway Dashboard:
1. "Add Service" → "Database" → "PostgreSQL"
2. Wait for provisioning (~2min)
3. ✅ URL automatically generated: ${{Postgres.DATABASE_URL}}
```

#### **3.2 Redis Cache**  
```bash
# In Railway Dashboard:
1. "Add Service" → "Database" → "Redis"
2. Wait for provisioning (~1min)
3. ✅ URL automatically generated: ${{Redis.REDIS_URL}}
```

#### **3.3 Backend Service**
```bash
# In Railway Dashboard:
1. "Add Service" → "GitHub Repo"
2. Root Directory: /backend
3. Start Command: npm start
4. Build Command: npm run build
```

---

## ⚙️ **TECHNICAL CONFIGURATIONS**

### **Optimized Dockerfile**
```dockerfile
# Multi-stage build for production
FROM node:18-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runtime
WORKDIR /app
RUN addgroup --gid 1001 nodejs
RUN adduser --uid 1001 --gid 1001 --disabled-password nestjs

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

USER nestjs
EXPOSE 3001

CMD ["npm", "start"]
```

### **Production package.json**
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.js",
    "start:prod": "node dist/main.js"
  },
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "typescript": "^5.1.3"
  }
}
```

### **Environment Variables**
```env
# Railway Variables (Raw Editor)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://beuni-frontend-one.vercel.app
NODE_ENV=production
PORT=${{PORT}}
RATE_LIMIT_LOGIN=5
RATE_LIMIT_CEP=30
VIACEP_API_URL=https://viacep.com.br/ws
```

---

## 🔄 **DEPLOYMENT PROCESS**

### **Automatic Deployment**
```bash
# After configuration, Railway automatically:
1. Detects changes in GitHub
2. Builds Docker image
3. Runs database migrations
4. Deploys to production
5. Configures health checks
```

### **Manual Deployment**
```bash
# Using Railway CLI
railway login
railway link
railway up
```

---

## 🔧 **DATABASE MANAGEMENT**

### **Run Migrations**
```bash
# Connect via SSH and run migrations
railway ssh "npx prisma migrate deploy"

# Generate Prisma client
railway ssh "npx prisma generate"

# Seed database (if needed)
railway ssh "npx prisma db seed"
```

### **Database Studio Access**
```bash
# Open Prisma Studio in production
railway ssh "npx prisma studio"
```

---

## 🏥 **HEALTH CHECKS**

### **Built-in Health Endpoint**
```
GET https://beuni-desafio-production.up.railway.app/health
```

### **Expected Response**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## 📊 **MONITORING**

### **Railway Metrics**
- CPU usage
- Memory consumption
- Request rate
- Response time
- Error rate

### **Custom Logging**
```typescript
// Winston logger configuration
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
});
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Environment Variables Security**
- ✅ Never commit .env files
- ✅ Use Railway's variable management
- ✅ Rotate JWT secrets regularly
- ✅ Use strong database passwords

### **Network Security**
```typescript
// CORS configuration
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

### **Rate Limiting**
```typescript
// Rate limiting configuration
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  })
);
```

---

## 🐛 **TROUBLESHOOTING**

### **Common Issues**

#### **Database Connection Errors**
```bash
# Check database connection
railway ssh "npx prisma db pull"

# Verify environment variables
railway variables
```

#### **Redis Connection Issues**
```bash
# Test Redis connection
railway ssh "redis-cli -u $REDIS_URL ping"
```

#### **Port Configuration**
```env
# Correct port configuration (no quotes)
PORT=${{PORT}}

# Incorrect (causes string parsing)
PORT="${{PORT}}"
```

#### **Prisma Generation Issues**
```bash
# Regenerate Prisma client
railway ssh "npx prisma generate"

# Reset database (CAUTION: Development only)
railway ssh "npx prisma migrate reset"
```

---

## 📝 **BEST PRACTICES**

### **Deployment Checklist**
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Health checks responding
- [ ] Logs are structured and informative
- [ ] Error handling implemented
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

### **Performance Optimization**
```typescript
// Connection pooling
{
  datasources: {
    db: {
      provider: "postgresql",
      url: env("DATABASE_URL"),
      connectionLimit: 20,
      poolTimeout: 60,
    }
  }
}
```

### **Error Handling**
```typescript
// Global exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    logger.error('Unhandled exception', {
      exception,
      url: request.url,
      method: request.method
    });

    response.status(500).json({
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error'
    });
  }
}
```

---

## 🔄 **BACKUP & RECOVERY**

### **Database Backup**
```bash
# Create database backup
railway ssh "pg_dump $DATABASE_URL > backup.sql"

# Restore from backup
railway ssh "psql $DATABASE_URL < backup.sql"
```

### **Redis Backup**
```bash
# Redis persistence is handled automatically by Railway
# Data is persisted to disk and backed up regularly
```

---

## 📚 **ADDITIONAL RESOURCES**

- [Railway Documentation](https://docs.railway.app/)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Last Updated**: October 4, 2025  
**Maintained By**: Development Team  
**Status**: Production Ready
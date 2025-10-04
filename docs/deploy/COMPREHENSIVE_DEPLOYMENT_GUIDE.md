# 🚀 Comprehensive Deployment Guide - Beuni Platform

> **Last Updated**: October 4, 2025  
> **Status**: Production Ready  
> **Environments**: Development, Staging, Production

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Environment Variables](#-environment-variables)
3. [Railway Backend Deployment](#-railway-backend-deployment)
4. [Vercel Frontend Deployment](#-vercel-frontend-deployment)
5. [Docker Deployment](#-docker-deployment)
6. [Production Checklist](#-production-checklist)
7. [Monitoring & Health Checks](#-monitoring--health-checks)
8. [Troubleshooting](#-troubleshooting)
9. [Backup & Recovery](#-backup--recovery)
10. [Security Best Practices](#-security-best-practices)

---

## 🎯 Quick Start

### Prerequisites

- **Node.js**: 18.x or higher
- **Docker**: 20.10+ and Docker Compose (for local development)
- **PostgreSQL**: 15+ (if not using managed service)
- **Redis**: 7+ (if not using managed service)
- **Railway CLI**: For backend deployment
- **Vercel CLI**: For frontend deployment

### Production URLs

- 🌐 **Frontend**: https://beuni-frontend-one.vercel.app
- ⚡ **Backend API**: https://beuni-desafio-production-41c7.up.railway.app
- 📚 **API Docs**: https://beuni-desafio-production-41c7.up.railway.app/api/docs
- 🏥 **Health Check**: https://beuni-desafio-production-41c7.up.railway.app/health

### Architecture Overview

```
┌─────────────────┐
│   Vercel        │
│   (Next.js)     │
│   Frontend      │
└────────┬────────┘
         │
         │ /api/* rewrites
         │
         ▼
┌─────────────────┐      ┌─────────────┐      ┌─────────────┐
│   Railway       │─────▶│ PostgreSQL  │      │   Redis     │
│   (NestJS)      │      │  Database   │      │   Cache     │
│   Backend       │◀─────┤             │◀────▶│             │
└─────────────────┘      └─────────────┘      └─────────────┘
```

---

## 🌍 Environment Variables

### Backend Environment Variables (Railway)

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:***@postgres.railway.internal:5432/railway` | PostgreSQL connection |
| `REDIS_URL` | `redis://default:***@redis.railway.internal:6379` | Redis connection |
| `JWT_SECRET` | `[production-grade-secret]` | JWT authentication secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3001` | Application port |
| `CORS_ORIGIN` | `https://beuni-frontend-one.vercel.app` | Allowed CORS origins |
| `FRONTEND_URL` | `https://beuni-frontend-one.vercel.app` | Frontend URL fallback |
| `RAILWAY_PUBLIC_DOMAIN` | `https://beuni-desafio-production-41c7.up.railway.app` | Public domain |
| `RATE_LIMIT_LOGIN` | `5` | Login rate limit (per minute) |
| `RATE_LIMIT_CEP` | `30` | CEP API rate limit (per minute) |
| `VIACEP_API_URL` | `https://viacep.com.br/ws` | External CEP API |

### Frontend Environment Variables (Vercel)

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://beuni-desafio-production-41c7.up.railway.app` | Backend API URL |
| `NEXT_PUBLIC_API_TIMEOUT` | `10000` | API timeout (ms) |
| `NEXT_PUBLIC_APP_NAME` | `Beuni Birthday Platform` | Application name |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Application version |
| `NEXT_PUBLIC_APP_DESCRIPTION` | `Corporate Birthday Management Platform` | App description |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `false` | Analytics feature flag |
| `NEXT_PUBLIC_ENABLE_DEBUG` | `false` | Debug mode flag |
| `NEXT_PUBLIC_DEV_MODE` | `false` | Development mode flag |
| `NODE_ENV` | `production` | Environment mode |

---

## 🚂 Railway Backend Deployment

### Step 1: Setup Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to existing project
cd backend
railway link --project ample-sparkle --service beuni-desafio
```

### Step 2: Verify Project Services

Your Railway project should have these services:
- ✅ `beuni-desafio` (NestJS Backend)
- ✅ `Postgres` (PostgreSQL Database) 
- ✅ `Redis` (Redis Cache)

```bash
# Check service status
railway status

# View configured variables
railway variables
```

### Step 3: Deploy Backend

```bash
# Deploy from local code
railway up

# Or redeploy current deployment
railway redeploy --yes

# View deployment logs
railway logs
```

### Step 4: Verify Backend Health

```bash
# Test health endpoint
curl https://beuni-desafio-production-41c7.up.railway.app/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "uptime": 123.45,
#   "environment": "production", 
#   "version": "1.0.0",
#   "services": {
#     "database": "connected",
#     "redis": "connected"
#   }
# }
```

---

## 🌐 Vercel Frontend Deployment

### Step 1: Setup Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to existing project
cd frontend
vercel link
```

**Select:**
- **Scope**: zer0spin
- **Project**: beuni-frontend-one

### Step 2: Configure Environment Variables

**Method A: Via Vercel Dashboard**

1. Go to: https://vercel.com/zer0spin/beuni-frontend-one/settings/environment-variables
2. Add each variable for **Production**, **Preview**, and **Development**

**Method B: Via Vercel CLI**

```bash
cd frontend

# Add API configuration
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://beuni-desafio-production-41c7.up.railway.app

vercel env add NEXT_PUBLIC_API_TIMEOUT production
# Enter: 10000

vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: Beuni Birthday Platform

vercel env add NEXT_PUBLIC_ENABLE_DEBUG production
# Enter: false

# Add remaining variables...
```

### Step 3: Verify Configuration Files

**frontend/vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/api/auth/:path*",
      "destination": "https://beuni-desafio-production-41c7.up.railway.app/auth/:path*"
    },
    {
      "source": "/api/colaboradores/:path*", 
      "destination": "https://beuni-desafio-production-41c7.up.railway.app/colaboradores/:path*"
    },
    {
      "source": "/api/cep/:path*",
      "destination": "https://beuni-desafio-production-41c7.up.railway.app/cep/:path*"
    },
    {
      "source": "/api/envio-brindes/:path*",
      "destination": "https://beuni-desafio-production-41c7.up.railway.app/envio-brindes/:path*"
    }
  ]
}
```

**frontend/next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'beuni-desafio-production-41c7.up.railway.app',
      'beuni-frontend-one.vercel.app',
    ],
  },
  // Other configurations...
}
```

### Step 4: Deploy Frontend

```bash
cd frontend

# Deploy to production
vercel --prod

# Or force new deployment
vercel --prod --force
```

### Step 5: Verify Frontend Deployment

1. **Home Page**: https://beuni-frontend-one.vercel.app
2. **Login Page**: https://beuni-frontend-one.vercel.app/login
3. **API Health** (via rewrite): https://beuni-frontend-one.vercel.app/api/health

---

## 🐳 Docker Deployment

### Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: beuni_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/beuni_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ✅ Production Checklist

### Pre-Deployment

- [ ] **Environment Variables**: All secrets properly configured
- [ ] **Database Migrations**: Applied and tested
- [ ] **SSL/TLS**: HTTPS certificates configured
- [ ] **CORS**: Production domains whitelisted
- [ ] **Rate Limiting**: Configured for production traffic
- [ ] **Logging**: Centralized logging configured
- [ ] **Monitoring**: Health checks and alerts active
- [ ] **Backups**: Database backup strategy in place
- [ ] **Security Headers**: Helmet.js configured

### Post-Deployment

- [ ] **Health Checks**: All endpoints responding correctly
- [ ] **Authentication**: Login/logout working
- [ ] **Image Loading**: Profile images displaying
- [ ] **API Calls**: All frontend-backend communication working
- [ ] **Error Handling**: Graceful error responses
- [ ] **Performance**: Acceptable response times
- [ ] **Security**: HTTPS enforced, headers present

---

## 🏥 Monitoring & Health Checks

### Health Check Endpoints

```bash
# Backend health
curl https://beuni-desafio-production-41c7.up.railway.app/health

# Via frontend rewrite
curl https://beuni-frontend-one.vercel.app/api/health
```

### Expected Health Response

```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T02:00:00Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Monitoring Services

- **Railway**: Built-in metrics and logs
- **Vercel**: Analytics and deployment logs
- **Error Tracking**: Console logs and error boundaries

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Application not found" or 404 on API calls

**Cause**: Vercel rewrites pointing to wrong Railway URL

**Solution**:
```bash
# Update frontend/vercel.json with correct Railway URL
# Commit changes and redeploy
cd frontend
vercel --prod
```

#### 2. Images return 400 errors

**Cause**: Image domains not configured in Next.js

**Solution**:
```bash
# Update frontend/next.config.js
# Add Railway and Vercel domains to images.domains
# Commit and redeploy
```

#### 3. Login returns 500 errors

**Cause**: Database connection or JWT issues

**Solution**:
```bash
# Check Railway logs
railway logs

# Verify database variables
railway variables | grep DATABASE

# Test database connection
railway run npx prisma migrate deploy
```

#### 4. CORS errors in browser

**Cause**: Backend CORS not allowing frontend domain

**Solution**:
```bash
# Check Railway CORS configuration
railway variables | grep CORS

# Update if needed
railway variables --set "CORS_ORIGIN=https://beuni-frontend-one.vercel.app"
railway redeploy --yes
```

### Debug Commands

```bash
# Railway logs
railway logs --tail

# Vercel logs  
vercel logs

# Check environment variables
railway variables
vercel env ls

# Force redeploy
railway redeploy --yes
vercel --prod --force
```

---

## 💾 Backup & Recovery

### Database Backup

```bash
# Connect to Railway database
railway connect postgres

# Create backup (from Railway CLI)
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
railway run psql $DATABASE_URL < backup_20251004.sql
```

### Configuration Backup

```bash
# Backup Railway variables
railway variables > railway_vars.txt

# Backup Vercel variables
vercel env ls > vercel_vars.txt
```

---

## 🛡️ Security Best Practices

### Production Security Features

- ✅ **Helmet.js**: Security headers configured
- ✅ **CSRF Protection**: Cross-site request forgery guard
- ✅ **Rate Limiting**: Login and API endpoints throttled
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **CORS Whitelist**: Strict origin control
- ✅ **Input Validation**: Class-validator with strict mode
- ✅ **HTTPS Only**: SSL/TLS enforced
- ✅ **Environment Secrets**: Secure variable management

### Security Checklist

- [ ] **Strong JWT Secret**: Cryptographically secure random string
- [ ] **Environment Variables**: Never commit secrets to Git
- [ ] **CORS Configuration**: Only production domains allowed
- [ ] **Rate Limiting**: Enabled for sensitive endpoints
- [ ] **SQL Injection Protection**: Using Prisma ORM
- [ ] **XSS Protection**: React auto-escaping + CSP headers
- [ ] **Dependencies**: Regularly updated and audited
- [ ] **Log Sanitization**: Sensitive data removed from logs

---

## 🚀 Quick Deploy Commands

```bash
# Full deployment pipeline
cd backend
railway link --project ample-sparkle --service beuni-desafio
railway up

cd ../frontend  
vercel link
vercel --prod

# Verify deployment
curl https://beuni-desafio-production-41c7.up.railway.app/health
curl https://beuni-frontend-one.vercel.app/api/health
```

---

## 📚 Additional Resources

- [Railway Dashboard](https://railway.com/project/bd3d222c-0253-4dfa-bf53-a9add3ea34bc)
- [Vercel Dashboard](https://vercel.com/zer0spin/beuni-frontend-one)
- [API Documentation](../API.md)
- [Architecture Documentation](../ARCHITECTURE.md)
- [Security Documentation](../security/SECURITY.md)

---

## 📝 Deployment Log

### Latest Deployments

| Date | Component | Version | Status | Notes |
|------|-----------|---------|--------|-------|
| 2025-10-04 | Backend | v1.0.0 | ✅ Active | Production deployment with full feature set |
| 2025-10-04 | Frontend | v1.0.0 | ✅ Active | Vercel deployment with proper rewrites |
| 2025-10-03 | Database | v1.0.0 | ✅ Active | PostgreSQL with all migrations applied |

### Known Issues

- None currently identified ✅

### Scheduled Maintenance

- Monthly dependency updates
- Quarterly security audits
- Weekly backup verification

---

**Last Updated**: October 4, 2025  
**Maintained By**: DevOps Team  
**Status**: ✅ Production Ready
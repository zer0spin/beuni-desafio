# 🚀 Deployment Guide - Beuni Platform

## 📋 Overview

This guide covers deploying the Beuni Birthday Management Platform to production using:
- **Backend**: Railway (NestJS + PostgreSQL + Redis)
- **Frontend**: Vercel (Next.js)

## 🔧 Prerequisites

- Git repository access
- Railway account with CLI installed
- Vercel account with CLI installed
- Node.js 18+ installed locally

## 🏗️ Architecture

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

## 🚂 Part 1: Railway Backend Deployment

### Step 1: Connect to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
cd backend
railway link --project ample-sparkle --service beuni-desafio
```

### Step 2: Verify Services

Your Railway project should have 3 services:
- ✅ `beuni-desafio` (NestJS Backend)
- ✅ `Postgres` (PostgreSQL Database)
- ✅ `Redis` (Redis Cache)

```bash
# Check service status
railway status
```

### Step 3: Configure Environment Variables

All variables are already configured via CLI. Verify with:

```bash
railway variables
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - Authentication secret
- `JWT_EXPIRES_IN` - Token expiration (7d)
- `NODE_ENV` - production
- `PORT` - 3001
- `CORS_ORIGIN` - Frontend URL
- `FRONTEND_URL` - Fallback frontend URL
- `VIACEP_API_URL` - External API
- `RATE_LIMIT_LOGIN` - Login rate limit
- `RATE_LIMIT_CEP` - CEP rate limit

### Step 4: Deploy Backend

```bash
# Deploy from local code
railway up

# Or redeploy current deployment
railway redeploy --yes
```

### Step 5: Get Public Domain

```bash
# Generate public domain
railway domain
```

**Current Backend URL:** `https://beuni-desafio-production-41c7.up.railway.app`

### Step 6: Verify Deployment

```bash
# Check logs
railway logs

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

## 🌐 Part 2: Vercel Frontend Deployment

### Step 1: Install Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

### Step 2: Link to Vercel Project

```bash
cd frontend
vercel link
```

Select:
- **Scope**: zer0spin
- **Project**: beuni-frontend-one

### Step 3: Configure Environment Variables

**Method 1: Via Vercel Dashboard**

1. Go to: https://vercel.com/zer0spin/beuni-frontend-one/settings/environment-variables

2. Add these variables for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_API_URL=https://beuni-desafio-production-41c7.up.railway.app
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_APP_NAME=Beuni Birthday Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Corporate Birthday Management Platform
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
NODE_ENV=production
NEXT_PUBLIC_DEV_MODE=false
```

**Method 2: Via Vercel CLI**

```bash
cd frontend

# Add each variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://beuni-desafio-production-41c7.up.railway.app

vercel env add NEXT_PUBLIC_API_TIMEOUT production
# Enter: 10000

vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: Beuni Birthday Platform

vercel env add NEXT_PUBLIC_ENABLE_DEBUG production
# Enter: false

# ... repeat for all variables
```

### Step 4: Verify Configuration Files

**Check `frontend/vercel.json`:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://beuni-desafio-production-41c7.up.railway.app/:path*"
    }
  ]
}
```

**Check `frontend/next.config.js`:**
```javascript
images: {
  domains: [
    'localhost',
    'beuni-desafio-production-41c7.up.railway.app',
    'beuni-frontend-one.vercel.app',
  ],
}
```

### Step 5: Deploy Frontend

```bash
cd frontend

# Deploy to production
vercel --prod

# Follow the prompts
```

### Step 6: Verify Deployment

**Current Frontend URL:** `https://beuni-frontend-one.vercel.app`

Test the following:

1. **Home Page**: https://beuni-frontend-one.vercel.app
2. **Login Page**: https://beuni-frontend-one.vercel.app/login
3. **API Health** (via rewrite): https://beuni-frontend-one.vercel.app/api/health

## ✅ Post-Deployment Verification

### Backend Health Check

```bash
# Direct Railway URL
curl https://beuni-desafio-production-41c7.up.railway.app/health

# Via Vercel rewrite
curl https://beuni-frontend-one.vercel.app/api/health
```

### Frontend Functionality

1. **Login Test**:
   - Go to: https://beuni-frontend-one.vercel.app/login
   - Open browser DevTools → Network tab
   - Attempt login with test credentials
   - Verify API call goes to: `/api/auth/login` (200 OK)

2. **Image Loading**:
   - Check that profile images load
   - Verify no 400/404 errors in console

3. **CORS Verification**:
   - Check browser console for CORS errors
   - All API calls should succeed

## 🐛 Troubleshooting

### Issue: "Application not found" or 404 on login

**Cause**: Vercel rewrites pointing to wrong Railway URL

**Solution**:
```bash
# Update frontend/vercel.json with correct Railway URL
# Commit changes
git add frontend/vercel.json
git commit -m "fix: update Railway URL"

# Redeploy
cd frontend
vercel --prod
```

### Issue: Images return 400 errors

**Cause**: Image domains not configured in Next.js

**Solution**:
```bash
# Update frontend/next.config.js
# Add both Railway and Vercel domains to images.domains
# Commit and redeploy
```

### Issue: CORS errors

**Cause**: Backend CORS not allowing Vercel domain

**Solution**:
```bash
# Check Railway environment variables
railway variables

# Verify CORS_ORIGIN includes Vercel URL
# If not, add it:
railway variables --set "CORS_ORIGIN=https://beuni-frontend-one.vercel.app"

# Redeploy backend
railway redeploy --yes
```

### Issue: Environment variables not updating

**Cause**: Variables are baked into the build

**Solution**:
```bash
# After changing env vars in Vercel, trigger new build
vercel --prod --force

# For Railway
railway redeploy --yes
```

## 📊 Monitoring & Logs

### Backend Logs (Railway)

```bash
# Real-time logs
railway logs

# Filter logs
railway logs | grep ERROR
```

### Frontend Logs (Vercel)

```bash
# Via CLI
vercel logs

# Via Dashboard
https://vercel.com/zer0spin/beuni-frontend-one/deployments
```

## 🔐 Security Checklist

- ✅ JWT_SECRET is strong and unique
- ✅ CORS is properly configured
- ✅ Rate limiting is enabled
- ✅ HTTPS only (no HTTP)
- ✅ Security headers configured
- ✅ Environment variables not exposed
- ✅ Database uses secure connection
- ✅ Redis uses authentication

## 🔗 Important URLs

### Production
- **Frontend**: https://beuni-frontend-one.vercel.app
- **Backend API**: https://beuni-desafio-production-41c7.up.railway.app
- **API Docs**: https://beuni-desafio-production-41c7.up.railway.app/api/docs
- **Health Check**: https://beuni-desafio-production-41c7.up.railway.app/health

### Dashboards
- **Vercel**: https://vercel.com/zer0spin/beuni-frontend-one
- **Railway**: https://railway.com/project/bd3d222c-0253-4dfa-bf53-a9add3ea34bc

## 📚 Additional Documentation

- [Railway Setup Guide](./RAILWAY_SETUP.md)
- [Vercel Environment Variables Guide](./VERCEL_ENV_SETUP.md)
- [API Documentation](./API.md)
- [Architecture Documentation](./ARCHITECTURE.md)

## 🚀 Quick Deploy Commands

```bash
# Full deployment
# Backend (Railway)
cd backend
railway link --project ample-sparkle --service beuni-desafio
railway up

# Frontend (Vercel)
cd ../frontend
vercel --prod

# Verify
curl https://beuni-desafio-production-41c7.up.railway.app/health
curl https://beuni-frontend-one.vercel.app/api/health
```

## 📝 Notes

1. **Always commit changes** before deploying
2. **Test locally** before deploying to production
3. **Check logs** after deployment
4. **Verify health endpoints** after each deployment
5. **Update documentation** when URLs change

---

**Last Updated**: 2025-10-04
**Deployment Status**: ✅ Fully operational

# 🚂 Railway Deployment Configuration

## 📋 Environment Variables Configured

All environment variables have been successfully configured in Railway for the `beuni-desafio` service.

### 🔐 Security & Authentication
- `JWT_SECRET`: Configured (production-grade secret)
- `JWT_EXPIRES_IN`: 7d
- `NODE_ENV`: production

### 🗄️ Database & Cache
- `DATABASE_URL`: `postgresql://postgres:***@postgres.railway.internal:5432/railway`
- `REDIS_URL`: `redis://default:***@redis.railway.internal:6379`

### 🌐 API & CORS
- `PORT`: 3001
- `CORS_ORIGIN`: https://beuni-frontend-one.vercel.app
- `FRONTEND_URL`: https://beuni-frontend-one.vercel.app
- `RAILWAY_PUBLIC_DOMAIN`: https://beuni-desafio-production-41c7.up.railway.app

### 🔒 Rate Limiting
- `RATE_LIMIT_LOGIN`: 5 (requests per minute)
- `RATE_LIMIT_CEP`: 30 (requests per minute)

### 🌍 External APIs
- `VIACEP_API_URL`: https://viacep.com.br/ws

## 🏗️ Infrastructure

### Services
1. **beuni-desafio** (Main Application)
   - NestJS Backend
   - Port: 3001
   - Domain: https://beuni-desafio-production-41c7.up.railway.app

2. **Postgres** (Database)
   - Internal: postgres.railway.internal:5432
   - Database: railway

3. **Redis** (Cache)
   - Internal: redis.railway.internal:6379

## 🔧 CORS Configuration

The application supports multiple origins with fallbacks:

### Allowed Origins
- ✅ `http://localhost:3000` - Local development
- ✅ `https://localhost:3000` - Local HTTPS development
- ✅ `https://beuni-frontend-one.vercel.app` - Production frontend
- ✅ `https://beuni-frontend-*.vercel.app` - Preview deployments
- ✅ `https://*.beuni.app` - Custom domain pattern
- ✅ `https://*.railway.app` - Railway domains
- ✅ Environment-based origins from `CORS_ORIGIN`
- ✅ Fallback from `FRONTEND_URL`

### CORS Features
- ✅ Credentials support
- ✅ Common HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS)
- ✅ Secure headers (Authorization, X-CSRF-Token)
- ✅ 1-hour preflight cache

## 🏥 Health Checks

### Endpoints
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Docker Healthcheck
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/health || exit 1
```

## 🚀 Deployment Commands

### Link to Project
```bash
railway link --project ample-sparkle --service beuni-desafio
```

### View Variables
```bash
railway variables
```

### Set Variable
```bash
railway variables --set "KEY=value"
```

### Deploy
```bash
railway up
# or
railway redeploy --yes
```

### View Logs
```bash
railway logs
```

### Check Status
```bash
railway status
```

## 🔗 Service URLs

- **API (Railway)**: https://beuni-desafio-production-41c7.up.railway.app
- **Frontend (Vercel)**: https://beuni-frontend-one.vercel.app
- **API Docs**: https://beuni-desafio-production-41c7.up.railway.app/api/docs

## ✅ Health Status

### PostgreSQL
- ✅ Connection: Configured
- ✅ Internal URL: postgres.railway.internal:5432
- ✅ Database: railway

### Redis
- ✅ Connection: Configured
- ✅ Internal URL: redis.railway.internal:6379
- ✅ Password: Configured

### Application
- ✅ Environment variables: All set
- ✅ CORS: Configured with fallbacks
- ✅ Health checks: Implemented
- ✅ Rate limiting: Configured

## 🛡️ Security Features

1. **Helmet.js** - Security headers
2. **CSRF Protection** - Cross-site request forgery guard
3. **Rate Limiting** - Throttling for login and CEP endpoints
4. **JWT Authentication** - Secure token-based auth
5. **CORS Whitelist** - Strict origin control
6. **Input Validation** - Class-validator with strict mode
7. **Production Mode** - Error messages hidden in production

## 🔄 Fallback Strategy

The application implements multiple fallback mechanisms:

1. **CORS Origins**
   - Primary: CORS_ORIGIN environment variable
   - Fallback: FRONTEND_URL environment variable
   - Default: Hardcoded production URLs + regex patterns

2. **Port**
   - Primary: PORT environment variable
   - Fallback: 3001

3. **Environment**
   - Primary: NODE_ENV environment variable
   - Fallback: 'development'

## 📝 Next Steps

1. ✅ All environment variables configured
2. ✅ Database connection established
3. ✅ Redis connection established
4. ✅ CORS configured with fallbacks
5. ✅ Health checks implemented
6. 🔄 Deployment in progress

Monitor the deployment at:
https://railway.com/project/bd3d222c-0253-4dfa-bf53-a9add3ea34bc/service/f973c00f-cd31-4b8a-b996-f56ea9004c1b

# 🌐 Beuni Project URLs Reference

## 📍 Environments

### **Production (Railway + Vercel)**

#### Backend (Railway)
- **Public URL**: `https://beuni-desafio-production-41c7.up.railway.app`
- **Internal URL**: `beuni-desafio.railway.internal`
- **Health Check**: `https://beuni-desafio-production-41c7.up.railway.app/health`
- **API Docs**: `https://beuni-desafio-production-41c7.up.railway.app/api/docs`

#### Frontend (Vercel)
- **Production URL**: `https://beuni-frontend-one.vercel.app`
- **API Proxy**: `https://beuni-frontend-one.vercel.app/api/*` → Railway Backend

#### Database (Railway PostgreSQL)
- **Internal URL**: `postgres.railway.internal:5432`
- **Database**: `railway`
- **Schema**: `public`

#### Redis (Railway)
- **Internal URL**: `redis.railway.internal:6379`

---

### **Development (Local)**

#### Backend
- **URL**: `http://localhost:3001`
- **Health Check**: `http://localhost:3001/health`
- **API Docs**: `http://localhost:3001/api/docs`

#### Frontend
- **URL**: `http://localhost:3000`
- **API Proxy**: `http://localhost:3000/api/*` → `http://localhost:3001`

#### Database (Docker Compose)
- **Host**: `postgres:5432` (inside container)
- **Host**: `localhost:5432` (from host)
- **Database**: `beuni_db`
- **User**: `beuni_user`

#### Redis (Docker Compose)
- **Host**: `redis:6379` (inside container)
- **Host**: `localhost:6379` (from host)

---

## 🔗 CORS Configuration

### Backend (`main.ts`)
Accepts requests from:
- `http://localhost:3000` (local dev)
- `https://beuni-frontend-one.vercel.app` (production)
- `/^https:\/\/beuni-frontend.*\.vercel\.app$/` (preview deployments)
- `CORS_ORIGIN` variable from Railway

### Frontend Rewrites

#### `next.config.js` (used in dev and build)
```javascript
'/api/:path*' → Railway backend or localhost
```

#### `vercel.json` (used ONLY on Vercel)
```json
'/api/:path*' → 'https://beuni-desafio-production-41c7.up.railway.app/:path*'
```

⚠️ **IMPORTANT**: Vercel uses `vercel.json` rewrites in production, overriding `next.config.js`

---

## 🔐 Environment Variables

### Railway (Backend Production)
```bash
DATABASE_URL=postgresql://postgres:***@postgres.railway.internal:5432/railway
REDIS_URL=redis://default:***@redis.railway.internal:6379
CORS_ORIGIN=https://beuni-frontend-one.vercel.app
FRONTEND_URL=https://beuni-frontend-one.vercel.app
JWT_SECRET=beuni_jwt_secret_key_2024_super_secure_production_railway_v1
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
```

### Vercel (Frontend Production)
```bash
NEXT_PUBLIC_API_URL=https://beuni-desafio-production-41c7.up.railway.app
NODE_ENV=production
NEXT_PUBLIC_DEV_MODE=false
```

---

## 🧪 Testing Connections

### Backend Health Check
```bash
curl https://beuni-desafio-production-41c7.up.railway.app/health
```

### API Login (via Vercel Frontend)
```bash
curl -X POST https://beuni-frontend-one.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beuni.com","senha":"Admin@123"}'
```

### API Login (direct Railway)
```bash
curl -X POST https://beuni-desafio-production-41c7.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beuni.com","senha":"Admin@123"}'
```

---

## 📝 Important Notes

1. **Vercel Rewrites**: `vercel.json` OVERRIDES `next.config.js` in production
2. **CORS**: Backend accepts requests from configured Vercel domain
3. **Database**: Railway uses internal URL `postgres.railway.internal` in production
4. **Redis**: Railway uses internal URL `redis.railway.internal` in production
5. **JWT**: Different secrets in dev and production environments
6. **Ports**: Backend always uses port 3001

---

## 🔧 Troubleshooting

### 500 Error on Login
- ✅ Check if `CORS_ORIGIN` in Railway includes Vercel domain
- ✅ Verify `DATABASE_URL` is correct in Railway
- ✅ Check logs: `railway logs`

### CORS Errors
- ✅ Check `main.ts` allowedOrigins
- ✅ Verify `CORS_ORIGIN` variable in Railway
- ✅ Ensure frontend is using correct domain

### Migration Deploy Fails
- ❌ DO NOT use local `.env` for Railway migrations
- ✅ Use Railway CLI: `railway run npx prisma migrate deploy`
- ✅ Verify `DATABASE_URL` in Railway dashboard

---

**Last Updated**: October 4, 2025  
**URLs Verified**: ✅ All confirmed working
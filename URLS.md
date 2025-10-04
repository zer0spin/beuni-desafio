# 🌐 URLs do Projeto Beuni

## 📍 Ambientes

### **Production (Railway + Vercel)**

#### Backend (Railway)
- **URL Pública**: `https://beuni-desafio-production-41c7.up.railway.app`
- **URL Interna**: `beuni-desafio.railway.internal`
- **Health Check**: `https://beuni-desafio-production-41c7.up.railway.app/health`
- **API Docs**: `https://beuni-desafio-production-41c7.up.railway.app/api/docs`

#### Frontend (Vercel)
- **URL Production**: `https://beuni-frontend-one.vercel.app`
- **API Proxy**: `https://beuni-frontend-one.vercel.app/api/*` → Railway Backend

#### Database (Railway PostgreSQL)
- **URL Interna**: `postgres.railway.internal:5432`
- **Database**: `railway`
- **Schema**: `public`

#### Redis (Railway)
- **URL Interna**: `redis.railway.internal:6379`

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
- **Host**: `postgres:5432` (dentro do container)
- **Host**: `localhost:5432` (do host)
- **Database**: `beuni_db`
- **User**: `beuni_user`

#### Redis (Docker Compose)
- **Host**: `redis:6379` (dentro do container)
- **Host**: `localhost:6379` (do host)

---

## 🔗 CORS Configuration

### Backend (`main.ts`)
Aceita requisições de:
- `http://localhost:3000` (dev local)
- `https://beuni-frontend-one.vercel.app` (production)
- `/^https:\/\/beuni-frontend.*\.vercel\.app$/` (preview deployments)
- Variável `CORS_ORIGIN` do Railway

### Frontend Rewrites

#### `next.config.js` (usado em dev e build)
```javascript
'/api/:path*' → backend Railway ou localhost
```

#### `vercel.json` (usado APENAS na Vercel)
```json
'/api/:path*' → 'https://beuni-desafio-production-41c7.up.railway.app/:path*'
```

⚠️ **IMPORTANTE**: Vercel usa `vercel.json` rewrites em produção, sobrepondo `next.config.js`

---

## 🔐 Variáveis de Ambiente

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

## 🧪 Testando as Conexões

### Health Check Backend
```bash
curl https://beuni-desafio-production-41c7.up.railway.app/health
```

### Login na API (via Frontend Vercel)
```bash
curl -X POST https://beuni-frontend-one.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beuni.com","senha":"Admin@123"}'
```

### Login na API (direto no Railway)
```bash
curl -X POST https://beuni-desafio-production-41c7.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beuni.com","senha":"Admin@123"}'
```

---

## 📝 Notas Importantes

1. **Rewrites na Vercel**: O `vercel.json` SOBREPÕE `next.config.js` em produção
2. **CORS**: Backend aceita requisições do domínio Vercel configurado
3. **Database**: Railway usa URL interna `postgres.railway.internal` em produção
4. **Redis**: Railway usa URL interna `redis.railway.internal` em produção
5. **JWT**: Secrets diferentes em dev e production
6. **Ports**: Backend sempre usa porta 3001

---

## 🔧 Troubleshooting

### Erro 500 no login
- ✅ Verificar se `CORS_ORIGIN` no Railway inclui domínio Vercel
- ✅ Verificar se `DATABASE_URL` está correto no Railway
- ✅ Verificar logs: `railway logs`

### Erro de CORS
- ✅ Verificar `main.ts` allowedOrigins
- ✅ Verificar variável `CORS_ORIGIN` no Railway
- ✅ Verificar se frontend está usando domínio correto

### Migrate Deploy falha
- ❌ NÃO usar `.env` local para migrations no Railway
- ✅ Usar Railway CLI: `railway run npx prisma migrate deploy`
- ✅ Verificar `DATABASE_URL` no Railway dashboard

---

**Última atualização**: 2025-01-04
**URLs corretas confirmadas**: ✅

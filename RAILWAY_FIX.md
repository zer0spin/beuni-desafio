# 🚨 INSTRUÇÕES URGENTES PARA CORREÇÃO DO RAILWAY

## Problema Atual
O build do Railway está falhando com "No start command could be found". 

## ✅ Solução Imediata

### 1. **No Railway Dashboard:**

#### **Backend Service:**
- **Settings → Deploy**
- **Build Command:** `npm install && npx prisma generate && npx nest build`
- **Start Command:** `node dist/main.js`
- **Root Directory:** `backend`

#### **Frontend Service:**
- **Settings → Deploy** 
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Root Directory:** `frontend`

### 2. **Variáveis de Ambiente Backend:**
```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=novo_jwt_secret_de_64_chars_super_secreto_para_producao_123456
```

### 3. **Variáveis de Ambiente Frontend:**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://[seu-backend-service].up.railway.app
```

### 4. **Ordem de Deploy:**
1. PostgreSQL + Redis (Add Service)
2. Backend (Deploy from GitHub)
3. Frontend (Deploy from GitHub)
4. Configurar variáveis
5. Redeploy ambos

### 5. **Validação:**
- Backend: `https://[backend].up.railway.app/health`
- Frontend: `https://[frontend].up.railway.app`

## 🎯 Resultado Esperado:
- Build Success em ~5-10 minutos
- Serviços funcionando separadamente
- Database conectado
- APIs respondendo

**Se persistir erro, usar comandos manuais acima! 🚀**
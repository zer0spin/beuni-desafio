# 🚂 Deploy Backend no Railway - Guia Completo

## 📋 **VISÃO GERAL**

Este guia documenta o processo completo para fazer deploy do backend NestJS no Railway, incluindo configuração de banco de dados PostgreSQL e Redis.

### **Stack Técnica:**
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Database**: PostgreSQL (gerenciado)
- **Cache**: Redis (gerenciado)
- **Deploy**: Railway com CI/CD automático
- **URL**: https://beuni-desafio-production.up.railway.app

---

## 🚀 **PASSO A PASSO - DEPLOY INICIAL**

### **1. Preparação do Repositório**
```bash
# Estrutura necessária:
/beuni-desafio/
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
└── frontend/
```

### **2. Criar Projeto no Railway**
1. **Acesse**: https://railway.app
2. **Login**: "Login with GitHub"
3. **Novo Projeto**: "New Project" → "Deploy from GitHub repo"
4. **Selecionar**: "zer0spin/beuni-desafio"

### **3. Configurar Serviços**

#### **3.1 PostgreSQL Database**
```bash
# No Railway Dashboard:
1. "Add Service" → "Database" → "PostgreSQL"
2. Aguardar provisionamento (~2min)
3. ✅ URL gerada automaticamente: ${{Postgres.DATABASE_URL}}
```

#### **3.2 Redis Cache**  
```bash
# No Railway Dashboard:
1. "Add Service" → "Database" → "Redis"
2. Aguardar provisionamento (~1min)
3. ✅ URL gerada automaticamente: ${{Redis.REDIS_URL}}
```

#### **3.3 Backend Service**
```bash
# No Railway Dashboard:
1. "Add Service" → "GitHub Repo"
2. Root Directory: /backend
3. Start Command: npm start
4. Build Command: npm run build
```

---

## ⚙️ **CONFIGURAÇÕES TÉCNICAS**

### **Dockerfile Otimizado**
```dockerfile
# Multi-stage build para produção
FROM node:18-alpine AS base
RUN apk add --no-cache openssl

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
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

USER nestjs
EXPOSE 3001

CMD ["npm", "start"]
```

### **package.json Produção**
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

### **prisma/schema.prisma**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🔧 **VARIÁVEIS DE AMBIENTE**

### **Configuração no Railway**
```bash
# Service → Variables:
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
NODE_ENV=production
PORT=3001
JWT_SECRET=seu-jwt-secret-aqui
CORS_ORIGIN=https://beuni-frontend.vercel.app
```

### **Arquivo .env.example**
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_URL="redis://host:6379"

# App
NODE_ENV="production"
PORT=3001
JWT_SECRET="your-super-secret-jwt-key"

# CORS
CORS_ORIGIN="https://beuni-frontend.vercel.app"
```

---

## 🔄 **CI/CD AUTOMÁTICO**

### **Configuração GitHub Integration**
```bash
# Automático após conectar repositório:
Git Push → GitHub → Railway Webhook → Build → Deploy
```

### **Build Process**
```bash
1. npm ci                    # Install dependencies
2. npx prisma generate      # Generate Prisma client
3. npm run build            # Compile TypeScript
4. npx prisma db push       # Apply schema changes
5. npm start                # Start application
```

### **Monitoring Build**
```bash
# Railway CLI
railway logs --follow

# Dashboard
https://railway.app/project/[project-id]
```

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS**

### **❌ Erro: "DATABASE_URL resolved to an empty string"**
**Causa**: Variável não referenciando serviço corretamente
**Solução**:
```bash
# Railway CLI:
railway variables --set 'DATABASE_URL=${{Postgres.DATABASE_URL}}'

# Ou via Dashboard:
Variables → DATABASE_URL → ${{Postgres.DATABASE_URL}}
```

### **❌ Erro: "Module not found: typescript"**
**Causa**: TypeScript em devDependencies
**Solução**:
```json
{
  "dependencies": {
    "typescript": "^5.1.3",
    "@types/node": "^20.0.0"
  }
}
```

### **❌ Erro: "Prisma Client not found"**
**Causa**: Cliente não gerado
**Solução**:
```dockerfile
# Adicionar no Dockerfile:
RUN npx prisma generate
```

### **❌ Erro: "CORS policy blocked"**
**Causa**: CORS não configurado para Vercel
**Solução**:
```typescript
// main.ts
app.enableCors({
  origin: [
    'https://beuni-frontend.vercel.app',
    /https:\/\/beuni-frontend-.*\.vercel\.app$/
  ],
  credentials: true
});
```

---

## ✅ **VALIDAÇÃO DO DEPLOY**

### **1. Health Check**
```bash
# Test Backend
curl https://beuni-desafio-production.up.railway.app/health

# Expected: {"message":"🎉 Beuni API está funcionando!"}
```

### **2. Database Connection**
```bash
# Test Database
curl https://beuni-desafio-production.up.railway.app/users

# Expected: JSON array or 401 unauthorized
```

### **3. API Documentation**
```bash
# Swagger UI
https://beuni-desafio-production.up.railway.app/api/docs

# OpenAPI JSON
https://beuni-desafio-production.up.railway.app/api/docs-json
```

### **4. Performance Check**
- **Response Time**: <100ms
- **Memory Usage**: <512MB
- **CPU Usage**: <50%

---

## 📊 **MONITORAMENTO**

### **Railway Metrics**
```bash
# CPU & Memory
Railway Dashboard → Metrics

# Application Logs
Railway Dashboard → Deployments → Logs

# Database Stats
PostgreSQL Service → Metrics
```

### **Custom Monitoring**
```typescript
// health.controller.ts
@Get('health')
async health() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: await this.checkDatabase(),
    redis: await this.checkRedis()
  };
}
```

---

## 🔐 **SEGURANÇA**

### **Environment Variables**
```bash
# Nunca commitar:
- JWT_SECRET
- DATABASE_URL
- REDIS_URL
- API Keys

# Usar Railway Variables
```

### **CORS Configuration**
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});
```

### **Rate Limiting**
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100
    })
  ]
})
```

---

## 🌍 **URLS FINAIS**

### **Produção:**
- **API Base**: https://beuni-desafio-production.up.railway.app
- **Swagger**: https://beuni-desafio-production.up.railway.app/api/docs
- **Health**: https://beuni-desafio-production.up.railway.app/health
- **Dashboard**: https://railway.app/dashboard

---

## 📝 **COMANDOS ÚTEIS**

```bash
# Railway CLI
npm install -g @railway/cli
railway login
railway link [project-id]

# Deploy manual
railway up

# Logs em tempo real
railway logs --follow

# Variables
railway variables
railway variables --set KEY=value

# Database shell
railway connect postgres

# Redis shell  
railway connect redis
```

---

## 🎯 **RESULTADO FINAL**

**✅ Backend Deployado com Sucesso:**
- 🚂 **URL**: https://beuni-desafio-production.up.railway.app
- 🗄️ **Database**: PostgreSQL conectado e funcionando
- ⚡ **Cache**: Redis ativo e responsivo
- 🔄 **CI/CD**: Deploy automático via GitHub
- 📚 **API Docs**: Swagger UI disponível
- 🔒 **Security**: CORS, Rate Limiting, JWT
- 📊 **Monitoring**: Logs e métricas integradas

**PRONTO PARA PRODUÇÃO! 🚀**
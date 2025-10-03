# 🚀 Railway Deployment Guide - Beuni Platform

## 📋 Correções Aplicadas

### ✅ Problema Resolvido: `tsc: not found`

**Causa raiz:**
- O Railway estava usando `npm ci` em modo produção
- O comando `npx tsc` não funcionava porque o TypeScript não estava sendo instalado corretamente

**Solução implementada:**
1. ✅ Mudança de `npx tsc` para `tsc` no build script do backend
2. ✅ TypeScript, ts-node e prisma já estão em `dependencies` (não devDependencies)
3. ✅ Configuração do Railway para usar Dockerfile ao invés de Railpack
4. ✅ Criação de `nixpacks.toml` como fallback (caso prefira usar Railpack)

---

## 🔧 Configuração do Projeto

### Arquivos modificados:

#### 1. `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**⚠️ IMPORTANTE:** O Dockerfile está no **root do repositório** (não em `backend/`), pois o Railway executa o build do diretório raiz. Os paths dentro do Dockerfile foram ajustados para `backend/`.

#### 2. `backend/package.json` - Script de build
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json"
  }
}
```

#### 3. `Dockerfile` (Root do projeto)
```dockerfile
# Railway-optimized Dockerfile for NestJS Backend
# Build from repository root
FROM node:18-alpine AS deps
RUN apk add --no-cache openssl
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci && npm cache clean --force

FROM node:18-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
RUN npx prisma generate && npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY backend/package*.json ./
EXPOSE $PORT
CMD ["node", "dist/main.js"]
```

#### 4. `.dockerignore` (Root do projeto)
```
# Node modules
**/node_modules
**/npm-debug.log

# Build outputs
**/dist
**/.next

# Development & test files
**/.git
**/.env
**/test
**/coverage
**/*.spec.ts
**/*.test.ts

# Frontend (backend build only)
frontend/
```

#### 5. `nixpacks.toml` (Alternativa ao Dockerfile)
```toml
[phases.setup]
nixPkgs = ["nodejs_18"]

[phases.install]
cmds = ["npm ci --include=dev"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "cd backend && node dist/main.js"
```

---

## 🚀 Deploy no Railway

### Opção 1: Deploy com Dockerfile (Recomendado)

1. **Crie um novo projeto no Railway**
   ```bash
   # Via CLI
   railway login
   railway init
   ```

2. **Configure as variáveis de ambiente** no Railway Dashboard:

   #### Backend Service
   ```env
   # Database (Railway PostgreSQL)
   DATABASE_URL=${{Postgres.DATABASE_URL}}

   # Redis (Railway Redis)
   REDIS_URL=${{Redis.REDIS_URL}}

   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_here_change_this
   JWT_EXPIRES_IN=7d

   # Application
   NODE_ENV=production
   PORT=${{PORT}}

   # External APIs
   VIACEP_API_URL=https://viacep.com.br/ws

   # Rate Limiting
   RATE_LIMIT_LOGIN=5
   RATE_LIMIT_CEP=30

   # CORS
   CORS_ORIGIN=https://your-frontend-url.railway.app
   ```

3. **Configure o Root Directory**
   - Settings → Root Directory: `backend`

4. **Configure o comando de start** (opcional, já definido no Dockerfile)
   - Settings → Start Command: `node dist/main.js`

5. **Deploy**
   ```bash
   railway up
   ```

### Opção 2: Deploy com Nixpacks

Se preferir usar Railpack/Nixpacks:

1. Altere o `railway.json`:
   ```json
   {
     "build": {
       "builder": "RAILPACK"
     }
   }
   ```

2. O arquivo `nixpacks.toml` já está configurado

3. Deploy normalmente

---

## 🗄️ Configuração do Banco de Dados

### PostgreSQL no Railway

1. **Adicione o PostgreSQL** ao projeto:
   - New → Database → Add PostgreSQL

2. **Execute as migrations**:
   ```bash
   # Via Railway CLI
   railway run npx prisma migrate deploy

   # Ou configure como Pre-Deploy Command no Railway:
   # Settings → Deploy → Pre-Deploy Command:
   npx prisma migrate deploy
   ```

3. **Gerar Prisma Client** (já incluído no build):
   - O comando `npx prisma generate` é executado automaticamente pelo script `postinstall`

### Redis no Railway

1. **Adicione o Redis** ao projeto:
   - New → Database → Add Redis

2. **Configure a variável** `REDIS_URL`:
   ```
   ${{Redis.REDIS_URL}}
   ```

---

## 📦 Estrutura de Serviços Recomendada

### 3 Serviços no Railway:

1. **Backend API** (NestJS)
   - Root Directory: `backend`
   - Dockerfile: `backend/Dockerfile`
   - Port: Definido automaticamente pelo Railway

2. **PostgreSQL**
   - Banco de dados gerenciado pelo Railway
   - Backup automático

3. **Redis**
   - Cache gerenciado pelo Railway
   - Persistência opcional

### Opcional: Frontend (Next.js)

4. **Frontend**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

---

## 🔍 Checklist de Deploy

- [ ] TypeScript instalado em `dependencies` (não devDependencies)
- [ ] Prisma instalado em `dependencies`
- [ ] Dockerfile otimizado para Railway
- [ ] Variáveis de ambiente configuradas
- [ ] DATABASE_URL conectado ao PostgreSQL do Railway
- [ ] REDIS_URL conectado ao Redis do Railway
- [ ] JWT_SECRET configurado com valor seguro
- [ ] CORS_ORIGIN configurado com URL do frontend
- [ ] Port definido como `${{PORT}}`
- [ ] Migrations executadas via Pre-Deploy Command

---

## 🐛 Troubleshooting

### Erro: `tsc: not found`
✅ **Resolvido** - TypeScript agora está em `dependencies` e o build usa Dockerfile

**Solução aplicada:**
- Mudança de `npx tsc` para `tsc` no build script
- TypeScript em `dependencies` (não devDependencies)
- Build via Dockerfile multi-stage

### Erro: `/prisma: not found` no Docker
✅ **Resolvido** - Dockerfile movido para root do repositório

**Causa:**
- Railway executa o build do diretório raiz
- Dockerfile em `backend/` não conseguia acessar arquivos corretamente

**Solução aplicada:**
- Dockerfile movido para root do repositório
- Paths ajustados para `backend/package.json`, `backend/prisma/`, etc.
- `.dockerignore` criado para otimizar build

### Erro: `Prisma Client not generated`
```bash
# Adicione ao Pre-Deploy Command no Railway:
npx prisma generate && npx prisma migrate deploy
```

### Erro: `npm warn config production`
✅ **Resolvido** - Usando Dockerfile que faz `npm ci` sem flags problemáticas

### Erro: Database connection failed
```bash
# Verifique se DATABASE_URL está correta:
railway variables

# Teste a conexão:
railway run npx prisma db push
```

### Build muito lento
- ✅ Cache do Docker já configurado (multi-stage build)
- ✅ `.dockerignore` criado para excluir arquivos desnecessários
- Layer caching otimizado: dependencies → build → runtime

---

## 📊 Monitoramento

### Logs
```bash
# Via CLI
railway logs

# Via Dashboard
Deployments → Select Deployment → View Logs
```

### Métricas
- CPU Usage
- Memory Usage
- Network I/O
- Request Count

Acesse em: Railway Dashboard → Metrics

---

## 🔐 Segurança

### Variáveis de Ambiente Sensíveis

⚠️ **NUNCA commite** no repositório:
- JWT_SECRET
- DATABASE_URL (com credenciais)
- REDIS_URL (com credenciais)

✅ Configure apenas no Railway Dashboard

### CORS

Configure corretamente para produção:
```env
CORS_ORIGIN=https://your-frontend.railway.app
```

---

## 🚀 Pipeline de Deploy

### Automático via GitHub

1. Conecte o repositório GitHub no Railway
2. Configure auto-deploy no branch `main`
3. Cada push dispara novo deploy automaticamente

### Manual via CLI

```bash
# Deploy específico
railway up

# Deploy com logs
railway up --detach=false
```

---

## 📚 Referências

- [Railway Documentation](https://docs.railway.com/)
- [Railway NestJS Guide](https://docs.railway.com/guides/nest)
- [Railway Build Configuration](https://docs.railway.com/guides/build-configuration)
- [Railway Dockerfiles](https://docs.railway.com/guides/dockerfiles)
- [Nixpacks](https://nixpacks.com/)

---

## ✅ Resultado Esperado

Após seguir este guia:
- ✅ Build bem-sucedido sem erros de TypeScript
- ✅ Backend rodando em produção
- ✅ Banco de dados PostgreSQL conectado
- ✅ Redis funcionando para cache
- ✅ Migrations aplicadas automaticamente
- ✅ API acessível via URL do Railway

---

**💡 Dica:** A VPN pode sim causar problemas de conexão durante o deploy. Se encontrar timeouts, tente desabilitar temporariamente.

**🎯 Próximos Passos:**
1. Configure o frontend (se necessário)
2. Configure domínio customizado
3. Configure SSL/TLS (automático no Railway)
4. Configure monitoring e alertas

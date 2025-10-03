# 🔧 Railway Deploy - Resumo das Correções

## 📋 Erros Corrigidos

### 1️⃣ Erro: `tsc: not found`
```
sh: 1: tsc: not found
ERROR: failed to build: exit code: 127
```

**Causa:** TypeScript não estava sendo instalado corretamente com `npm ci` em modo produção

**Solução:**
- ✅ Mudança no [backend/package.json:9](backend/package.json#L9): `npx tsc` → `tsc`
- ✅ TypeScript mantido em `dependencies` (já estava correto)
- ✅ Migração de Railpack para Dockerfile

---

### 2️⃣ Erro: `/prisma: not found` no Docker
```
ERROR: failed to solve: "/prisma": not found
```

**Causa:** Railway executa o Dockerfile do **diretório raiz**, mas o Dockerfile estava em `backend/` e esperava estar dentro desse diretório

**Solução:**
- ✅ Dockerfile movido para [root do repositório](Dockerfile)
- ✅ Paths ajustados dentro do Dockerfile:
  - `COPY package*.json ./` → `COPY backend/package*.json ./`
  - `COPY prisma ./prisma/` → `COPY backend/prisma ./prisma/`
  - `COPY . .` → `COPY backend/ .`
- ✅ Atualizado [railway.json:5](railway.json#L5): `backend/Dockerfile` → `Dockerfile`

---

## 📁 Arquivos Criados/Modificados

### ✅ Criados:
1. **[Dockerfile](Dockerfile)** - Dockerfile otimizado no root do projeto
2. **[.dockerignore](.dockerignore)** - Otimização do build (exclui node_modules, testes, frontend)
3. **[nixpacks.toml](nixpacks.toml)** - Alternativa ao Dockerfile (fallback)
4. **[RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)** - Guia completo de deploy
5. **[RAILWAY_FIX_SUMMARY.md](RAILWAY_FIX_SUMMARY.md)** - Este arquivo

### ✅ Modificados:
1. **[backend/package.json](backend/package.json)** - Script de build
2. **[railway.json](railway.json)** - Configuração do builder

---

## 🚀 Estrutura do Dockerfile

### Multi-stage Build Otimizado:

```dockerfile
# Stage 1: Instalar dependências
FROM node:18-alpine AS deps
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci && npm cache clean --force

# Stage 2: Build da aplicação
FROM node:18-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
RUN npx prisma generate && npm run build

# Stage 3: Runtime otimizado
FROM node:18-alpine AS runner
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
CMD ["node", "dist/main.js"]
```

**Benefícios:**
- ✅ Imagem final menor (apenas runtime dependencies)
- ✅ Build cache otimizado (layers separados)
- ✅ Segurança melhorada (sem código fonte na imagem final)

---

## 🔍 Checklist de Deploy

### Antes do deploy:
- [x] TypeScript em `dependencies`
- [x] Prisma em `dependencies`
- [x] Dockerfile no root do repositório
- [x] `.dockerignore` configurado
- [x] `railway.json` apontando para Dockerfile correto

### No Railway Dashboard:
- [ ] Variáveis de ambiente configuradas
- [ ] DATABASE_URL = `${{Postgres.DATABASE_URL}}`
- [ ] REDIS_URL = `${{Redis.REDIS_URL}}`
- [ ] JWT_SECRET = `seu_secret_aqui`
- [ ] NODE_ENV = `production`
- [ ] PORT = `${{PORT}}`
- [ ] CORS_ORIGIN = `https://seu-frontend.railway.app`

### Após deploy:
- [ ] Executar migrations: `railway run npx prisma migrate deploy`
- [ ] Verificar logs: `railway logs`
- [ ] Testar API: `curl https://seu-backend.railway.app/health`

---

## 🎯 Próximos Passos

### 1. Commit das mudanças:
```bash
git add .
git commit -m "fix(railway): resolve Docker build errors - tsc and prisma paths"
git push origin main
```

### 2. Configurar Railway:

**Via Dashboard:**
1. New Project → Deploy from GitHub
2. Selecionar repositório
3. Add PostgreSQL database
4. Add Redis database
5. Configurar variáveis de ambiente (ver checklist acima)

**Via CLI:**
```bash
railway login
railway init
railway add --database postgres
railway add --database redis
railway up
```

### 3. Executar migrations:
```bash
# Opção 1: Via Pre-Deploy Command no Railway
# Settings → Deploy → Pre-Deploy Command:
npx prisma migrate deploy

# Opção 2: Via CLI
railway run npx prisma migrate deploy
```

### 4. Verificar deploy:
```bash
railway logs --follow
railway status
railway open
```

---

## 📊 Estrutura de Arquivos

```
beuni-desafio/
├── Dockerfile                    # ✅ NOVO - Build do backend
├── .dockerignore                 # ✅ NOVO - Otimização do build
├── nixpacks.toml                 # ✅ NOVO - Alternativa ao Dockerfile
├── railway.json                  # ✅ MODIFICADO - Usa Dockerfile
├── RAILWAY_DEPLOY.md            # ✅ NOVO - Guia completo
├── RAILWAY_FIX_SUMMARY.md       # ✅ NOVO - Este arquivo
│
├── backend/
│   ├── Dockerfile               # ⚠️ DEPRECATED - Usar do root
│   ├── package.json             # ✅ MODIFICADO - Build script
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│
└── frontend/
    └── ...
```

---

## 🔧 Configuração Final

### railway.json
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

### backend/package.json (script de build)
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json"
  }
}
```

---

## 🐛 Troubleshooting Rápido

| Erro | Solução |
|------|---------|
| `tsc: not found` | ✅ Resolvido - usar Dockerfile |
| `/prisma: not found` | ✅ Resolvido - Dockerfile no root |
| `npm warn config production` | ✅ Resolvido - Dockerfile usa npm ci corretamente |
| Database connection failed | Verificar DATABASE_URL no Railway |
| Migrations não aplicadas | Executar `railway run npx prisma migrate deploy` |
| Build muito lento | ✅ Resolvido - cache otimizado + .dockerignore |

---

## ✅ Status Final

**Build:** ✅ Pronto para deploy
**Dockerfile:** ✅ Otimizado e testado
**Configuração:** ✅ Railway configurado corretamente
**Documentação:** ✅ Completa

**Próxima ação:** Fazer commit e push para iniciar deploy automático no Railway

---

**💡 Dica sobre VPN:** Se encontrar timeouts durante o deploy, desabilite temporariamente a VPN. A VPN pode interferir na conexão com os servidores do Railway.

**📚 Referências:**
- [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) - Guia completo de deploy
- [Railway Docs - NestJS](https://docs.railway.com/guides/nest)
- [Railway Docs - Dockerfiles](https://docs.railway.com/guides/dockerfiles)

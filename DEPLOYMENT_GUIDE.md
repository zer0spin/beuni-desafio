# 🚀 Guia de Deploy para Produção - Beuni Platform

> **Para Recrutadore### **Passo 3: Deploy Backend (NestJS)**

1. **Add Service → Deploy from GitHub**
2. **Conecte repositório: `seu-usuario/beuni-desafio`**
3. **⚠️ ATENÇÃO: Configurações CRUCIAIS do Serviço Backend:**
   - **Service Name:** `beuni-backend`
   - **Root Directory:** `backend` ⚠️ **OBRIGATÓRIO** (evita build na raiz do monorepo)
   - **Builder:** Railpack (padrão)
   - **Build Command:** (deixe vazio - auto-detecta `npm run build`)
   - **Start Command:** (deixe vazio - auto-detecta `npm run start:prod`)

### **Passo 4: Deploy Frontend (Next.js)**

1. **Add Service → Deploy from GitHub**
2. **Mesmo repositório `beuni-desafio`**
3. **⚠️ ATENÇÃO: Configurações CRUCIAIS do Serviço Frontend:**
   - **Service Name:** `beuni-frontend`
   - **Root Directory:** `frontend` ⚠️ **OBRIGATÓRIO** (evita build na raiz do monorepo)
   - **Builder:** Railpack (padrão)
   - **Build Command:** (deixe vazio - auto-detecta `npm run build`)
   - **Start Command:** (deixe vazio - auto-detecta `npm start`)ece instruções completas para fazer o deploy da plataforma Beuni usando ferramentas 100% gratuitas e simples. O objetivo é permitir que você teste a aplicação em um ambiente de produção real durante o processo seletivo.

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Opções de Deploy](#-opções-de-deploy)
3. [Deploy Simplificado - Railway (Recomendado)](#-deploy-simplificado---railway-recomendado)
4. [Deploy Alternativo - Vercel + Supabase](#-deploy-alternativo---vercel--supabase)
5. [Deploy Completo - Render.com](#-deploy-completo---rendercom)
6. [Configuração de Ambiente](#-configuração-de-ambiente)
7. [Validação do Deploy](#-validação-do-deploy)
8. [Troubleshooting](#-troubleshooting)
9. [Credenciais para Teste](#-credenciais-para-teste)

## 🎯 Visão Geral

A plataforma Beuni é uma aplicação full-stack composta por:
- **Frontend:** Next.js (React + TypeScript)
- **Backend:** NestJS (Node.js + TypeScript)
- **Banco de Dados:** PostgreSQL
- **Cache:** Redis
- **Arquivos:** Upload de imagens

### Arquitetura de Produção
```
Internet → Frontend (Vercel/Railway) → Backend (Railway/Render) → Database (PostgreSQL) + Redis
```

## 🚀 Opções de Deploy

### Comparação de Plataformas

| Plataforma | Frontend | Backend | Database | Redis | Complexidade | Custo |
|------------|----------|---------|----------|-------|--------------|-------|
| **Railway** ⭐ | ✅ | ✅ | ✅ | ✅ | Baixa | Grátis |
| Vercel + Supabase | ✅ | ❌ | ✅ | ❌ | Média | Grátis |
| Render.com | ✅ | ✅ | ✅ | ✅ | Média | Grátis |

### Recomendação: Railway (Mais Simples)
**Por que Railway?**
- ✅ Deploy com 1 comando
- ✅ PostgreSQL e Redis inclusos
- ✅ SSL automático
- ✅ Logs em tempo real
- ✅ Zero configuração

---

## 🚂 Deploy Simplificado - Railway (Recomendado)

### **Pré-requisitos**
- Conta no [Railway.app](https://railway.app) (grátis)
- Conta no GitHub (para conectar o repositório)

### **Passo 1: Preparar o Repositório**

```bash
# 1. Clone o repositório
git clone https://github.com/zer0spin/beuni-desafio.git
cd beuni-desafio

# 2. Criar branch para produção (opcional)
git checkout -b production
git push origin production
```

### **Passo 2: Configurar Railway**

1. **Acesse [Railway.app](https://railway.app)**
2. **Clique em "Login with GitHub"**
3. **Clique em "New Project"**

### **Passo 3: Deploy Backend (NestJS)**

1. **Deploy from GitHub repo**
2. **Selecione o repositório `beuni-desafio`**
3. **Configurações do Serviço Backend:**
   - **Service Name:** `beuni-backend`
   - **Root Directory:** `backend` (CRUCIAL - sem `/`)
   - **Build Command:** (Railway detecta automaticamente `npm run build`)
   - **Start Command:** (Railway detecta automaticamente `npm run start:prod`)

### **Passo 4: Deploy Frontend (Next.js)**

1. **Add Service → Deploy from GitHub**
2. **Mesmo repositório `beuni-desafio`**
3. **Configurações do Serviço Frontend:**
   - **Service Name:** `beuni-frontend`
   - **Root Directory:** `frontend` (CRUCIAL - sem `/`)
   - **Build Command:** (Railway detecta automaticamente `npm run build`)
   - **Start Command:** (Railway detecta automaticamente `npm start`)

### **Passo 5: Adicionar Banco de Dados**

1. **Add Service → Database → PostgreSQL**
2. **Add Service → Database → Redis**

### **Passo 6: Configurar Variáveis de Ambiente**

#### **Backend Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=seu_jwt_secret_super_secreto_de_64_caracteres_aqui_123456
FRONTEND_URL=https://your-frontend-url.up.railway.app
```

#### **Frontend Environment Variables:**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
```

### **Passo 7: Pre-Deploy Command (Backend Only)**

No Railway Dashboard → Backend Service → Settings → Deploy:
- **Pre-Deploy Command:** `npx prisma migrate deploy && npx prisma db seed`

### **Passo 8: Deploy e Validação**

1. **Railway fará o deploy automaticamente**
2. **Aguarde ~10-15 minutos para build completo**
3. **Generate Domain para ambos os serviços**
4. **Verifique os logs em tempo real no dashboard**

---

## ⚡ Deploy Alternativo - Vercel + Supabase

### **Quando usar:**
- Você prefere Vercel para frontend
- Quer usar Supabase como Database-as-a-Service
- Precisa apenas de PostgreSQL (sem Redis)

### **Passo 1: Supabase (Database)**

1. **Acesse [Supabase.com](https://supabase.com)**
2. **Crie conta gratuita**
3. **New Project:**
   - Name: `beuni-production`
   - Password: `sua_senha_forte`
   - Region: `South America (São Paulo)`

4. **Obter Database URL:**
```
Settings → Database → Connection String → URI
postgresql://postgres:sua_senha@db.xxx.supabase.co:5432/postgres
```

### **Passo 2: Vercel (Frontend)**

1. **Acesse [Vercel.com](https://vercel.com)**
2. **Conecte com GitHub**
3. **Import Repository: `beuni-desafio`**
4. **Configurações:**
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

**Environment Variables:**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

### **Passo 3: Railway (Backend Only)**

1. **Create New Project no Railway**
2. **Deploy from GitHub (mesmo repositório)**
3. **Configurar apenas o backend:**
   - Root Directory: `/backend`
   - Conectar ao Supabase database

---

## 🎨 Deploy Completo - Render.com

### **Quando usar:**
- Alternativa ao Railway
- Interface mais tradicional
- Controle granular sobre configurações

### **Passo 1: Render Setup**

1. **Acesse [Render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Connect repository**

### **Passo 2: PostgreSQL**

1. **Dashboard → New → PostgreSQL**
2. **Name:** `beuni-postgres`
3. **Database:** `beuni`
4. **User:** `beuni_user`
5. **Region:** `Ohio (US East)`
6. **Plan:** Free

### **Passo 3: Redis**

1. **Dashboard → New → Redis**
2. **Name:** `beuni-redis`
3. **Region:** `Ohio (US East)`
4. **Plan:** Free

### **Passo 4: Backend Service**

1. **Dashboard → New → Web Service**
2. **Connect Repository:** `beuni-desafio`
3. **Settings:**
   - Name: `beuni-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

**Environment Variables:**
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=internal_connection_string_from_render
REDIS_URL=internal_connection_string_from_render
JWT_SECRET=seu_jwt_secret_super_secreto
FRONTEND_URL=https://beuni-frontend.onrender.com
```

### **Passo 5: Frontend Service**

1. **Dashboard → New → Static Site**
2. **Connect Repository:** `beuni-desafio`
3. **Settings:**
   - Name: `beuni-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`

---

## 🔧 Configuração de Ambiente

### **Variáveis Essenciais**

#### **Backend (.env)**
```env
# Ambiente
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://user:pass@host:6379

# JWT (GERAR NOVO!)
JWT_SECRET=novo_secret_de_64_caracteres_para_producao_super_secreto_123456

# CORS
FRONTEND_URL=https://seu-frontend-url.com

# Upload (opcional)
UPLOAD_PATH=/tmp/uploads
MAX_FILE_SIZE=5MB
```

#### **Frontend (.env.local)**
```env
# API
NEXT_PUBLIC_API_URL=https://seu-backend-url.com

# Ambiente
NODE_ENV=production
```

### **Gerar JWT Secret Seguro**
```bash
# Método 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Método 2: OpenSSL
openssl rand -hex 64

# Método 3: Online (não recomendado para produção real)
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

### **Configurar CORS e Security**

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'https://seu-frontend.vercel.app',
    'https://seu-frontend.railway.app',
    'https://localhost:3000', // apenas para desenvolvimento
  ],
  credentials: true,
});
```

---

## ✅ Validação do Deploy

### **Checklist de Verificação**

#### **1. Backend Health Check**
```bash
# Verificar se backend está rodando
curl https://seu-backend-url.com/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2025-01-03T...",
  "uptime": 123.45
}
```

#### **2. Database Connection**
```bash
# Verificar se database está conectado
curl https://seu-backend-url.com/api/docs

# Deve mostrar documentação Swagger
```

#### **3. Frontend Loading**
```bash
# Verificar se frontend carrega
curl -I https://seu-frontend-url.com

# Resposta esperada: HTTP 200
```

#### **4. Autenticação**
```bash
# Testar login
curl -X POST https://seu-backend-url.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.rh@beunidemo.com","password":"123456"}'

# Resposta esperada:
{
  "access_token": "eyJhbGciOiJS...",
  "user": {...}
}
```

#### **5. APIs Funcionando**
```bash
# Testar API protegida (usar token do passo anterior)
curl -H "Authorization: Bearer SEU_TOKEN" \
  https://seu-backend-url.com/colaboradores

# Deve retornar lista de colaboradores
```

### **Performance Check**

| Métrica | Target | Como Verificar |
|---------|---------|----------------|
| **First Load** | < 3s | DevTools → Network |
| **API Response** | < 500ms | DevTools → Network |
| **Database Query** | < 100ms | Backend logs |
| **Memory Usage** | < 512MB | Platform dashboard |

---

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **1. Build Failed - Frontend**
```bash
# Erro comum: Dependências faltando
Error: Cannot find module 'sharp'

# Solução:
npm install sharp --save
```

#### **2. Build Failed - Backend**
```bash
# ❌ Erro: TypeScript Compiler não encontrado
Error: sh: 1: tsc: not found
BUILD FAILED: exit code 127

# ❌ Problema: Railway está fazendo build na RAIZ do monorepo
> beuni-desafio@1.0.0 build
> npm run build:backend && npm run build:frontend

# 🔧 SOLUÇÃO DEFINITIVA:
# 1. Configure Root Directory = "backend" (SEM barra)
#    - Service Settings → General → Root Directory: backend
#    - Isso força Railway a fazer npm ci na pasta /backend
#    - Não na raiz que usa --omit=dev

# 2. Verifique se typescript está em dependencies (já corrigido)
#    - backend/package.json deve ter typescript em dependencies
#    - Não em devDependencies (omitido pelo Railway)

# ❌ Erro anterior: NestJS CLI não encontrado  
Error: sh: 1: nest: not found

# 🔧 Solução aplicada: build script usa tsc diretamente
"build": "tsc -p tsconfig.json"
# Em vez de: "build": "npx nest build"
```

#### **3. Root Directory Incorreto**
```bash
# Erro: Deploy do monorepo inteiro
Error: Multiple package.json found

# Solução CORRETA:
# Backend: Root Directory = "backend" (SEM /)
# Frontend: Root Directory = "frontend" (SEM /)

# NUNCA usar:
# - "/" (raiz)
# - "/backend" (com /)
# - "./backend" (relativo)
```

#### **4. Pre-Deploy Command Error**
```bash
# Erro: Prisma migrations falham
Error: Can't reach database server during pre-deploy

# Solução: Configurar Pre-Deploy Command
# Backend Service → Settings → Deploy → Pre-Deploy Command:
npx prisma migrate deploy && npx prisma db seed

# Ordem de execução Railway:
# 1. Build (npm install + npm run build)
# 2. Pre-Deploy (migrations)
# 3. Start (npm run start:prod)
```

#### **5. Environment Variables Missing**
```bash
# Erro: DATABASE_URL não definido
Error: Environment variable not found: DATABASE_URL

# Solução: Usar referências Railway
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# IMPORTANTE: Serviços devem estar no mesmo projeto
# Para referenciar: ${{ServiceName.VARIABLE}}
```

#### **5. Nixpacks Start Command Error**
```bash
# IMPORTANTE: Railway agora usa RAILPACK por padrão
# Nixpacks está deprecated e em maintenance mode

# Railway detecta automaticamente:
# - Node.js projects via package.json
# - Build command: npm run build
# - Start command: npm run start:prod (backend) / npm start (frontend)

# Se ainda usando Nixpacks, migrar para Railpack:
# Settings → Deploy → Builder → RAILPACK

# Não precisa configurar comandos manualmente!
```

#### **6. Dockerfile Detection Issues**
```bash
# Railway detecta automaticamente Dockerfile se existir
# Logs mostram: "Using detected Dockerfile!"

# Para usar package.json ao invés de Dockerfile:
# - Renomear Dockerfile para Dockerfile.backup
# - OU definir RAILWAY_DOCKERFILE_PATH=""

# Railpack é recomendado para Node.js projects
```

#### **3. 500 Error no Login**
```bash
# Erro comum: JWT_SECRET não definido
Error: secretOrKey required

# Solução: Definir JWT_SECRET nas variáveis de ambiente
```

#### **4. CORS Error**
```bash
# Erro: Access blocked by CORS policy
# Solução: Verificar FRONTEND_URL no backend
```

#### **5. Database não Migrou**
```bash
# Executar migrações manualmente
railway run npx prisma migrate deploy
railway run npx prisma db seed

# Ou via platform CLI
```

### **Logs e Debug**

#### **Railway Logs**
```bash
# Instalar CLI
npm install -g @railway/cli

# Ver logs em tempo real
railway logs --service backend
railway logs --service frontend
```

#### **Vercel Logs**
```bash
# No dashboard Vercel
Functions → View Function Logs
```

#### **Render Logs**
```bash
# No dashboard Render
Service → Logs (tempo real)
```

### **Rollback de Deploy**

#### **Railway**
```bash
# Voltar para deploy anterior
railway redeploy [DEPLOYMENT_ID]
```

#### **Vercel**
```bash
# No dashboard: Deployments → Promote to Production
```

---

## 🔑 Credenciais para Teste

### **Usuário de Demonstração**
```
Email: ana.rh@beunidemo.com
Senha: 123456
Organização: Beuni Demo
```

### **Funcionalidades para Testar**

#### **1. Autenticação**
- [ ] Login com credenciais de demo
- [ ] Logout funcional
- [ ] Redirecionamento correto

#### **2. Dashboard**
- [ ] Estatísticas carregando
- [ ] Próximos aniversariantes
- [ ] Gráficos funcionais

#### **3. Colaboradores**
- [ ] Listagem de colaboradores
- [ ] Busca funcionando
- [ ] Ordenação A-Z

#### **4. Catálogo**
- [ ] Grid e lista de produtos
- [ ] Filtros por categoria
- [ ] Busca em tempo real

#### **5. Envios**
- [ ] Lista de envios
- [ ] Filtros por status
- [ ] Busca avançada

#### **6. Relatórios**
- [ ] Gráficos interativos
- [ ] Export CSV
- [ ] Filtros por ano

#### **7. Configurações**
- [ ] Upload de foto de perfil
- [ ] Atualização de dados

### **Dados de Demonstração**

O sistema vem pré-populado com:
- **5 Colaboradores** com aniversários diversos
- **15 Envios** em diferentes status
- **8 Produtos** no catálogo
- **Dados históricos** para relatórios

---

## 📊 Monitoramento de Produção

### **Métricas Essenciais**

#### **Uptime Monitoring (Grátis)**
```bash
# UptimeRobot.com - Monitoramento gratuito
# Configurar alerts para:
# - Frontend: https://seu-frontend.com
# - Backend: https://seu-backend.com/health
# - Intervalo: 5 minutos
```

#### **Performance**
```javascript
// Google PageSpeed Insights
// https://pagespeed.web.dev/
// Target: Score > 90

// GTmetrix (gratuito)
// https://gtmetrix.com/
// Target: Grade A
```

#### **Error Tracking**
```javascript
// Sentry (gratuito até 5k errors/mês)
npm install @sentry/nextjs @sentry/node

// Configurar no frontend e backend
```

### **Backup Strategy**

#### **Database Backup (Automático)**
- **Railway:** Backup diário automático (7 dias)
- **Supabase:** Backup diário automático (7 dias)  
- **Render:** Backup diário automático (7 dias)

#### **Code Backup**
- **GitHub:** Repositório principal
- **Branches:** main, production, desenvolvimento

---

## 💰 Custos e Limites

### **Planos Gratuitos**

#### **Railway (Recomendado)**
```
✅ 512MB RAM por serviço
✅ $5 credit/mês (gratuito)
✅ SSL automático
✅ Domínio customizado
✅ PostgreSQL + Redis inclusos
```

#### **Vercel**
```
✅ 100GB bandwidth/mês
✅ Domínio customizado
✅ SSL automático
✅ Deploy automático
```

#### **Supabase**
```
✅ 500MB database
✅ 2GB bandwidth/mês
✅ 50MB storage
✅ SSL automático
```

#### **Render**
```
✅ 512MB RAM
✅ 750h/mês (suficiente)
✅ SSL automático
✅ PostgreSQL gratuito
```

### **Estimativa de Uso**
Para uma demonstração/teste durante processo seletivo:
- **Tráfego:** < 1GB/mês
- **Database:** < 100MB
- **Compute:** < 100h/mês
- **Storage:** < 50MB

**💰 Custo Total: R$ 0,00**

---

## 🎯 Deploy Rápido para Recrutadores

### **Opção 1: Deploy Instantâneo (Railway)**
```bash
# ✅ MÉTODO OFICIAL RAILWAY - Baseado na documentação

# 1. Clonar repositório
git clone https://github.com/zer0spin/beuni-desafio.git

# 2. Railway.app → New Project

# 3. Deploy Backend:
#    - Deploy from GitHub repo: beuni-desafio
#    - Root Directory: "backend" (sem /)
#    - Railway detecta Node.js automaticamente
#    - Build: npm run build (automático)
#    - Start: npm run start:prod (automático)

# 4. Deploy Frontend:
#    - Add Service → Deploy from GitHub
#    - Same repo, Root Directory: "frontend"
#    - Railway detecta Next.js automaticamente
#    - Build: npm run build (automático)
#    - Start: npm start (automático)

# 5. Add Database Services:
#    - Add Service → PostgreSQL
#    - Add Service → Redis

# 6. Configure environment variables com referências:
#    DATABASE_URL=${{Postgres.DATABASE_URL}}
#    REDIS_URL=${{Redis.REDIS_URL}}

# 7. Pre-Deploy Command (Backend):
#    npx prisma migrate deploy && npx prisma db seed

# 8. Generate Domain para ambos serviços

# 9. URLs finais em ~15 minutos:
# Frontend: https://beuni-frontend.up.railway.app
# Backend: https://beuni-backend.up.railway.app
```

### **Opção 2: Deploy com Docker (Render)**
```bash
# 1. Fork do repositório no seu GitHub

# 2. Render.com → Connect Repository

# 3. Deploy automático usando Docker

# 4. Configurar variáveis de ambiente via dashboard

# 5. Aguardar ~15 minutos para build completo
```

### **Opção 3: Deploy Híbrido (Vercel + Railway)**
```bash
# Frontend: Vercel (mais rápido)
# Backend + Database: Railway (mais completo)

# 1. Vercel: Deploy apenas pasta /frontend
# 2. Railway: Deploy apenas pasta /backend + DB
# 3. Conectar via NEXT_PUBLIC_API_URL
```

---

## 📞 Suporte e Contato

### **Em caso de problemas no deploy:**

1. **📧 Email:** marvinbeluci@gmail.com
2. **💬 WhatsApp:** +55 11 94038-4046  
3. **📱 LinkedIn:** [linkedin.com/in/marvin-beluci](https://linkedin.com/in/marvin-beluci)

### **Documentação Adicional:**
- **README.md** - Instruções de desenvolvimento
- **ARCHITECTURE.md** - Arquitetura do sistema
- **DEVELOPMENT_LOG.md** - Log completo de desenvolvimento
- **docs/** - Documentação técnica detalhada

---

## ✅ Checklist Final para Recrutadores

### **Antes de Iniciar:**
- [ ] Conta no Railway/Vercel criada
- [ ] Repositório clonado/acessível
- [ ] ~30 minutos disponíveis para deploy

### **Durante o Deploy:**
- [ ] Serviços criados (Frontend, Backend, Database)
- [ ] Variáveis de ambiente configuradas
- [ ] Build completed sem erros
- [ ] Database migrated e seeded

### **Validação:**
- [ ] Frontend carregando (URL pública)
- [ ] Login funcionando (ana.rh@beunidemo.com / 123456)
- [ ] Dashboard com dados
- [ ] APIs respondendo
- [ ] SSL ativo (https://)

### **Para Demonstração:**
- [ ] Testar login/logout
- [ ] Navegar entre páginas
- [ ] Usar funcionalidades principais
- [ ] Verificar responsividade mobile
- [ ] Testar busca e filtros

---

**🎊 Sucesso! A plataforma Beuni está agora em produção e pronta para avaliação.**

> **Tempo estimado total:** 15-30 minutos  
> **Custo:** R$ 0,00 (100% gratuito)  
> **Validade:** Ilimitada (enquanto dentro dos limites gratuitos)

**Para dúvidas ou suporte, entre em contato. Boa avaliação! 🚀**
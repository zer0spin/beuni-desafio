# 🔧 Troubleshooting - Beuni Platform

Guia completo de solução de problemas para o projeto Beuni.

---

## 📋 Índice

1. [Erros de Login](#erros-de-login)
2. [Erros de Conexão com API](#erros-de-conexão-com-api)
3. [Erros de Database](#erros-de-database)
4. [Erros de Deploy](#erros-de-deploy)
5. [Comandos Úteis](#comandos-úteis)

---

## 🔐 Erros de Login

### Erro: "Request failed with status code 500"

**Causa**: Banco de dados sem migrations ou tabelas não criadas.

**Solução**:
```bash
# 1. Conectar via SSH ao Railway e rodar migrations
cd backend
railway ssh "npx prisma migrate deploy"

# 2. Verificar se as tabelas foram criadas
railway ssh "cd /app && npx prisma studio"
```

---

### Erro: "Bad Request (400)" no login

**Causa**: Frontend enviando campos incorretos no body da requisição.

**Verificar**:
- O DTO do backend espera `email` e `password`
- O frontend está enviando esses campos corretamente

**Exemplo correto**:
```json
{
  "email": "admin@beuni.com",
  "password": "Admin@123"
}
```

---

### Erro: "Credenciais inválidas (401)"

**Causa**: Usuário não existe no banco ou senha incorreta.

**Solução - Criar usuário de teste**:
```bash
cd backend
railway ssh "cd /app && cat > create-user.js << 'EOFSCRIPT'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
async function createTestUser() {
  const prisma = new PrismaClient();
  try {
    let org = await prisma.organizacao.findFirst({ where: { nome: 'Beuni HQ' } });
    if (!org) {
      org = await prisma.organizacao.create({ data: { nome: 'Beuni HQ' } });
      console.log('✅ Organization created:', org.id);
    }
    const existingUser = await prisma.usuario.findUnique({ where: { email: 'admin@beuni.com' } });
    if (existingUser) {
      console.log('ℹ️  User already exists');
      await prisma.\$disconnect();
      return;
    }
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const user = await prisma.usuario.create({
      data: {
        nome: 'Admin Beuni',
        email: 'admin@beuni.com',
        senhaHash: hashedPassword,
        organizationId: org.id
      }
    });
    console.log('✅ Admin user created:', user.email);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}
createTestUser();
EOFSCRIPT
node create-user.js && rm create-user.js"
```

**Credenciais criadas**:
- Email: `admin@beuni.com`
- Senha: `Admin@123`

---

## 🔌 Erros de Conexão com API

### Erro: "Cannot connect to backend"

**Verificar URLs**:

1. **Frontend `.env.production`**:
```bash
NEXT_PUBLIC_API_URL=https://beuni-desafio-production-41c7.up.railway.app
```

2. **Vercel `vercel.json`**:
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

3. **Next.js `next.config.js`**:
```javascript
const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://beuni-desafio-production-41c7.up.railway.app'
    : 'http://localhost:3001');
```

**Comando para verificar Railway URL**:
```bash
cd backend
railway status
```

---

### Erro: "CORS policy blocked"

**Verificar configuração CORS no backend**:

Arquivo: `backend/src/main.ts`

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://beuni-frontend-one.vercel.app',
  /^https:\/\/beuni-frontend.*\.vercel\.app$/,
];

if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',');
  allowedOrigins.push(...envOrigins);
}
```

**Verificar variáveis no Railway**:
```bash
railway variables
```

Deve conter:
```
CORS_ORIGIN=https://beuni-frontend-one.vercel.app
FRONTEND_URL=https://beuni-frontend-one.vercel.app
```

---

## 💾 Erros de Database

### Erro: "Can't reach database server at `postgres.railway.internal:5432`"

**Causa**: Tentando conectar à Railway database de fora do Railway.

**Solução**:
```bash
# ERRADO: railway run usa .env local
railway run npx prisma migrate deploy

# CORRETO: railway ssh executa DENTRO do Railway
railway ssh "npx prisma migrate deploy"
```

---

### Erro: "The table `public.usuarios` does not exist"

**Causa**: Migrations não foram executadas no banco de produção.

**Solução**:
```bash
cd backend

# 1. Verificar conexão com banco
railway variables | grep DATABASE_URL

# 2. Executar migrations via SSH
railway ssh "npx prisma migrate deploy"

# 3. Verificar se tabelas foram criadas
railway ssh "cd /app && npx prisma db pull"
```

---

### Erro: "Argument `organizacao` is missing"

**Causa**: Schema do Prisma exige relacionamento definido.

**Solução - Usar `organizationId` em vez de `organizacao`**:
```javascript
// ❌ ERRADO
prisma.usuario.create({
  data: { organizacaoId: org.id }
});

// ✅ CORRETO
prisma.usuario.create({
  data: { organizationId: org.id }
});
```

---

## 🚀 Erros de Deploy

### Erro: "Build failed on Vercel"

**Verificar**:

1. **Variáveis de ambiente na Vercel**:
```bash
NEXT_PUBLIC_API_URL=https://beuni-desafio-production-41c7.up.railway.app
NODE_ENV=production
```

2. **Build command correto**:
```json
{
  "buildCommand": "cd frontend && npm ci && npm run build",
  "installCommand": "cd frontend && npm ci",
  "outputDirectory": "frontend/.next"
}
```

---

### Erro: "Railway deployment failed"

**Logs do Railway**:
```bash
cd backend
railway logs
```

**Verificar**:
1. `DATABASE_URL` está configurada?
2. Migrations foram executadas?
3. PORT está configurada (3001)?

---

## 🔍 Comandos Úteis

### Railway

```bash
# Ver status do serviço
railway status

# Ver variáveis de ambiente
railway variables

# Ver logs em tempo real
railway logs

# Executar comando no Railway
railway ssh "comando aqui"

# Redeployar
railway up

# Conectar ao Redis
railway ssh "redis-cli -u $REDIS_URL"

# Conectar ao PostgreSQL
railway ssh "psql $DATABASE_URL"
```

### Prisma

```bash
# Gerar client
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
railway ssh "npx prisma migrate deploy"

# Abrir Prisma Studio
npx prisma studio

# Ver schema do banco
npx prisma db pull

# Reset database (CUIDADO!)
npx prisma migrate reset --force
```

### Git

```bash
# Ver status
git status

# Adicionar mudanças
git add -A

# Commit
git commit -m "mensagem"

# Push
git push origin main

# Ver histórico
git log --oneline -10

# Ver mudanças não commitadas
git diff
```

---

## 📊 Health Checks

### Backend Health

```bash
# Produção
curl https://beuni-desafio-production-41c7.up.railway.app/health

# Local
curl http://localhost:3001/health
```

**Resposta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T05:00:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

---

### Frontend Health

```bash
# Produção
curl https://beuni-frontend-one.vercel.app

# Local
curl http://localhost:3000
```

---

## 🐛 Debug Mode

### Backend (NestJS)

```bash
# Development com debug
npm run start:debug

# Logs detalhados
NODE_ENV=development npm run start:dev
```

### Frontend (Next.js)

```bash
# Development mode
npm run dev

# Build com análise
ANALYZE=true npm run build

# Verificar variáveis de ambiente
npm run env
```

---

## 📝 Checklist de Deploy

- [ ] Railway database migrations executadas
- [ ] Usuário de teste criado no banco
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] CORS configurado corretamente
- [ ] URLs de produção corretas em todos os arquivos
- [ ] Build do frontend sem erros
- [ ] Build do backend sem erros
- [ ] Health checks respondendo OK
- [ ] Login funcionando
- [ ] Redis conectado

---

## 🆘 Suporte

Se após seguir este guia o problema persistir:

1. **Verificar logs**:
   - Railway: `railway logs`
   - Vercel: Dashboard → Deployments → Logs

2. **Verificar variáveis**:
   - Railway: `railway variables`
   - Vercel: Settings → Environment Variables

3. **Testar endpoints manualmente**:
   ```bash
   # Login
   curl -X POST https://beuni-desafio-production-41c7.up.railway.app/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@beuni.com","password":"Admin@123"}'
   ```

---

**Última atualização**: 2025-01-04
**Versão**: 1.0.0

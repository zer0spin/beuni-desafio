# 🔧 Railway - Configuração Manual Passo a Passo

## ✅ Correções Aplicadas no Código

1. **✅ Prisma binaryTargets** - Corrigido para `linux-musl-openssl-3.0.x`
2. **✅ PORT variable** - Corrigido cast para integer
3. **✅ Redis graceful fallback** - Já configurado, aplicação não trava sem Redis

---

## 📋 Intervenção Manual no Railway Dashboard

### **Passo 1: Corrigir Variável PORT**

#### ⚠️ ERRO ATUAL:
```
PORT variable must be integer between 0 and 65535
```

#### ✅ SOLUÇÃO:

1. Acesse seu projeto no Railway: https://railway.app/dashboard
2. Clique no serviço do **Backend**
3. Vá em **Variables** (menu lateral esquerdo)
4. Encontre a variável `PORT`
5. **REMOVA AS ASPAS** do valor:

   **❌ ERRADO:**
   ```
   PORT="${{PORT}}"
   ```

   **✅ CORRETO:**
   ```
   PORT=${{PORT}}
   ```

6. Clique em **Save** ou pressione Enter

**IMPORTANTE:** Railway substitui automaticamente `${{PORT}}` pelo número da porta. Não precisa colocar aspas.

---

### **Passo 2: Verificar Todas as Variáveis**

Na aba **Variables**, confirme que as variáveis estão EXATAMENTE assim:

#### ✅ Configuração Correta:

```env
CORS_ORIGIN=https://beuni-desafio.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_EXPIRES_IN=7d
JWT_SECRET=fa68e27a-4848-47e5-8535-af2f25b8866a
NODE_ENV=production
PORT=${{PORT}}
RATE_LIMIT_CEP=30
RATE_LIMIT_LOGIN=5
REDIS_URL=${{Redis.REDIS_URL}}
VIACEP_API_URL=https://viacep.com.br/ws
```

#### 🔑 Regras Importantes:

| Variável | Formato | Exemplo |
|----------|---------|---------|
| `DATABASE_URL` | Sem aspas | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | Sem aspas | `${{Redis.REDIS_URL}}` |
| `PORT` | Sem aspas | `${{PORT}}` |
| `CORS_ORIGIN` | Com aspas só se tiver espaços | `https://beuni.railway.app` |
| `JWT_SECRET` | String simples | `fa68e27a-4848-47e5-8535-af2f25b8866a` |
| Números | Sem aspas | `30` (não `"30"`) |

---

### **Passo 3: Garantir que PostgreSQL e Redis estão conectados**

#### PostgreSQL:

1. No menu lateral esquerdo, clique em **+ New**
2. Selecione **Database** → **Add PostgreSQL**
3. Aguarde a criação do banco
4. Volte nas **Variables** do backend
5. Certifique-se que `DATABASE_URL=${{Postgres.DATABASE_URL}}`

#### Redis:

1. No menu lateral esquerdo, clique em **+ New**
2. Selecione **Database** → **Add Redis**
3. Aguarde a criação do Redis
4. Volte nas **Variables** do backend
5. Certifique-se que `REDIS_URL=${{Redis.REDIS_URL}}`

**💡 Verificação Visual:**
- PostgreSQL e Redis devem aparecer como **serviços separados** no seu projeto
- Quando você digita `${{` no campo de variável, o Railway deve auto-completar mostrando os serviços disponíveis

---

### **Passo 4: Executar Migrations do Prisma**

Após o deploy bem-sucedido:

#### Opção A: Via Railway Dashboard (Recomendado)

1. Vá no serviço do **Backend**
2. Clique em **Settings** (menu lateral)
3. Role até **Deploy**
4. Em **Custom Start Command**, adicione:
   ```bash
   npx prisma migrate deploy && node dist/main.js
   ```
5. Salve e aguarde redeploy

#### Opção B: Via CLI

```bash
# Instalar Railway CLI (se não tiver)
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Executar migrations
railway run npx prisma migrate deploy

# Ver se funcionou
railway logs
```

---

### **Passo 5: Verificar Deploy**

#### 1. Ver Logs em Tempo Real:

1. Vá no serviço do **Backend**
2. Clique em **Deployments** (menu lateral)
3. Clique no deploy mais recente (deve estar "Building" ou "Running")
4. Role até o final dos logs

#### 2. Logs Esperados (Deploy Bem-Sucedido):

```
✓ Prisma Client generated successfully
✓ Build completed
✓ Starting application...
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG Redis Client Connected
🚀 Beuni Backend API rodando em: http://localhost:3001
📚 Documentação Swagger disponível em: http://localhost:3001/api/docs
```

#### 3. Encontrar URL da API:

1. No serviço do Backend, clique em **Settings**
2. Role até **Networking** → **Public Networking**
3. Copie a URL (exemplo: `https://beuni-backend-production.up.railway.app`)

#### 4. Testar a API:

```bash
# Health check
curl https://sua-url.railway.app/health

# Ou abra no navegador:
https://sua-url.railway.app/api/docs
```

---

## 🐛 Troubleshooting

### Erro: `Prisma Client could not locate the Query Engine`
✅ **JÁ CORRIGIDO** - Arquivo `schema.prisma` foi atualizado com `binaryTargets`

**O que foi feito:**
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```

**Ação necessária:** Apenas faça commit e push das mudanças.

---

### Erro: `PORT variable must be integer`
✅ **Corrigir manualmente no Railway Dashboard**

**Passo a passo:**
1. Variables → PORT
2. Remover aspas: `${{PORT}}` (não `"${{PORT}}"`)
3. Salvar

---

### Erro: `Redis Client Error: connect ECONNREFUSED`
✅ **Aplicação funciona mesmo sem Redis**

**Opções:**
1. **Ignorar** - A aplicação vai rodar normalmente sem cache
2. **Adicionar Redis** - Siga Passo 3 acima

---

### Erro: `Database connection failed`

**Verificar:**
1. PostgreSQL está adicionado ao projeto?
2. Variável `DATABASE_URL=${{Postgres.DATABASE_URL}}` está correta?
3. Sem aspas na variável?

**Solução:**
```bash
# Testar conexão via CLI
railway run npx prisma db push

# Ver logs
railway logs --tail
```

---

## 🔄 Após Corrigir as Variáveis

### **Railway vai automaticamente fazer redeploy quando você:**
1. Salvar/modificar uma variável
2. Fazer push para o repositório GitHub (se configurado)

### **Para forçar redeploy manual:**
1. Vá em **Deployments**
2. Clique no deploy mais recente
3. Clique em **Redeploy** (canto superior direito)

---

## 📊 Checklist Final

Antes de considerar deploy completo:

- [ ] Variável `PORT=${{PORT}}` sem aspas
- [ ] PostgreSQL adicionado e `DATABASE_URL` configurado
- [ ] Redis adicionado e `REDIS_URL` configurado (opcional)
- [ ] JWT_SECRET configurado
- [ ] CORS_ORIGIN aponta para frontend correto
- [ ] Migrations do Prisma executadas
- [ ] Logs mostram "Application is running"
- [ ] API responde em: `https://sua-url.railway.app/api/docs`
- [ ] Health check funcionando: `/health`

---

## 🌐 Como Acessar a Aplicação

### **Backend API:**
```
https://[seu-projeto].up.railway.app
```

### **Swagger/Documentação:**
```
https://[seu-projeto].up.railway.app/api/docs
```

### **Health Check:**
```
https://[seu-projeto].up.railway.app/health
```

### **Frontend (se deployado separadamente):**
```
https://[seu-frontend].up.railway.app
```

---

## 📝 Próximos Passos Após Deploy Bem-Sucedido

1. **Testar API no Swagger**
   - Acessar `/api/docs`
   - Testar endpoint de login
   - Testar criação de colaboradores

2. **Configurar Frontend**
   - Atualizar `NEXT_PUBLIC_API_URL` no frontend
   - Apontar para URL do backend no Railway

3. **Monitoramento**
   - Configurar alertas no Railway
   - Verificar métricas de CPU/Memory
   - Configurar logs externos (opcional)

4. **Domínio Customizado** (opcional)
   - Settings → Domains → Add Custom Domain
   - Configurar DNS no seu provedor

---

## 🔐 Segurança Pós-Deploy

### **Trocar JWT_SECRET para um mais seguro:**

```bash
# Gerar secret forte:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Atualizar no Railway Variables
```

### **Habilitar Backup Automático PostgreSQL:**
1. PostgreSQL service → Settings
2. Habilitar Automatic Backups (plano pago)

---

## 📚 Links Úteis

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.com
- **Railway CLI**: https://docs.railway.com/develop/cli

---

## 🆘 Se Ainda Tiver Problemas

### **Ver logs detalhados:**
```bash
railway logs --tail
```

### **Verificar variáveis:**
```bash
railway variables
```

### **Status do projeto:**
```bash
railway status
```

### **Conectar ao shell do container:**
```bash
railway run bash
```

---

**✅ Resumo:** Após fazer commit das mudanças no código e corrigir a variável `PORT` no Railway, o deploy deve funcionar perfeitamente!

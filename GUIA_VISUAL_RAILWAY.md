# 🎨 Guia Visual - Configurar Variáveis no Railway

## 🎯 PROBLEMA: Aspas Automáticas

Você viu isso:
```
DATABASE_URL="${{Postgres.DATABASE_URL}}"
```

**Isso está ERRADO.** Railway está tratando como texto, não como referência.

---

## ✅ SOLUÇÃO VISUAL: Passo a Passo

### **PASSO 1: Abrir Projeto no Railway**

```
┌─────────────────────────────────────────────┐
│  🚂 Railway Dashboard                       │
├─────────────────────────────────────────────┤
│                                             │
│  📦 beuni-desafio          [Settings] [⚙️] │
│                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────┐│
│  │   Backend   │  │  Postgres   │  │Redis ││
│  │   (NestJS)  │  │  (Database) │  │(Cache)│
│  └─────────────┘  └─────────────┘  └──────┘│
│       ↑                                     │
│   CLIQUE AQUI                               │
└─────────────────────────────────────────────┘
```

**Ação:** Clique no serviço **Backend**

---

### **PASSO 2: Ir para Variables**

```
┌─────────────────────────────────────────────┐
│  Backend Service                            │
├─────────────────────────────────────────────┤
│                                             │
│  [Deployments] [Metrics] [Variables] [...]  │
│                              ↑              │
│                         CLIQUE AQUI         │
└─────────────────────────────────────────────┘
```

**Ação:** Clique na aba **Variables**

---

### **PASSO 3: Ver Variáveis Atuais (Erradas)**

```
┌─────────────────────────────────────────────┐
│  Variables                    [+ New Variable]│
├─────────────────────────────────────────────┤
│                                             │
│  DATABASE_URL                    [🗑️]       │
│  "${{Postgres.DATABASE_URL}}"               │
│  ↑                                          │
│  ISTO ESTÁ ERRADO (string literal)         │
│                                             │
│  REDIS_URL                       [🗑️]       │
│  "${{Redis.REDIS_URL}}"                     │
│  ↑                                          │
│  ISTO TAMBÉM ESTÁ ERRADO                    │
└─────────────────────────────────────────────┘
```

**Ação:** Deletar estas variáveis (clique no 🗑️)

---

### **PASSO 4A: Adicionar Como Referência (Método Interface)**

```
┌─────────────────────────────────────────────┐
│  Variables                    [+ New Variable]│
│                                  ↑           │
│                             CLIQUE AQUI      │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ Add New Variable                      │ │
│  │                                       │ │
│  │ Name: DATABASE_URL                    │ │
│  │                                       │ │
│  │ Type: ○ Variable                      │ │
│  │       ● Reference  ← ESCOLHA ESTE     │ │
│  │                                       │ │
│  │ Service: [Postgres ▼]                 │ │
│  │                                       │ │
│  │ Variable: [DATABASE_URL ▼]            │ │
│  │                                       │ │
│  │          [Cancel]  [Add Variable]     │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Configuração:**
1. Name: `DATABASE_URL`
2. Type: Selecione **Reference** (não Variable)
3. Service: `Postgres`
4. Variable: `DATABASE_URL`
5. Clique **Add Variable**

**Repita para REDIS_URL:**
1. Name: `REDIS_URL`
2. Type: **Reference**
3. Service: `Redis`
4. Variable: `REDIS_URL`

---

### **PASSO 4B: Adicionar Via Raw Editor (Alternativa)**

Se não aparecer opção "Reference", use Raw Editor:

```
┌─────────────────────────────────────────────┐
│  Variables        [⚙️ Raw Editor]            │
│                        ↑                    │
│                   CLIQUE AQUI               │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ {                                     │ │
│  │   "DATABASE_URL": {                   │ │
│  │     "$ref": "Postgres.DATABASE_URL"   │ │
│  │   },                                  │ │
│  │   "REDIS_URL": {                      │ │
│  │     "$ref": "Redis.REDIS_URL"         │ │
│  │   },                                  │ │
│  │   "JWT_SECRET": "fa68e27a-...",       │ │
│  │   "NODE_ENV": "production",           │ │
│  │   "PORT": "${{PORT}}",                │ │
│  │   "CORS_ORIGIN": "https://...",       │ │
│  │   "JWT_EXPIRES_IN": "7d",             │ │
│  │   "RATE_LIMIT_CEP": "30",             │ │
│  │   "RATE_LIMIT_LOGIN": "5",            │ │
│  │   "VIACEP_API_URL": "https://..."     │ │
│  │ }                                     │ │
│  └───────────────────────────────────────┘ │
│                                             │
│          [Cancel]  [Save Variables]         │
└─────────────────────────────────────────────┘
```

**Ação:** Copie e cole o JSON acima, depois clique **Save Variables**

---

### **PASSO 5: Verificar Se Está Correto**

Após salvar, você deve ver:

```
┌─────────────────────────────────────────────┐
│  Variables                    [+ New Variable]│
├─────────────────────────────────────────────┤
│                                             │
│  🔗 DATABASE_URL                  [✏️] [🗑️]  │
│  ${{Postgres.DATABASE_URL}}                 │
│  (hover: postgresql://user:pass@...)        │
│  ↑                                          │
│  ✅ CORRETO - Ícone de link presente        │
│                                             │
│  🔗 REDIS_URL                     [✏️] [🗑️]  │
│  ${{Redis.REDIS_URL}}                       │
│  (hover: redis://default:pass@...)          │
│  ↑                                          │
│  ✅ CORRETO - Ícone de link presente        │
│                                             │
│  📝 JWT_SECRET                    [✏️] [🗑️]  │
│  fa68e27a-4848-47e5-8535-af2f25b8866a       │
│  ↑                                          │
│  ✅ CORRETO - Texto normal                  │
│                                             │
│  📝 NODE_ENV                      [✏️] [🗑️]  │
│  production                                 │
│                                             │
│  🔗 PORT                          [✏️] [🗑️]  │
│  ${{PORT}}                                  │
│  (hover: 3001)                              │
└─────────────────────────────────────────────┘
```

**Diferenças Visuais:**
- ✅ **Referência:** Ícone 🔗 (corrente/link)
- ✅ **Ao passar mouse:** Mostra valor real
- ❌ **String literal:** Sem ícone, apenas texto

---

### **PASSO 6: Verificar Serviços**

Volte ao dashboard principal:

```
┌─────────────────────────────────────────────┐
│  📦 beuni-desafio                           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────┐│
│  │  Backend    │  │  Postgres   │  │Redis ││
│  │             │  │             │  │      ││
│  │  ● Running  │  │  ● Running  │  │●Run. ││
│  │             │  │             │  │      ││
│  └─────────────┘  └─────────────┘  └──────┘│
│        ↑                ↑              ↑    │
│   DEVE ESTAR      DEVE ESTAR     DEVE ESTAR│
│     VERDE            VERDE          VERDE   │
└─────────────────────────────────────────────┘
```

**Se Postgres ou Redis NÃO existem:**

```
┌─────────────────────────────────────────────┐
│  📦 beuni-desafio              [+ New]       │
│                                   ↑         │
│                              CLIQUE AQUI    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Add a new service                    │ │
│  │                                       │ │
│  │  [GitHub Repo]  [Database]  [Empty]   │ │
│  │                      ↑                │ │
│  │                 CLIQUE AQUI           │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ [PostgreSQL]  [MySQL]  [MongoDB]│ │ │
│  │  │      ↑                          │ │ │
│  │  │  CLIQUE AQUI                    │ │ │
│  │  │                                 │ │ │
│  │  │ [Redis]  [Other...]             │ │ │
│  │  │   ↑                             │ │ │
│  │  │  PARA REDIS, CLIQUE AQUI        │ │ │
│  │  └─────────────────────────────────┘ │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 🎯 JSON Completo Para Raw Editor

Cole isso no Raw Editor:

```json
{
  "CORS_ORIGIN": "https://beuni-desafio.railway.app",
  "DATABASE_URL": {
    "$ref": "Postgres.DATABASE_URL"
  },
  "JWT_EXPIRES_IN": "7d",
  "JWT_SECRET": "fa68e27a-4848-47e5-8535-af2f25b8866a",
  "NODE_ENV": "production",
  "PORT": "${{PORT}}",
  "RATE_LIMIT_CEP": "30",
  "RATE_LIMIT_LOGIN": "5",
  "REDIS_URL": {
    "$ref": "Redis.REDIS_URL"
  },
  "VIACEP_API_URL": "https://viacep.com.br/ws"
}
```

---

## 🔍 Como Testar Se Funcionou

### **Via Railway CLI:**

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Conectar ao container
railway run bash

# Verificar variáveis
echo $DATABASE_URL
# Deve mostrar: postgresql://user:pass@host:5432/db

echo $REDIS_URL
# Deve mostrar: redis://default:pass@host:6379

echo $PORT
# Deve mostrar: 3001 (ou outra porta)
```

---

## 📊 Comparação Visual

### **❌ ERRADO (Como Está):**

```
Variables:
┌─────────────────────────────────┐
│ DATABASE_URL                    │
│ "${{Postgres.DATABASE_URL}}"    │  ← String literal
│ (sem ícone)                     │
└─────────────────────────────────┘

Resultado no container:
DATABASE_URL="${{Postgres.DATABASE_URL}}"  ← Inútil!
```

### **✅ CORRETO (Como Deve Ficar):**

```
Variables:
┌─────────────────────────────────┐
│ 🔗 DATABASE_URL                 │
│ ${{Postgres.DATABASE_URL}}      │  ← Referência
│ (hover: postgresql://...)       │
└─────────────────────────────────┘

Resultado no container:
DATABASE_URL=postgresql://user:pass@host:5432/db  ← Funciona!
```

---

## ⏱️ Timeline

1. **Deletar variáveis antigas:** 30 segundos
2. **Adicionar via Raw Editor:** 2 minutos
3. **Railway redeploy automático:** 3-5 minutos
4. **Verificar logs:** 1 minuto

**TOTAL: ~7 minutos**

---

## 🆘 Se Não Conseguir Pela Interface

### **Use Railway CLI (100% Confiável):**

```bash
# Deletar variáveis antigas
railway variables --delete DATABASE_URL
railway variables --delete REDIS_URL

# Adicionar como referências (IMPORTANTE: aspas simples externas)
railway variables --set 'DATABASE_URL=${{Postgres.DATABASE_URL}}'
railway variables --set 'REDIS_URL=${{Redis.REDIS_URL}}'

# Verificar se funcionou
railway variables
```

**Output esperado:**
```
DATABASE_URL=postgresql://postgres:...
REDIS_URL=redis://default:...
```

---

## 🎯 Checklist Final

- [ ] Deletei `DATABASE_URL` e `REDIS_URL` antigas
- [ ] PostgreSQL existe no projeto (● Running)
- [ ] Redis existe no projeto (● Running)
- [ ] Recriei variáveis como **Reference** (ou via Raw Editor)
- [ ] Vejo ícone 🔗 ao lado das variáveis
- [ ] Ao passar mouse, vejo URL real
- [ ] Salvei mudanças
- [ ] Aguardei redeploy (3-5 min)
- [ ] Verifiquei logs - sem erro "empty string"
- [ ] Verifiquei logs - sem erro "ECONNREFUSED"

---

**✅ Após seguir este guia, DATABASE_URL e REDIS_URL terão valores REAIS, não strings `${{...}}`!**

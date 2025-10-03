# 🔧 Railway - Como Configurar Variáveis de Referência Corretamente

## 🐛 Problema Identificado

### **Erro 1: DATABASE_URL vazio**
```
You must provide a nonempty URL.
The environment variable `DATABASE_URL` resolved to an empty string.
```

### **Erro 2: Redis conectando em localhost**
```
connect ECONNREFUSED ::1:6379
```

---

## 🎯 Causa Raiz

Você configurou as variáveis assim (ERRADO):
```
DATABASE_URL="${{Postgres.DATABASE_URL}}"
REDIS_URL="${{Redis.REDIS_URL}}"
```

O Railway **NÃO está substituindo** os valores. Está tratando como string literal.

**Por quê?**
- Railway coloca aspas automaticamente quando você digita
- `${{...}}` precisa ser configurado como **REFERÊNCIA**, não como texto

---

## ✅ SOLUÇÃO: Usar Interface de Referência do Railway

### **PASSO A PASSO VISUAL**

---

### **1. Deletar Variáveis Antigas**

1. Vá em **Variables** no serviço Backend
2. **DELETE** estas variáveis (clique no ícone de lixeira):
   - `DATABASE_URL`
   - `REDIS_URL`

**IMPORTANTE:** Você vai recriá-las corretamente.

---

### **2. Adicionar PostgreSQL como Referência**

#### **Opção A: Via Interface "Add Reference" (RECOMENDADO)**

1. No serviço **Backend**, vá em **Variables**
2. Procure por um botão **"+ New Variable"** ou **"Add Reference"**
3. Você verá duas opções:
   - **Variable** (texto simples)
   - **Reference** (referência a serviço) ← **ESCOLHA ESTA**

4. Configure:
   ```
   Nome da variável: DATABASE_URL
   Tipo: Reference
   Serviço: Postgres (selecione da lista)
   Variável do serviço: DATABASE_URL
   ```

5. Salve

**Resultado esperado:**
- Railway mostra `DATABASE_URL` com um ícone de link/corrente
- Valor aparece como `${{Postgres.DATABASE_URL}}` **MAS sem aspas**
- Quando você passa o mouse, mostra a URL real

---

#### **Opção B: Via Raw Editor (Se não tiver Add Reference)**

1. No serviço **Backend**, vá em **Variables**
2. Procure por um botão **"Raw Editor"** ou **"Edit as JSON"**
3. Cole este JSON:

```json
{
  "DATABASE_URL": {
    "$ref": "Postgres.DATABASE_URL"
  },
  "REDIS_URL": {
    "$ref": "Redis.REDIS_URL"
  }
}
```

4. Salve

---

#### **Opção C: Via CLI Railway (Se as opções acima não funcionarem)**

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Adicionar variáveis como referências
railway variables --set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables --set REDIS_URL='${{Redis.REDIS_URL}}'
```

**NOTA:** No CLI, use aspas simples externas e `${{...}}` sem aspas duplas.

---

### **3. Adicionar Redis como Referência**

**Mesmo processo da DATABASE_URL:**

1. Variables → Add Reference (ou Raw Editor)
2. Configure:
   ```
   Nome: REDIS_URL
   Tipo: Reference
   Serviço: Redis
   Variável: REDIS_URL
   ```

---

### **4. Verificar Se Está Correto**

#### **Como Saber se Funcionou:**

Na lista de variáveis, você deve ver:

| Variável | Valor Mostrado | Ícone |
|----------|----------------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | 🔗 (ícone de link) |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | 🔗 (ícone de link) |
| `JWT_SECRET` | `fa68e27a-...` | 📝 (texto normal) |
| `NODE_ENV` | `production` | 📝 (texto normal) |

**Diferenças visuais:**
- ✅ **Referência correta:** Ícone de corrente/link ao lado
- ❌ **String literal:** Sem ícone, apenas texto

#### **Ao Passar Mouse Sobre a Variável:**

- ✅ **Correto:** Railway mostra a URL real (ex: `postgresql://user:pass@host:5432/db`)
- ❌ **Errado:** Mostra apenas `${{Postgres.DATABASE_URL}}` como texto

---

### **5. Remover Aspas das Outras Variáveis**

#### **Variáveis que NÃO devem ter aspas:**

1. **PORT**
   ```
   ❌ ERRADO: PORT="${{PORT}}"
   ✅ CORRETO: PORT=${{PORT}}
   ```

2. **Números**
   ```
   ❌ ERRADO: RATE_LIMIT_CEP="30"
   ✅ CORRETO: RATE_LIMIT_CEP=30
   ```

#### **Como Editar:**

1. Clique na variável `PORT`
2. Apague tudo
3. Digite apenas: `${{PORT}}` (Railway vai adicionar aspas automaticamente, mas internamente usa sem aspas)
4. Pressione Enter

**OU**

Use Raw Editor:
```json
{
  "PORT": "${{PORT}}",
  "RATE_LIMIT_CEP": "30",
  "RATE_LIMIT_LOGIN": "5"
}
```

**NOTA:** No Raw Editor, você PRECISA de aspas no JSON, mas Railway processa corretamente.

---

## 🔍 Configuração Completa Correta

### **Via Raw Editor (Copie e Cole):**

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

### **Via Interface (Configuração Visual):**

| Variável | Tipo | Valor |
|----------|------|-------|
| `CORS_ORIGIN` | Variable | `https://beuni-desafio.railway.app` |
| `DATABASE_URL` | **Reference** | **Postgres → DATABASE_URL** |
| `JWT_EXPIRES_IN` | Variable | `7d` |
| `JWT_SECRET` | Variable | `fa68e27a-4848-47e5-8535-af2f25b8866a` |
| `NODE_ENV` | Variable | `production` |
| `PORT` | Variable | `${{PORT}}` |
| `RATE_LIMIT_CEP` | Variable | `30` |
| `RATE_LIMIT_LOGIN` | Variable | `5` |
| `REDIS_URL` | **Reference** | **Redis → REDIS_URL** |
| `VIACEP_API_URL` | Variable | `https://viacep.com.br/ws` |

---

## 📸 Como Deve Parecer na Interface

```
Variables
─────────────────────────────────────────
🔗 DATABASE_URL    ${{Postgres.DATABASE_URL}}
   (passa mouse: postgresql://...)

📝 JWT_SECRET      fa68e27a-4848-47e5...

📝 NODE_ENV        production

🔗 PORT            ${{PORT}}
   (passa mouse: 3001 ou porta atribuída)

🔗 REDIS_URL       ${{Redis.REDIS_URL}}
   (passa mouse: redis://...)
```

---

## ⚙️ Verificar Serviços PostgreSQL e Redis

### **1. Verificar PostgreSQL Existe**

1. No dashboard do projeto
2. Você deve ver 3 serviços:
   ```
   📦 Backend (seu app NestJS)
   🗄️ Postgres (banco de dados)
   🔴 Redis (cache)
   ```

3. Se **Postgres NÃO aparece:**
   - Click **+ New**
   - **Database** → **Add PostgreSQL**
   - Aguarde criação (~30 segundos)

### **2. Verificar Redis Existe**

- Se **Redis NÃO aparece:**
   - Click **+ New**
   - **Database** → **Add Redis**
   - Aguarde criação (~30 segundos)

---

## 🆘 Solução de Problemas

### **Problema: "Add Reference" não aparece**

**Solução:** Use Raw Editor
1. Variables → ⚙️ (ícone configurações) → Raw Editor
2. Cole o JSON acima
3. Salve

---

### **Problema: Variáveis continuam como string**

**Causa:** Você está editando como texto, não como referência

**Solução:**
1. **DELETE** a variável atual
2. Recriar usando **Add Reference** (não "Add Variable")
3. Ou usar Raw Editor com `"$ref": "..."`

---

### **Problema: Railway não substitui `${{...}}`**

**Motivo:** Você criou como Variable (texto) ao invés de Reference

**Teste:**
```bash
# Via Railway CLI
railway run bash
echo $DATABASE_URL
```

**Deve mostrar:**
- ✅ `postgresql://user:pass@host:5432/db` (URL real)
- ❌ `${{Postgres.DATABASE_URL}}` (string literal - ERRADO)

---

## 🎯 Checklist de Configuração

- [ ] Deletei variáveis antigas `DATABASE_URL` e `REDIS_URL`
- [ ] PostgreSQL está criado no projeto
- [ ] Redis está criado no projeto
- [ ] Criei `DATABASE_URL` como **Reference** (não Variable)
- [ ] Criei `REDIS_URL` como **Reference** (não Variable)
- [ ] Variáveis mostram ícone 🔗 ao lado
- [ ] Ao passar mouse, vejo URL real (não `${{...}}`)
- [ ] Salvei e aguardei redeploy (~3 min)
- [ ] Verifiquei logs - sem erro "empty string"

---

## 📊 Antes vs Depois

### **❌ ANTES (Errado):**
```env
DATABASE_URL="${{Postgres.DATABASE_URL}}"  ← String literal
```

**Resultado:**
```
DATABASE_URL resolved to an empty string
```

### **✅ DEPOIS (Correto):**
```json
{
  "DATABASE_URL": {
    "$ref": "Postgres.DATABASE_URL"
  }
}
```

**Resultado:**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## 🚀 Após Corrigir

### **Railway vai automaticamente:**
1. Detectar mudança nas variáveis
2. Fazer redeploy
3. Injetar URLs corretas

### **Logs esperados:**
```
[Nest] LOG [DatabaseModule] Connecting to database...
[Nest] LOG [PrismaService] Prisma connected successfully
[Nest] LOG [RedisService] Redis Client Connected
🚀 Beuni Backend API rodando em: http://localhost:3001
```

**SEM erros:**
- ❌ `DATABASE_URL resolved to an empty string`
- ❌ `connect ECONNREFUSED ::1:6379`

---

## ⏱️ Tempo Total

1. Deletar variáveis antigas: 30 seg
2. Criar referências corretas: 2 min
3. Aguardar redeploy: 3-5 min

**TOTAL: ~7 minutos**

---

## 💡 Dica Extra: Verificar Valores Reais

```bash
# Via Railway CLI
railway run bash

# Ver todas variáveis
env | grep -E 'DATABASE|REDIS|PORT'

# Deve mostrar URLs REAIS, não ${{...}}
```

---

**🎯 Resumo:** Use **Add Reference** (ou Raw Editor com `$ref`) para DATABASE_URL e REDIS_URL, não digite como texto!

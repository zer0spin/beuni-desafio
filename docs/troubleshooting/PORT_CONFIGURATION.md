# ⚡ CORREÇÃO URGENTE - Variável PORT no Railway

## 🎯 O Problema

Você configurou:
```
PORT="${{PORT}}"
```

**Isso está ERRADO** porque as aspas fazem o Railway tratar como string, não como número.

---

## ✅ Solução em 3 Passos (2 minutos)

### **1. Acesse o Railway Dashboard**
```
https://railway.app/dashboard
```

### **2. Vá nas Variáveis do Backend**
1. Clique no seu projeto
2. Clique no serviço do **Backend** (não no PostgreSQL ou Redis)
3. No menu lateral esquerdo, clique em **Variables**

### **3. Corrija a Variável PORT**

**Encontre a linha:**
```
PORT="${{PORT}}"
```

**Apague tudo e coloque apenas:**
```
PORT=${{PORT}}
```

**SEM ASPAS!**

Pressione **Enter** ou clique fora do campo para salvar.

---

## 🔄 Railway Vai Automaticamente

1. Detectar a mudança
2. Fazer redeploy
3. Em ~3-5 minutos a API estará rodando

---

## 📊 Como Verificar se Funcionou

### **Opção 1: Ver Logs**
1. No serviço Backend, clique em **Deployments**
2. Clique no deploy mais recente
3. Role até o final dos logs

**Deve aparecer:**
```
🚀 Beuni Backend API rodando em: http://localhost:3001
```

### **Opção 2: Testar a API**

Encontre a URL do seu backend:
1. Backend service → **Settings** → **Networking**
2. Copie a URL (exemplo: `https://beuni-backend-production.up.railway.app`)

Teste no navegador:
```
https://sua-url.railway.app/api/docs
```

---

## 🐛 Se Ainda Tiver Erro

### **Verifique TODAS as variáveis:**

✅ **CORRETO:**
```env
PORT=${{PORT}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
CORS_ORIGIN=https://beuni-desafio.railway.app
JWT_SECRET=fa68e27a-4848-47e5-8535-af2f25b8866a
NODE_ENV=production
JWT_EXPIRES_IN=7d
RATE_LIMIT_CEP=30
RATE_LIMIT_LOGIN=5
VIACEP_API_URL=https://viacep.com.br/ws
```

❌ **ERRADO (não use aspas em referências Railway):**
```env
PORT="${{PORT}}"                    ❌
DATABASE_URL="${{Postgres.DATABASE_URL}}"  ❌
```

---

## 📋 Checklist Rápido

- [ ] Removi aspas de `PORT=${{PORT}}`
- [ ] Removi aspas de `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] Removi aspas de `REDIS_URL=${{Redis.REDIS_URL}}`
- [ ] Salvei as mudanças (Enter ou clicar fora)
- [ ] Aguardei 3-5 minutos para redeploy
- [ ] Testei a URL: `/api/docs`

---

## 🎯 Resumo

**Apenas remova as aspas das variáveis que usam `${{...}}`**

O Railway substitui automaticamente `${{PORT}}` pelo número da porta. Não precisa de aspas.

---

**⏱️ Tempo estimado:** 2 minutos
**🔄 Redeploy automático:** ~3-5 minutos
**✅ Resultado:** API funcionando!

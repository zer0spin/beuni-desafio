# 🚀 Guia de Setup - Beuni Dashboard

## 📋 Por que o erro do Prisma acontece toda vez?

### ❌ **O Problema**

Quando você executa `npx prisma migrate deploy` **fora do container Docker** (no PowerShell/CMD do Windows), você vê este erro:

```
Error: P1001: Can't reach database server at `postgres:5432`
```

### 🔍 **Explicação Técnica**

O arquivo `.env` no backend contém:

```env
DATABASE_URL="postgresql://beuni:beuni123@postgres:5432/beuni_db"
```

O hostname `postgres:5432` funciona **apenas dentro da rede Docker**. Quando você executa o Prisma no **Windows/PowerShell**, ele não consegue resolver esse nome porque:

1. **Dentro do Docker**: `postgres` = nome do container PostgreSQL na rede interna
2. **Fora do Docker (Windows)**: `postgres` = hostname desconhecido ❌

### ✅ **Solução Correta**

**Execute comandos Prisma SEMPRE dentro do container backend:**

```powershell
# ✅ CORRETO - Dentro do container
docker exec beuni-backend npx prisma generate
docker exec beuni-backend npx prisma migrate deploy
docker exec beuni-backend npm run prisma:seed

# ❌ ERRADO - Fora do container (no Windows)
cd backend
npx prisma migrate deploy  # ❌ Vai falhar!
```

---

## 🎯 Setup Automático (Recomendado)

### **Windows (PowerShell)**

```powershell
# Execute o script de setup
.\setup.ps1
```

### **Linux/Mac (Bash)**

```bash
# Torne o script executável
chmod +x setup.sh

# Execute o script
./setup.sh
```

O script automatiza:
1. ✅ Para containers existentes
2. ✅ Sobe novos containers
3. ✅ Aguarda PostgreSQL ficar pronto
4. ✅ Gera Prisma Client
5. ✅ Aplica migrations
6. ✅ Popula banco com dados de teste

---

## 🛠️ Setup Manual (Passo a Passo)

### **1. Subir os containers**

```powershell
docker-compose up -d
```

Aguarde ~15 segundos para o PostgreSQL inicializar completamente.

### **2. Gerar Prisma Client**

```powershell
docker exec beuni-backend npx prisma generate
```

### **3. Aplicar Migrations**

```powershell
docker exec beuni-backend npx prisma migrate deploy
```

### **4. Popular Banco de Dados**

```powershell
docker exec beuni-backend npm run prisma:seed
```

### **5. Verificar Status**

```powershell
docker ps
```

Você deve ver 4 containers rodando:
- ✅ `beuni-frontend` (porta 3000)
- ✅ `beuni-backend` (porta 3001)
- ✅ `beuni-postgres` (porta 15432)
- ✅ `beuni-redis` (porta 6379)

---

## 🌐 URLs Disponíveis

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface do usuário |
| **Backend** | http://localhost:3001 | API REST |
| **Swagger** | http://localhost:3001/api/docs | Documentação da API |
| **PostgreSQL** | localhost:15432 | Banco de dados (usar DBeaver/pgAdmin) |
| **Redis** | localhost:6379 | Cache |

---

## 🔑 Credenciais de Teste

### Login no Frontend
```
Email:    ana.rh@beunidemo.com
Senha:    123456
```

### Conexão PostgreSQL (DBeaver/pgAdmin)
```
Host:     localhost
Port:     15432
Database: beuni_db
User:     beuni
Password: beuni123
```

---

## 📝 Comandos Úteis

### **Ver logs em tempo real**

```powershell
# Backend
docker logs beuni-backend -f

# Frontend
docker logs beuni-frontend -f

# PostgreSQL
docker logs beuni-postgres -f
```

### **Parar todos os containers**

```powershell
docker-compose down
```

### **Parar e remover volumes (limpar tudo)**

```powershell
docker-compose down -v
```

### **Recriar containers do zero**

```powershell
docker-compose down -v
docker-compose up -d --build
```

### **Resetar banco de dados**

```powershell
docker exec beuni-backend npx prisma migrate reset --force
```

---

## 🐛 Troubleshooting

### **Erro: "Can't reach database server at postgres:5432"**

**Causa**: Você está executando Prisma fora do container.

**Solução**: Use `docker exec` para executar dentro do container:
```powershell
docker exec beuni-backend npx prisma migrate deploy
```

### **Erro: "Port 15432 is already allocated"**

**Causa**: PostgreSQL local ou outro container usando a porta.

**Solução**:
```powershell
# Verificar o que está usando a porta
netstat -ano | findstr :15432

# Parar PostgreSQL local ou mudar porta no docker-compose.yml
```

### **Backend unhealthy**

**Causa**: Migrations não foram aplicadas ou banco não está populado.

**Solução**:
```powershell
docker exec beuni-backend npx prisma migrate deploy
docker exec beuni-backend npm run prisma:seed
docker restart beuni-backend
```

### **Frontend não carrega CSS**

**Causa**: Build do Next.js incompleto.

**Solução**:
```powershell
docker-compose restart frontend
```

---

## 🔄 Workflow de Desenvolvimento

### **Dia a Dia (containers já criados)**

```powershell
# Subir containers
docker-compose up -d

# Trabalhar normalmente...

# Parar containers (fim do dia)
docker-compose down
```

### **Após mudanças no schema Prisma**

```powershell
# Criar nova migration
docker exec beuni-backend npx prisma migrate dev --name sua_mudanca

# Aplicar em outros ambientes
docker exec beuni-backend npx prisma migrate deploy
```

### **Após git pull com mudanças**

```powershell
# Rebuild containers
docker-compose up -d --build

# Aplicar novas migrations
docker exec beuni-backend npx prisma migrate deploy
```

---

## 📊 Estrutura dos Dados Seed

O comando `npm run prisma:seed` cria:

### **1 Organização**
- Nome: Beuni Demo Company
- ID: demo-org-id

### **1 Usuário Admin**
- Email: ana.rh@beunidemo.com
- Senha: 123456
- Role: Admin

### **5 Colaboradores**
- Ana Silva (RH)
- Carlos Santos (TI)
- Maria Oliveira (Marketing)
- João Pereira (Vendas)
- Paula Costa (Financeiro)

### **10 Registros de Envio de Brinde**
- 2 Entregues (ano passado)
- 2 Enviados (mês passado)
- 3 Prontos para envio (este mês)
- 3 Pendentes (próximo mês)

---

## 🎯 Próximos Passos

Após o setup bem-sucedido:

1. ✅ Acesse http://localhost:3000
2. ✅ Faça login com as credenciais de teste
3. ✅ Explore o Dashboard
4. ✅ Veja a documentação da API em http://localhost:3001/api/docs
5. ✅ Leia `/docs/DEVELOPMENT_LOG.md` para entender a arquitetura

---

## 📚 Documentação Adicional

- **[DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md)** - Log completo do desenvolvimento
- **[PRD.md](docs/PRD.md)** - Requisitos do produto
- **[DOCKER_COMPOSE_ANALYSIS.md](docs/DOCKER_COMPOSE_ANALYSIS.md)** - Análise do Docker

---

## 🆘 Precisa de Ajuda?

1. Verifique os logs: `docker logs beuni-backend -f`
2. Consulte a seção **Troubleshooting** acima
3. Leia o **DEVELOPMENT_LOG.md** para problemas conhecidos

---

**Desenvolvido com ❤️ por Claude Code + Marvi**

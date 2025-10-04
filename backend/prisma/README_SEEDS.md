# 🌱 Guia de Seeds - Beuni Platform

Scripts para popular o banco de dados com dados de teste.

---

## 📋 Seeds Disponíveis

### 1. **`seed-simple.cjs`** - Seed Básico ⚡

**Conteúdo:**
- ✅ 50 colaboradores
- ✅ Endereços completos
- ✅ Datas de aniversário variadas

**Tempo de execução:** ~10 segundos

**Quando usar:**
- Testes rápidos
- Desenvolvimento local
- Demonstrações básicas

---

### 2. **`seed-complete.cjs`** - Seed Completo 🎯

**Conteúdo:**
- ✅ 120 colaboradores
- ✅ 40 envios de brinde
- ✅ 30 notificações
- ✅ Dados históricos (2023-2025)

**Tempo de execução:** ~30-40 segundos

**Quando usar:**
- Testes de performance
- Demonstrações completas
- Validação de relatórios
- Testes de dashboard

---

## 🚀 Execução

### **Railway (Produção)**

```bash
# 1. Conectar via SSH ao Railway
railway ssh

# 2. Ir para o diretório da aplicação
cd /app

# 3. Executar seed simples (rápido)
node seed-simple.cjs

# OU seed completo (mais dados)
node seed-complete.cjs

# 4. Verificar dados criados
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.colaborador.count().then(c => {
  console.log('Total colaboradores:', c);
  p.\$disconnect();
});
"
```

### **Docker Local**

```bash
# 1. Copiar seed para o container
docker cp backend/prisma/seed-simple.cjs beuni-backend:/app/

# 2. Executar no container
docker exec beuni-backend node /app/seed-simple.cjs
```

### **Desenvolvimento Local**

```bash
# 1. Ir para o diretório backend
cd backend

# 2. Executar seed
node prisma/seed-simple.cjs

# OU usar npm script (se configurado)
npm run seed
```

---

## 📊 Dados Gerados

### **Colaboradores**

```javascript
{
  nomeCompleto: "Ana Silva",
  dataNascimento: "1995-03-15",
  cargo: "Dev Frontend",
  departamento: "Tecnologia",
  endereco: {
    cep: "01310100",
    logradouro: "Avenida Paulista",
    numero: "523",
    cidade: "São Paulo",
    uf: "SP",
    bairro: "Bela Vista"
  }
}
```

**Departamentos disponíveis:**
- Tecnologia
- Desenvolvimento
- Design
- Produto
- Qualidade
- Infraestrutura

**Cargos disponíveis:**
- Dev Frontend
- Dev Backend
- Fullstack Developer
- UX Designer
- Product Manager
- QA Engineer
- DevOps Engineer

**Cidades:**
- São Paulo/SP
- Rio de Janeiro/RJ
- Belo Horizonte/MG
- Curitiba/PR
- Porto Alegre/RS

### **Envios de Brinde** (seed completo)

```javascript
{
  colaboradorId: "...",
  anoEnvio: 2024,
  mesEnvio: 10,
  tipoBrinde: "Cesta Gourmet",
  status: "PRONTO_PARA_ENVIO",
  dataPrevisaoEnvio: "2024-10-15"
}
```

**Tipos de brinde:**
- Cesta Gourmet
- Vale Presente R$100
- Produto Personalizado
- Voucher Digital

**Status possíveis:**
- PENDENTE
- PRONTO_PARA_ENVIO
- ENVIADO
- ENTREGUE

### **Notificações** (seed completo)

```javascript
{
  usuarioId: "...",
  tipo: "ANIVERSARIO",
  titulo: "🎂 Aniversário de Ana Silva",
  mensagem: "Ana Silva faz aniversário em breve!",
  lida: false
}
```

**Tipos:**
- ANIVERSARIO (🎂)
- ENVIO_BRINDE (🎁)
- SISTEMA (📊)

---

## 🧪 Testes e Validação

### **Verificar dados criados**

```bash
# Contar colaboradores
railway ssh "cd /app && node -e \"
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function check() {
  const colaboradores = await p.colaborador.count();
  const envios = await p.envioBrinde.count();
  const notificacoes = await p.notificacao.count();
  console.log('Colaboradores:', colaboradores);
  console.log('Envios:', envios);
  console.log('Notificações:', notificacoes);
  await p.\\\$disconnect();
}
check();
\""
```

### **Ver aniversariantes do mês**

```bash
railway ssh "cd /app && node -e \"
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function check() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const colaboradores = await p.colaborador.findMany({
    where: {
      dataNascimento: {
        gte: new Date(2000, month - 1, 1),
        lt: new Date(2000, month, 1)
      }
    },
    select: { nomeCompleto: true, dataNascimento: true }
  });
  console.log('Aniversariantes deste mês:', colaboradores.length);
  colaboradores.forEach(c => console.log('-', c.nomeCompleto));
  await p.\\\$disconnect();
}
check();
\""
```

---

## 🗑️ Limpar Dados

### **Remover apenas dados de teste** (mantém admin)

```bash
railway ssh "cd /app && node -e \"
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function clean() {
  await p.notificacao.deleteMany({});
  await p.envioBrinde.deleteMany({});
  await p.colaborador.deleteMany({});
  console.log('✅ Dados de teste removidos');
  await p.\\\$disconnect();
}
clean();
\""
```

### **Reset completo do banco** (⚠️ CUIDADO!)

```bash
# Isso vai apagar TUDO, incluindo usuários
railway ssh "cd /app && npx prisma migrate reset --force"
```

---

## 🔧 Customização

### **Modificar quantidade de colaboradores**

Edite o arquivo `seed-simple.cjs`:

```javascript
// Linha 32: Altere o valor de 50 para o desejado
for (let i = 1; i <= 100; i++) {  // Era 50, agora 100
```

### **Adicionar novos departamentos**

```javascript
const departamentos = [
  'Tecnologia',
  'Desenvolvimento',
  'Seu Novo Departamento',  // Adicione aqui
];
```

### **Adicionar novas cidades**

```javascript
const cidades = [
  {cep:'88010500', logradouro:'Avenida Beira Mar', cidade:'Florianópolis', uf:'SC', bairro:'Centro'},
  // Adicione mais cidades aqui
];
```

---

## 📝 Notas Importantes

1. **Organização**: Os seeds usam a primeira organização encontrada no banco
2. **Duplicatas**: O seed ignora erros de duplicação
3. **Performance**: O seed completo pode demorar ~40s em produção
4. **Incrementalidade**: Executar múltiplas vezes adiciona mais dados

---

## 🐛 Troubleshooting

### Erro: "Organização não encontrada"

**Causa**: Banco vazio, sem organização criada

**Solução**:
```bash
# Criar organização e admin primeiro
railway ssh "cd /app && node create-user.cjs"
```

### Erro: "Cannot read properties of undefined"

**Causa**: Prisma Client não gerado

**Solução**:
```bash
railway ssh "cd /app && npx prisma generate && node seed-simple.cjs"
```

### Erro: "Foreign key constraint"

**Causa**: Endereço ou organização não existem

**Solução**: Execute o seed-simple.cjs que cria endereços automaticamente

---

## 📊 Estatísticas de Performance

| Seed | Colaboradores | Tempo | Memória |
|------|--------------|-------|---------|
| Simple | 50 | ~10s | ~50MB |
| Complete | 120 | ~40s | ~120MB |

---

## 🎯 Próximos Passos

Após executar o seed:

1. ✅ Acessar https://beuni-frontend-one.vercel.app
2. ✅ Login: `admin@beuni.com` / `Admin@123`
3. ✅ Ver dashboard com dados reais
4. ✅ Testar relatórios e filtros
5. ✅ Validar envios de brinde

---

**Última atualização**: 2025-10-04
**Seeds testados e funcionando no Railway**: ✅

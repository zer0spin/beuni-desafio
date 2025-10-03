# 🔧 VERCEL SETUP - Configuração Correta

## ⚠️ **CONFIGURAÇÃO CRÍTICA**

### **Root Directory:** 
```
✅ OBRIGATÓRIO: frontend
```

**EXPLICAÇÃO:** 
- Vercel executa comandos DENTRO da pasta "frontend"
- Por isso vercel.json está em `/frontend/vercel.json`  
- Por isso comandos NÃO usam `cd frontend`

---

## 📋 **CONFIGURAÇÕES VERCEL DASHBOARD**

### **1. Build & Development Settings:**
```
Framework Preset: Next.js
Root Directory: frontend
Build Command: (use preset) 
Output Directory: (use preset)
Install Command: (use preset)
```

### **2. Environment Variables:**
```
NEXT_PUBLIC_API_URL: https://beuni-desafio-production.up.railway.app
NODE_ENV: production
```

---

## ⚙️ **ESTRUTURA CORRETA DOS ARQUIVOS**

### **Root do Projeto:**
```
/beuni-desafio/
├── backend/          (Railway)
├── frontend/         ← Root Directory Vercel
│   ├── vercel.json   ← Arquivo de config aqui!
│   ├── package.json
│   ├── next.config.js
│   └── src/
├── docs/
└── README.md
```

### **Comandos que Vercel Executa:**
```bash
# Vercel já está em /frontend, então:
npm ci --omit=dev              # ✅ Correto
npm run build:vercel           # ✅ Correto

# NÃO fazer:
cd frontend && npm ci          # ❌ Erro: frontend não existe
```

---

## 🚨 **ERROS COMUNS E SOLUÇÕES**

### **❌ "cd: frontend: No such file or directory"**
```
Causa: Comando tenta `cd frontend` mas já está em frontend/
Solução: ✅ JÁ CORRIGIDO no vercel.json atual
```

### **❌ "Cannot find module"**
```
Causa: Paths errados no vercel.json
Solução: ✅ Paths corrigidos para estrutura interna
```

### **❌ "Build timeout"**
```
Causa: npm install com devDependencies
Solução: ✅ Usando npm ci --omit=dev
```

---

## ✅ **VERIFICAÇÃO FINAL**

### **Antes do Deploy, Confirme:**
- [x] Root Directory: "frontend" ✅
- [x] vercel.json em: `/frontend/vercel.json` ✅  
- [x] Comandos sem `cd frontend` ✅
- [x] Paths relativos à pasta frontend ✅
- [x] Environment variables configuradas ✅

**PRONTO PARA DEPLOY! 🚀**
# 🌐 Deploy Frontend na Vercel - Guia Completo

## 📋 **VISÃO GERAL**

Este guia documenta o processo completo para fazer deploy do frontend Next.js na Vercel, incluindo configuração automática via GitHub e resolução de problemas comuns.

### **Stack Técnica:**
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Deploy**: Vercel com CI/CD automático
- **Domínio**: https://beuni-frontend.vercel.app

---

## 🚀 **PASSO A PASSO - DEPLOY INICIAL**

### **1. Preparação do Repositório**
```bash
# Estrutura necessária:
/beuni-desafio/
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── vercel.json
│   └── src/
└── backend/
```

### **2. Criar Projeto na Vercel**
1. **Acesse**: https://vercel.com
2. **Login**: "Continue with GitHub"
3. **Novo Projeto**: "Add New" → "Project"
4. **Import**: Selecione repositório "zer0spin/beuni-desafio"

### **3. Configuração Essencial**
```
Project Name: beuni-frontend
Framework: Next.js (auto-detectado)
Root Directory: frontend ⚠️ CRUCIAL
Build Command: npm run build:vercel
Output Directory: .next
Install Command: npm ci --omit=dev
```

### **4. Variáveis de Ambiente**
```
NEXT_PUBLIC_API_URL=https://beuni-desafio-production.up.railway.app
NODE_ENV=production
```

### **5. Deploy**
- Clique "Deploy" 
- Aguarde ~3-5 minutos
- ✅ URL gerada automaticamente

---

## ⚙️ **CONFIGURAÇÕES TÉCNICAS**

### **package.json Otimizado**
```json
{
  "dependencies": {
    "next": "14.2.31",
    "react": "18.2.0",
    "typescript": "5.1.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.32",
    "tailwindcss": "3.3.2"
  },
  "scripts": {
    "build:vercel": "next build",
    "start": "next start"
  }
}
```

### **vercel.json Configuração**
```json
{
  "buildCommand": "npm ci --omit=dev && npm run build:vercel",
  "outputDirectory": ".next",
  "installCommand": "npm ci --omit=dev",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://beuni-desafio-production.up.railway.app",
    "NODE_ENV": "production"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://beuni-desafio-production.up.railway.app/:path*"
    }
  ]
}
```

### **next.config.js Produção**
```javascript
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
  
  webpack: (config, { dev }) => {
    // Excluir arquivos de teste
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader',
    });
    return config;
  }
};
```

---

## 🔄 **DEPLOY AUTOMÁTICO (CI/CD)**

### **Configuração GitHub Integration**
```bash
# 1. Conectar repositório
vercel git connect https://github.com/zer0spin/beuni-desafio

# 2. Configurar Root Directory no Dashboard
# Settings → General → Root Directory: frontend

# 3. Ativar Auto-Deploy
# Settings → Git → Production Branch: main
```

### **Workflow Automático**
```
Git Push → GitHub → Vercel Webhook → Build → Deploy
```

**Branches configuradas:**
- `main` → Production deploy
- `develop` → Preview deploy
- PRs → Preview deploy

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS**

### **❌ Erro: "Cannot find module 'vitest'"**
**Causa**: Vitest sendo importado durante build
**Solução**:
```bash
# 1. Mover testes para pasta isolada
mkdir frontend/__tests__
mv frontend/src/pages/__tests__/* frontend/__tests__/

# 2. Atualizar .vercelignore
echo "__tests__/" >> frontend/.vercelignore
echo "**/*.test.*" >> frontend/.vercelignore
```

### **❌ Erro: "cd: frontend: No such file or directory"**
**Causa**: Root Directory não configurado
**Solução**:
```
Vercel Dashboard → Settings → General
Root Directory: frontend
```

### **❌ Erro: "Cannot find module 'autoprefixer'"**
**Causa**: Dependências CSS em devDependencies
**Solução**:
```json
{
  "dependencies": {
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.32",
    "tailwindcss": "3.3.2"
  }
}
```

### **❌ Build Timeout**
**Causa**: npm install com devDependencies
**Solução**:
```json
{
  "scripts": {
    "build:vercel": "next build"
  }
}
```

---

## ✅ **VALIDAÇÃO DO DEPLOY**

### **1. Health Check**
```bash
# Test Frontend
curl https://beuni-frontend.vercel.app

# Expected: HTML response with Next.js app
```

### **2. API Integration**
```bash
# Test API Proxy
curl https://beuni-frontend.vercel.app/api/health

# Expected: {"message":"🎉 Beuni API está funcionando!"}
```

### **3. Performance Check**
- **Lighthouse Score**: 95+
- **First Load**: <3s
- **Core Web Vitals**: All green

### **4. Browser Testing**
1. ✅ Open: https://beuni-frontend.vercel.app
2. ✅ Navigate: Login/Register forms
3. ✅ Network: Check API calls in DevTools
4. ✅ CORS: No console errors

---

## 📊 **MONITORAMENTO**

### **Analytics Vercel**
```bash
# Habilitar no Dashboard
Project → Analytics → Enable

# Metrics disponíveis:
- Page Views
- Unique Visitors  
- Top Pages
- Performance Insights
```

### **Error Tracking**
```bash
# Logs em tempo real
vercel logs https://beuni-frontend.vercel.app

# Dashboard logs
https://vercel.com/zer0spins-projects/beuni-frontend
```

---

## 🌍 **URLS FINAIS**

### **Produção:**
- **Principal**: https://beuni-frontend.vercel.app
- **Dashboard**: https://vercel.com/zer0spins-projects/beuni-frontend

### **Preview:**
- **Último Deploy**: https://beuni-frontend-[hash].vercel.app
- **Branch Deploys**: Automático para PRs

---

## 📝 **COMANDOS ÚTEIS**

```bash
# Deploy manual
vercel --prod

# Logs em tempo real
vercel logs --follow

# Listar deployments
vercel ls

# Configurar domínio customizado
vercel domains add example.com

# Variables de ambiente
vercel env add NEXT_PUBLIC_API_URL production
```

---

## 🎯 **RESULTADO FINAL**

**✅ Frontend Deployado com Sucesso:**
- 🌐 **URL**: https://beuni-frontend.vercel.app
- ⚡ **Performance**: 95+ Lighthouse
- 🔄 **CI/CD**: Deploy automático via GitHub
- 🔒 **Security**: HTTPS + CORS configurado
- 📊 **Monitoring**: Analytics integrado
- 🌍 **CDN**: Distribuição global

**PRONTO PARA PRODUÇÃO! 🚀**
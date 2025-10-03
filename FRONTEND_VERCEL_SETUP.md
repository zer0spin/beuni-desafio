# 🎨 Frontend Deployment - Vercel + Railway Integration

## 🏗️ **Arquitetura Completa da Aplicação**

### **📊 Visão Geral do Sistema:**

```
Internet
   │
   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│                     🌐 Vercel                                   │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │ Components  │  │   Hooks     │             │
│  │   /login    │  │ UserForm    │  │ useAuth     │             │
│  │   /dashboard│  │ BirthdayList│  │ useAPI      │             │
│  │   /employees│  │ Charts      │  │ useQuery    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  Technologies: Next.js 14, React 18, TypeScript, TailwindCSS   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS API Calls
                              │ axios/fetch requests
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│                     🚂 Railway                                  │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Controllers │  │  Services   │  │    Guards   │             │
│  │ AuthCtrl    │  │ UserService │  │ JwtGuard    │             │
│  │ EmployeeCtrl│  │ PrismaServ  │  │ CSRF Guard  │             │
│  │ BirthdayCtrl│  │ RedisServ   │  │ ThrottleG   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  Technologies: NestJS, TypeScript, Prisma, JWT                 │
│  URL: https://beuni-desafio-production.up.railway.app          │
└─────────────────────────────┬─────────────┬─────────────────────┘
                              │             │
                    PostgreSQL│             │Redis
                              ▼             ▼
┌─────────────────┐                   ┌─────────────────┐
│   DATABASE      │                   │     CACHE       │
│  🐘 Railway     │                   │   ⚡ Railway     │
│                 │                   │                 │
│ • Users         │                   │ • Sessions      │
│ • Organizations │                   │ • Rate Limits   │
│ • Employees     │                   │ • Temp Data     │
│ • Birthdays     │                   │ • API Cache     │
│ • Gift Shipments│                   │                 │
└─────────────────┘                   └─────────────────┘
```

---

## 🔗 **Como as Conexões Funcionam:**

### **1. Frontend → Backend (API Calls)**
```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Para cookies JWT
  headers: {
    'Content-Type': 'application/json',
  }
})

// Exemplo de uso:
const response = await api.post('/auth/login', { email, password })
const employees = await api.get('/colaboradores')
```

### **2. Backend → Database (Prisma ORM)**
```typescript
// backend/src/shared/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
    console.log('🗄️ Conectado ao banco de dados PostgreSQL')
  }
}

// Exemplo de uso no service:
const users = await this.prisma.usuario.findMany({
  where: { organizationId: orgId }
})
```

### **3. Backend → Cache (Redis Client)**
```typescript
// backend/src/shared/redis.service.ts
@Injectable()
export class RedisService {
  private client: RedisClientType

  async onModuleInit() {
    this.client = createClient({ url: process.env.REDIS_URL })
    await this.client.connect()
    console.log('🗄️ Redis connection established successfully')
  }
}
```

### **4. User → Application (Browser Access)**
```bash
# URLs Públicas:
Frontend: https://beuni-app.vercel.app
Backend:  https://beuni-desafio-production.up.railway.app
Swagger:  https://beuni-desafio-production.up.railway.app/api/docs
```

---

## 🚀 **Deployment do Frontend na Vercel**

### **Pré-requisitos:**
- ✅ Backend funcionando no Railway (já temos!)
- ✅ Repository no GitHub (já temos!)
- ⚠️ Conta na Vercel (criar se necessário)

### **Passo 1: Criar Conta Vercel**

1. **Acesse [vercel.com](https://vercel.com)**
2. **Sign up with GitHub** (conecte sua conta GitHub)
3. **Authorize Vercel** para acessar seus repositórios

### **Passo 2: Import Project**

1. **Dashboard Vercel → "Add New" → "Project"**
2. **Import Git Repository: `zer0spin/beuni-desafio`**
3. **Configure Project:**
   ```
   Project Name: beuni-frontend
   Framework: Next.js (auto-detected)
   Root Directory: frontend  ← IMPORTANTE!
   Build Command: npm run build (auto)
   Output Directory: .next (auto)
   Install Command: npm install (auto)
   ```

### **Passo 3: Environment Variables**

**Na configuração do projeto Vercel, adicione:**

```env
# API Connection
NEXT_PUBLIC_API_URL=https://beuni-desafio-production.up.railway.app

# App Configuration  
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Beuni
NEXT_PUBLIC_APP_VERSION=1.0.0

# Optional: Analytics/Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=auto
```

### **Passo 4: Deploy Settings**

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs"
}
```

### **Passo 5: Deploy & Test**

1. **Click "Deploy"** (aguarde ~3-5 minutos)
2. **Vercel gerará URL automática**: `beuni-frontend-xyz.vercel.app`
3. **Teste conexão frontend → backend**

---

## 🔧 **Configurações Necessárias**

### **Frontend Configuration (Next.js)**

**Arquivo: `frontend/next.config.js`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ]
  },
  images: {
    domains: ['beuni-desafio-production.up.railway.app'],
  },
}

module.exports = nextConfig
```

**Arquivo: `frontend/src/lib/api.ts`**
```typescript
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Request interceptor para logs
api.interceptors.request.use((config) => {
  console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

// Response interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)
```

### **Backend CORS Configuration**

**Arquivo: `backend/src/main.ts`** (já configurado)
```typescript
// CORS configuration with production domains
app.enableCors({
  origin: [
    'http://localhost:3000',  // Local development
    'https://beuni-frontend-xyz.vercel.app',  // Vercel production
    process.env.FRONTEND_URL // Railway env var
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
})
```

---

## 🌐 **URLs Finais da Aplicação**

Após deploy completo, você terá:

### **🎨 Frontend (Vercel)**
```
Production: https://beuni-frontend.vercel.app
Preview:    https://beuni-frontend-git-main.vercel.app
```

### **🚂 Backend (Railway)**
```
API:        https://beuni-desafio-production.up.railway.app
Swagger:    https://beuni-desafio-production.up.railway.app/api/docs
Health:     https://beuni-desafio-production.up.railway.app/health
```

### **🗄️ Database (Railway)**
```
PostgreSQL: postgres://user:pass@postgres.railway.internal:5432/railway
Redis:      redis://default:pass@redis.railway.internal:6379
```

---

## 📋 **Checklist de Deploy Frontend**

- [ ] **Vercel Account**: Conta criada e conectada ao GitHub
- [ ] **Project Import**: Repositório importado com Root Directory `frontend`
- [ ] **Environment Variables**: `NEXT_PUBLIC_API_URL` configurada
- [ ] **Build Success**: Deploy sem erros (verde ✅)
- [ ] **Domain Generated**: URL pública funcionando
- [ ] **API Connection**: Frontend conectando ao backend Railway
- [ ] **CORS Configured**: Backend permitindo origem Vercel
- [ ] **Custom Domain**: (Opcional) Domínio personalizado

---

## 🎯 **Testing & Validation**

### **1. Health Check Endpoints**
```bash
# Backend Health
curl https://beuni-desafio-production.up.railway.app/health

# Frontend Health (home page)
curl https://beuni-frontend.vercel.app
```

### **2. API Integration Test**
```bash
# Test login endpoint from frontend
curl -X POST https://beuni-frontend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beuni.com","password":"admin123"}'
```

### **3. Browser Testing**
```
1. Open: https://beuni-frontend.vercel.app
2. Navigate: Login page → Dashboard
3. Test: CRUD operations (Create/Read/Update/Delete)
4. Verify: Data persistence across sessions
```

---

## 🚨 **Troubleshooting Common Issues**

### **Frontend Build Errors**
```bash
# Error: Module not found
Solution: Check frontend/package.json dependencies

# Error: Environment variable undefined
Solution: Add NEXT_PUBLIC_API_URL to Vercel env vars

# Error: Build timeout
Solution: Check frontend/next.config.js for heavy operations
```

### **API Connection Issues**
```bash
# Error: CORS blocked
Solution: Add Vercel domain to backend CORS origins

# Error: Network timeout
Solution: Check Railway backend status and logs

# Error: 404 API endpoints
Solution: Verify NEXT_PUBLIC_API_URL includes protocol (https://)
```

### **Performance Issues**
```bash
# Slow API responses
Solution: Enable Redis caching on backend

# Large bundle size
Solution: Implement dynamic imports in frontend

# SEO issues
Solution: Configure Next.js metadata and SSR
```

---

## 🎊 **Final Architecture - Production Ready**

```
👥 Users
   │
   ▼ HTTPS
🌐 Frontend (Vercel)
   │ • Next.js SSR/SSG
   │ • React Components  
   │ • TailwindCSS
   │ • TypeScript
   │
   ▼ API Calls (HTTPS)
🚂 Backend (Railway)
   │ • NestJS REST API
   │ • JWT Authentication
   │ • Rate Limiting
   │ • Swagger Docs
   │
   ├─▶ 🐘 PostgreSQL (Railway)
   │    • User data
   │    • Business logic
   │    • Prisma ORM
   │
   └─▶ ⚡ Redis (Railway)
        • Sessions
        • Cache
        • Rate limits
```

**🎯 Result: Enterprise-grade, scalable web application ready for production use!**
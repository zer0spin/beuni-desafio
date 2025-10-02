# 📋 PRD - Product Requirements Document
## Beuni: Corporate Birthday Management Platform

**Version:** 1.0
**Date:** 09/28/2025
**Author:** Beuni Team
**Status:** MVP Developed

---

## 🎯 Executive Vision

### **Problem**
Companies lose valuable employee engagement opportunities by forgetting birthdays, resulting in:
- Decreased team morale
- Lost recognition moments
- Error-prone manual processes
- Lack of gift standardization
- Absence of engagement metrics

### **Solution**
Beuni is a complete SaaS platform that automates corporate birthday management, offering:
- Centralized employee registry
- Intelligent birthday calendar
- Automated personalized gift delivery
- Dashboard with engagement metrics
- Robust API for integrations

### **Value Proposition**
> "Transform every birthday into a special recognition moment, strengthening organizational culture through technology."

---

## 🏢 Market Context

### **Target Audience**
- **Primary:** Companies with 50-500 employees
- **Secondary:** Growing startups (20-50 people)
- **Tertiary:** Corporations (500+ employees)

### **Personas**
1. **Ana Silva - HR Manager** (Primary Persona)
   - Age: 32 years
   - Responsibilities: People management, organizational culture
   - Pain Points: Manual processes, forgetting important dates
   - Goals: Automate processes, improve engagement

2. **Carlos Santos - People Director**
   - Age: 45 years
   - Responsibilities: People strategy, benefits budget
   - Pain Points: Lack of metrics, uncontrolled costs
   - Goals: Measurable ROI, process standardization

---

## 🎯 Product Objectives

### **Primary Objectives**
1. **Complete Automation:** Eliminate 100% of manual processes
2. **Zero Forgotten Birthdays:** Ensure no birthday is missed
3. **Standardization:** Create consistent experience for all employees
4. **Metrics:** Provide insights on engagement and costs

### **Secondary Objectives**
1. **Integration:** Connect with existing HR systems
2. **Personalization:** Allow gift customization by level/position
3. **Scalability:** Support companies of any size
4. **Compliance:** Meet LGPD/GDPR requirements

### **Success KPIs**
- **Adoption Rate:** >90% of employees registered
- **Engagement:** >95% successful deliveries
- **Time Savings:** 10+ hours/month saved per company
- **NPS:** >70 points
- **Churn Rate:** <5% annually

---

## 🔧 Technical Features

### **Core Features (MVP Implemented)**

#### **1. Authentication System**
- **JWT-based authentication** with refresh tokens
- **Multi-tenant architecture** (organization isolation)
- **Rate limiting** (5 attempts/minute)
- **Password security** with bcrypt hash
- **Session management** with secure cookies

#### **2. Employee Management**
```typescript
interface Colaborador {
  id: string;
  nomeCompleto: string;
  dataNascimento: Date;
  cargo: string;
  departamento: string;
  endereco: Endereco;
  organizationId: string;
  createdAt: Date;
}
```
- **Complete CRUD** for employees
- **Data validation** with class-validator
- **Soft delete** for audit trails
- **Advanced search** by department/position

#### **3. Birthday Calendar**
- **Monthly view** with period celebrants
- **Early alerts** (7 days before)
- **Department and position filters**
- **Export to external calendars** (ICS)

#### **4. Gift Delivery System**
```typescript
interface EnvioBrinde {
  id: string;
  colaboradorId: string;
  anoAniversario: number;
  status: 'PENDENTE' | 'PRONTO_PARA_ENVIO' | 'ENVIADO';
  dataGatilhoEnvio?: Date;
  dataEnvioRealizado?: Date;
  observacoes?: string;
}
```
- **Temporal trigger-based automation**
- **Well-defined states** with audited transitions
- **Postal service integration** (prepared for APIs)
- **Real-time delivery tracking**

#### **5. CEP Integration**
- **Redis cache** for performance
- **Specific rate limiting** (30 req/min)
- **Fallback strategies** for unavailable APIs
- **Brazilian address validation**

### **Architecture Highlights**

#### **Backend (NestJS)**
```
├── Modules
│   ├── Auth (JWT + Passport)
│   ├── Colaboradores (CRUD + Business Logic)
│   ├── CEP (External API + Cache)
│   ├── EnvioBrindes (Automation Engine)
│   └── Organizations (Multi-tenant)
├── Infrastructure
│   ├── Prisma ORM (Type-safe DB)
│   ├── Redis Cache (Performance)
│   ├── Swagger Docs (API Documentation)
│   └── Health Checks (Monitoring)
```

#### **Frontend (Next.js)**
```
├── Pages
│   ├── Landing Page (Marketing)
│   ├── Login/Register (Auth)
│   └── Dashboard (Protected)
├── Components
│   ├── UI Library (Tailwind CSS)
│   ├── Forms (React Hook Form)
│   └── Data Display (Tables, Charts)
├── State Management
│   ├── React Query (Server State)
│   ├── Cookies (Auth Persistence)
│   └── Context API (Global State)
```

#### **Infrastructure (Docker)**
```
├── PostgreSQL (Primary Database)
├── Redis (Cache + Sessions)
├── NestJS Backend (API Server)
├── Next.js Frontend (Web App)
├── Network Bridge (Internal Communication)
└── Health Monitoring (Auto-restart)
```

---

## 🔐 Security Requirements

### **Authentication & Authorization**
- **JWT tokens** with configurable expiration (7 days)
- **Role-based access control** (Admin, Manager, Viewer)
- **API key authentication** for integrations
- **Session invalidation** on logout

### **Data Protection**
- **Encryption at rest** (database level)
- **HTTPS enforcement** (SSL/TLS)
- **Input sanitization** for XSS prevention
- **SQL injection protection** via Prisma ORM

### **Compliance**
- **LGPD compliance** (right to be forgotten)
- **Audit logs** for all operations
- **Data minimization** (only necessary data)
- **Explicit consent management**

### **Infrastructure Security**
- **Container isolation** (Docker networks)
- **Environment variables** for secrets
- **Rate limiting** per endpoint
- **Restrictive CORS policy**

---

## 📊 Data Model

### **Core Entities**

```sql
-- Organizations (Multi-tenant)
CREATE TABLE organizacoes (
  id VARCHAR PRIMARY KEY,
  nome VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users (Admins/Managers)
CREATE TABLE usuarios (
  id VARCHAR PRIMARY KEY,
  nome VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  senha_hash VARCHAR NOT NULL,
  organization_id VARCHAR REFERENCES organizacoes(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Addresses (Normalized)
CREATE TABLE enderecos (
  id VARCHAR PRIMARY KEY,
  cep VARCHAR(8) NOT NULL,
  logradouro VARCHAR NOT NULL,
  numero VARCHAR,
  complemento VARCHAR,
  bairro VARCHAR NOT NULL,
  cidade VARCHAR NOT NULL,
  uf VARCHAR(2) NOT NULL
);

-- Employees (Core Business Entity)
CREATE TABLE colaboradores (
  id VARCHAR PRIMARY KEY,
  nome_completo VARCHAR NOT NULL,
  data_nascimento DATE NOT NULL,
  cargo VARCHAR NOT NULL,
  departamento VARCHAR NOT NULL,
  address_id VARCHAR REFERENCES enderecos(id),
  organization_id VARCHAR REFERENCES organizacoes(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gift Deliveries (Automation Engine)
CREATE TABLE envio_brindes (
  id VARCHAR PRIMARY KEY,
  colaborador_id VARCHAR REFERENCES colaboradores(id),
  ano_aniversario INTEGER NOT NULL,
  status ENUM('PENDENTE', 'PRONTO_PARA_ENVIO', 'ENVIADO'),
  data_gatilho_envio TIMESTAMP,
  data_envio_realizado TIMESTAMP,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Business Rules**
1. **One employee per organization** (soft delete for history)
2. **One delivery per year per employee** (unique constraint)
3. **Normalized addresses** (reuse between employees)
4. **Complete audit** (created_at, updated_at in all tables)

---

## 🚀 Feature Roadmap

### **Phase 1: MVP (✅ Implemented)**
- [x] Multi-tenant authentication
- [x] Employee CRUD
- [x] Birthday calendar
- [x] Basic delivery system
- [x] CEP integration
- [x] Initial dashboard

### **Phase 2: Automation (Next 3 months)**
- [ ] **Automatic email notifications**
- [ ] **WhatsApp integration** for notifications
- [ ] **Advanced scheduling** (custom triggers)
- [ ] **Bulk import** of employees (CSV/Excel)
- [ ] **Mobile app** (React Native)

### **Phase 3: Intelligence (Next 6 months)**
- [ ] **AI-powered gift suggestions** based on profile
- [ ] **Sentiment analysis** of feedback
- [ ] **Predictive analytics** for churn prevention
- [ ] **Integration marketplace** (Slack, Teams, etc.)
- [ ] **Advanced reporting** (BI dashboard)

### **Phase 4: Enterprise (Next 12 months)**
- [ ] **SSO integration** (SAML, OIDC)
- [ ] **Advanced RBAC** with custom permissions
- [ ] **White-label solution** for resellers
- [ ] **API ecosystem** with webhooks
- [ ] **Global expansion** (multi-language, multi-currency)

---

## 📈 Metrics and Analytics

### **Business Metrics**
- **Active employees** per organization
- **Gift delivery rate** (%)
- **Average processing time**
- **Cost per employee** monthly
- **Engagement rate** (positive feedback)

### **Technical Metrics**
- **API response time** (<100ms p95)
- **Uptime** (99.9% SLA)
- **Error rate** (<0.1%)
- **Cache hit ratio** (Redis >90%)
- **Database performance** (query time <50ms)
- **Test coverage** (>90% unit tests, >80% integration)
- **Code quality** (TypeScript strict, ESLint zero warnings)

### **User Experience Metrics**
- **Page load time** (<2s)
- **Task completion rate** (>95%)
- **User satisfaction** (NPS >70)
- **Support ticket volume** (<5% users/month)
- **Feature adoption** per functionality

---

## 🔄 Integrations

### **Implemented**
- **ViaCEP API** - Address lookup
- **JWT Authentication** - Robust security
- **Redis Cache** - Performance optimization

### **Planned (Phase 2)**
- **SendGrid** - Transactional email
- **Twilio** - SMS/WhatsApp notifications
- **Postal Service API** - Delivery tracking
- **BambooHR** - Employee synchronization
- **Slack/Teams** - Internal notifications

### **API-First Architecture**
```typescript
// REST API Structure
/api/v1/
├── /auth/          // Authentication endpoints
├── /colaboradores/ // Employee management
├── /aniversarios/  // Birthday calendar
├── /envios/        // Gift delivery tracking
├── /relatorios/    // Analytics & reports
└── /webhooks/      // External integrations
```

---

## 💰 Business Model

### **Pricing Strategy**
- **Freemium:** Up to 10 employees (R$ 0/month)
- **Professional:** Up to 100 employees (R$ 89/month)
- **Enterprise:** Unlimited employees (R$ 299/month)
- **Custom:** White-label solutions (quote)

### **Revenue Streams**
1. **SaaS Subscription** (80% of expected revenue)
2. **Professional Services** (implementation, training)
3. **API Usage** (advanced integrations)
4. **Marketplace Commission** (gift partners)

### **Cost Structure**
- **Infrastructure:** AWS/GCP (~15% revenue)
- **Development:** Technical team (~40% revenue)
- **Sales & Marketing:** Acquisition (~25% revenue)
- **Operations:** Support and admin (~10% revenue)
- **Margin:** ~10% EBITDA target

---

## 🎯 Success Criteria

### **Technical Success**
- [x] **100% API endpoints** functional
- [x] **Zero downtime** deployment process
- [x] **Comprehensive testing framework** (Vitest configured)
- [x] **Security best practices** implemented
- [x] **Scalable architecture** prepared for growth
- [x] **Test coverage >90%** configured for CI/CD

### **Business Success**
- [ ] **50+ companies** using the platform (6 months)
- [ ] **5000+ employees** registered (12 months)
- [ ] **95% customer satisfaction** (ongoing)
- [ ] **<5% monthly churn** (ongoing)
- [ ] **Break-even** in 18 months

### **User Success**
- [x] **Intuitive interface** (landing page + dashboard)
- [x] **Fast onboarding** (<5 minutes for first setup)
- [x] **Reliable automation** (zero birthdays missed)
- [ ] **Measurable ROI** for clients
- [ ] **Strong word-of-mouth** growth

---

## 🔧 Technical Considerations

### **Performance Requirements**
- **API Response Time:** <100ms (95th percentile)
- **Page Load Time:** <2 seconds
- **Database Queries:** <50ms average
- **Cache Hit Ratio:** >90% (Redis)
- **Concurrent Users:** 1000+ simultaneous

### **Quality Assurance Requirements**
- **Test Framework:** Vitest for frontend and backend
- **Unit Test Coverage:** >90% code coverage
- **Integration Test Coverage:** >80% of critical flows
- **E2E Test Coverage:** 100% of main user journeys
- **Code Quality:** TypeScript strict mode, ESLint zero warnings
- **Performance Testing:** Response time <100ms for all APIs
- **Security Testing:** Static (SAST) and dynamic (DAST) analysis
- **Manual Testing:** Documented procedures for validation

### **Scalability Design**
- **Horizontal scaling** via container orchestration
- **Database sharding** by organization
- **CDN integration** for static assets
- **Microservices evolution** path planned
- **Auto-scaling** based on metrics

### **Monitoring & Observability**
- **Health checks** on all services
- **Structured logging** (JSON format)
- **APM integration** (New Relic/DataDog)
- **Error tracking** (Sentry)
- **Business metrics** dashboard

---

## 📝 Conclusion

Beuni represents a complete and technically robust solution for a real problem in the corporate market. The implemented MVP demonstrates:

1. **Technical Viability:** Modern and scalable stack
2. **Market Fit:** Validated problem with real personas
3. **Business Model:** Clear monetization strategy
4. **Growth Path:** Structured roadmap for evolution

The product is ready for **market validation** and **first beta clients**, with architecture prepared to scale as demand grows.

---

*This PRD serves as guidance for future development and can be used to align stakeholders, investors, and technical team on the product vision and direction.*
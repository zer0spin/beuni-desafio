# 📋 PRD - Product Requirements Document
## Beuni: Plataforma de Gestão de Aniversariantes Corporativos

**Versão:** 1.0
**Data:** 28/09/2025
**Autor:** Equipe Beuni
**Status:** MVP Desenvolvido

---

## 🎯 Visão Executiva

### **Problema**
Empresas perdem oportunidades valiosas de engajamento com colaboradores ao esquecer aniversários, resultando em:
- Diminuição do moral da equipe
- Perda de momentos de reconhecimento
- Processos manuais propensos a erro
- Falta de padronização nos brindes
- Ausência de métricas de engagement

### **Solução**
Beuni é uma plataforma SaaS completa que automatiza a gestão de aniversariantes corporativos, oferecendo:
- Cadastro centralizado de colaboradores
- Calendário inteligente de aniversários
- Envio automático de brindes personalizados
- Dashboard com métricas de engajamento
- API robusta para integrações

### **Proposta de Valor**
> "Transforme cada aniversário em um momento especial de reconhecimento, fortalecendo a cultura organizacional através da tecnologia."

---

## 🏢 Contexto de Mercado

### **Target Audience**
- **Primário:** Empresas de 50-500 colaboradores
- **Secundário:** Startups em crescimento (20-50 pessoas)
- **Terciário:** Corporações (500+ colaboradores)

### **Personas**
1. **Ana Silva - Gerente de RH** (Persona Principal)
   - Idade: 32 anos
   - Responsabilidades: Gestão de pessoas, cultura organizacional
   - Dores: Processos manuais, esquecimento de datas importantes
   - Objetivos: Automatizar processos, melhorar engagement

2. **Carlos Santos - Diretor de Pessoas**
   - Idade: 45 anos
   - Responsabilidades: Estratégia de pessoas, budget de benefícios
   - Dores: Falta de métricas, custos descontrolados
   - Objetivos: ROI mensurável, padronização de processos

---

## 🎯 Objetivos do Produto

### **Objetivos Primários**
1. **Automatização Completa:** Eliminar 100% dos processos manuais
2. **Zero Esquecimentos:** Garantir que nenhum aniversário seja perdido
3. **Padronização:** Criar experiência consistente para todos os colaboradores
4. **Métricas:** Fornecer insights sobre engagement e custos

### **Objetivos Secundários**
1. **Integração:** Conectar com sistemas de RH existentes
2. **Personalização:** Permitir customização de brindes por nível/cargo
3. **Escalabilidade:** Suportar empresas de qualquer tamanho
4. **Compliance:** Atender requisitos de LGPD/GDPR

### **KPIs de Sucesso**
- **Adoption Rate:** >90% dos colaboradores cadastrados
- **Engagement:** >95% de entregas bem-sucedidas
- **Time Savings:** 10+ horas/mês economizadas por empresa
- **NPS:** >70 pontos
- **Churn Rate:** <5% anual

---

## 🔧 Funcionalidades Técnicas

### **Core Features (MVP Implementado)**

#### **1. Sistema de Autenticação**
- **JWT-based authentication** com refresh tokens
- **Multi-tenant architecture** (isolamento por organização)
- **Rate limiting** (5 tentativas/minuto)
- **Password security** com bcrypt hash
- **Session management** com cookies seguros

#### **2. Gestão de Colaboradores**
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
- **CRUD completo** de colaboradores
- **Validação de dados** com class-validator
- **Soft delete** para auditoria
- **Busca avançada** por departamento/cargo

#### **3. Calendário de Aniversários**
- **Vista mensal** com aniversariantes do período
- **Alertas antecipados** (7 dias antes)
- **Filtros por departamento** e cargo
- **Export para calendários** externos (ICS)

#### **4. Sistema de Envio de Brindes**
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
- **Automação baseada em triggers** temporais
- **Estados bem definidos** com transições auditadas
- **Integração com correios** (preparado para APIs)
- **Tracking de entregas** em tempo real

#### **5. Integração CEP**
- **Cache Redis** para performance
- **Rate limiting** específico (30 req/min)
- **Fallback strategies** para APIs indisponíveis
- **Validação de endereços** brasileiros

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

## 🔐 Requisitos de Segurança

### **Autenticação & Autorização**
- **JWT tokens** com expiração configurável (7 dias)
- **Role-based access control** (Admin, Manager, Viewer)
- **API key authentication** para integrações
- **Session invalidation** em logout

### **Data Protection**
- **Encryption at rest** (database level)
- **HTTPS enforcement** (SSL/TLS)
- **Input sanitization** para prevenção de XSS
- **SQL injection protection** via Prisma ORM

### **Compliance**
- **LGPD compliance** (direito ao esquecimento)
- **Audit logs** para todas as operações
- **Data minimization** (apenas dados necessários)
- **Consent management** explícito

### **Infrastructure Security**
- **Container isolation** (Docker networks)
- **Environment variables** para secrets
- **Rate limiting** por endpoint
- **CORS policy** restritiva

---

## 📊 Modelo de Dados

### **Core Entities**

```sql
-- Organizações (Multi-tenant)
CREATE TABLE organizacoes (
  id VARCHAR PRIMARY KEY,
  nome VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usuários (Admins/Managers)
CREATE TABLE usuarios (
  id VARCHAR PRIMARY KEY,
  nome VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  senha_hash VARCHAR NOT NULL,
  organization_id VARCHAR REFERENCES organizacoes(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Endereços (Normalizado)
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

-- Colaboradores (Core Business Entity)
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

-- Envios de Brindes (Automation Engine)
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
1. **Um colaborador por organização** (soft delete para histórico)
2. **Um envio por ano por colaborador** (único constraint)
3. **Endereços normalizados** (reuso entre colaboradores)
4. **Auditoria completa** (created_at, updated_at em todas as tabelas)

---

## 🚀 Roadmap de Features

### **Phase 1: MVP (✅ Implementado)**
- [x] Autenticação multi-tenant
- [x] CRUD de colaboradores
- [x] Calendário de aniversários
- [x] Sistema básico de envios
- [x] Integração CEP
- [x] Dashboard inicial

### **Phase 2: Automation (Next 3 meses)**
- [ ] **Email notifications** automáticas
- [ ] **WhatsApp integration** para notificações
- [ ] **Advanced scheduling** (custom triggers)
- [ ] **Bulk import** de colaboradores (CSV/Excel)
- [ ] **Mobile app** (React Native)

### **Phase 3: Intelligence (Next 6 meses)**
- [ ] **AI-powered gift suggestions** baseado no perfil
- [ ] **Sentiment analysis** de feedback
- [ ] **Predictive analytics** para churn prevention
- [ ] **Integration marketplace** (Slack, Teams, etc.)
- [ ] **Advanced reporting** (BI dashboard)

### **Phase 4: Enterprise (Next 12 meses)**
- [ ] **SSO integration** (SAML, OIDC)
- [ ] **Advanced RBAC** com custom permissions
- [ ] **White-label solution** para revendedores
- [ ] **API ecosystem** com webhooks
- [ ] **Global expansion** (multi-idioma, multi-moeda)

---

## 📈 Métricas e Analytics

### **Business Metrics**
- **Colaboradores ativos** por organização
- **Taxa de entrega** de brindes (%)
- **Tempo médio** de processamento
- **Custo por colaborador** mensal
- **Engagement rate** (feedback positivo)

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
- **Feature adoption** por funcionalidade

---

## 🔄 Integrações

### **Implementadas**
- **ViaCEP API** - Consulta de endereços
- **JWT Authentication** - Segurança robusta
- **Redis Cache** - Performance optimization

### **Planejadas (Phase 2)**
- **SendGrid** - Email transacional
- **Twilio** - SMS/WhatsApp notifications
- **Correios API** - Tracking de entregas
- **BambooHR** - Sincronização de colaboradores
- **Slack/Teams** - Notificações internas

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

## 💰 Modelo de Negócio

### **Pricing Strategy**
- **Freemium:** Até 10 colaboradores (R$ 0/mês)
- **Professional:** Até 100 colaboradores (R$ 89/mês)
- **Enterprise:** Colaboradores ilimitados (R$ 299/mês)
- **Custom:** Soluções white-label (cotação)

### **Revenue Streams**
1. **SaaS Subscription** (80% da receita esperada)
2. **Professional Services** (implementação, treinamento)
3. **API Usage** (integrações avançadas)
4. **Marketplace Commission** (parceiros de brindes)

### **Cost Structure**
- **Infrastructure:** AWS/GCP (~15% revenue)
- **Development:** Equipe técnica (~40% revenue)
- **Sales & Marketing:** Aquisição (~25% revenue)
- **Operations:** Suporte e admin (~10% revenue)
- **Margin:** ~10% EBITDA target

---

## 🎯 Success Criteria

### **Technical Success**
- [x] **100% API endpoints** funcionais
- [x] **Zero downtime** deployment process
- [x] **Comprehensive testing framework** (Vitest configurado)
- [x] **Security best practices** implementadas
- [x] **Scalable architecture** preparada para growth
- [x] **Test coverage >90%** configurado para CI/CD

### **Business Success**
- [ ] **50+ empresas** usando a plataforma (6 meses)
- [ ] **5000+ colaboradores** cadastrados (12 meses)
- [ ] **95% customer satisfaction** (ongoing)
- [ ] **<5% monthly churn** (ongoing)
- [ ] **Break-even** em 18 meses

### **User Success**
- [x] **Intuitive interface** (landing page + dashboard)
- [x] **Fast onboarding** (<5 minutos para primeira configuração)
- [x] **Reliable automation** (zero aniversários perdidos)
- [ ] **Measurable ROI** para clientes
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
- **Test Framework:** Vitest para frontend e backend
- **Unit Test Coverage:** >90% de cobertura de código
- **Integration Test Coverage:** >80% dos fluxos críticos
- **E2E Test Coverage:** 100% dos user journeys principais
- **Code Quality:** TypeScript strict mode, ESLint zero warnings
- **Performance Testing:** Response time <100ms para todas as APIs
- **Security Testing:** Análise estática (SAST) e dinâmica (DAST)
- **Manual Testing:** Procedimentos documentados para validação

### **Scalability Design**
- **Horizontal scaling** via container orchestration
- **Database sharding** por organização
- **CDN integration** para assets estáticos
- **Microservices evolution** path planejado
- **Auto-scaling** baseado em métricas

### **Monitoring & Observability**
- **Health checks** em todos os services
- **Structured logging** (JSON format)
- **APM integration** (New Relic/DataDog)
- **Error tracking** (Sentry)
- **Business metrics** dashboard

---

## 📝 Conclusão

A Beuni representa uma solução completa e tecnicamente robusta para um problema real no mercado corporativo. O MVP implementado demonstra:

1. **Viabilidade Técnica:** Stack moderna e escalável
2. **Market Fit:** Problema validado com personas reais
3. **Business Model:** Estratégia de monetização clara
4. **Growth Path:** Roadmap estruturado para evolução

O produto está pronto para **validação de mercado** e **primeiros clientes beta**, com arquitetura preparada para escalar conforme a demanda cresce.

---

*Este PRD serve como norte para o desenvolvimento futuro e pode ser usado para alinhar stakeholders, investidores e equipe técnica sobre a visão e direção do produto.*
# 🏗️ Beuni Project Architecture

## 🌐 High-Level Architecture Overview

### System Components
- **Frontend**: Next.js 14 + React 18
- **Backend**: NestJS 10 
- **Database**: PostgreSQL 15
- **Caching**: Redis 7
- **Authentication**: JWT + CSRF Protection
- **Containerization**: Docker
- **Deployment**: Railway (Backend) + Vercel (Frontend)

### Architectural Principles
- **Multi-Tenancy**: Secure isolation between organizational instances
- **Scalability**: Microservices-ready design
- **Performance**: Optimized data flow and caching
- **Security**: Layered security approach

## 📊 C4 Model Diagrams

### Context Diagram
```mermaid
graph TD
    User[Employee/Admin] --> Beuni[Beuni Platform]
    Beuni --> HRMS[HR Management System]
    Beuni --> EmailService[Email Notification Service]
    Beuni --> CEPService[External CEP Service]
    HRMS --> Beuni
```

### Container Diagram
```mermaid
graph TD
    User[Web/Mobile User] --> Frontend[Next.js Frontend - Vercel]
    Frontend --> Backend[NestJS Backend API - Railway]
    Backend --> PostgreSQL[(PostgreSQL Database - Railway)]
    Backend --> Redis[(Redis Cache - Railway)]
    Backend --> CEPService[External CEP Service]
    Backend --> EmailService[Email Notification Service]
```

### Component Diagram (Backend)
```mermaid
graph TD
    AuthModule[Authentication Module]
    UsersModule[Users Module]
    ColaboradoresModule[Colaboradores Module]
    EnvioBrindesModule[Envio Brindes Module]
    NotificacoesModule[Notificações Module]
    CepModule[CEP Module]
    
    AuthModule --> UsersModule
    ColaboradoresModule --> AuthModule
    EnvioBrindesModule --> ColaboradoresModule
    NotificacoesModule --> ColaboradoresModule
    CepModule --> ColaboradoresModule
```

## 🔍 Component Architecture

### Frontend Architecture
```mermaid
graph TD
    A[UI Layer - React Components] 
    B[State Management - Recoil/Redux]
    C[Service Layer - API Clients]
    D[Middleware - Auth/Interceptors]
    E[Routing - Next.js Navigation]
    
    A --> B
    B --> C
    C --> D
    D --> E
```

### Backend Architecture
```mermaid
graph TD
    A[API Gateway - NestJS]
    B[Controller Layer]
    C[Service Layer]
    D[Repository Layer - Prisma ORM]
    E[Database - PostgreSQL]
    F[Caching Layer - Redis]
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
```

## 🛡️ Security Architecture
- **Authentication Flow**:
  1. JWT Token Generation
  2. httpOnly Cookie Storage
  3. CSRF Token Validation
  4. Role-Based Access Control

- **Data Isolation**:
  - Tenant-specific database schemas
  - Middleware-level tenant filtering
  - Encrypted sensitive data at rest

## 📊 Performance Architecture
- **Caching Strategies**:
  - Redis for session management
  - Query result caching
  - Distributed cache invalidation

- **Optimization Techniques**:
  - Database indexing
  - Query optimization
  - Lazy loading
  - Code splitting

## 🔄 Data Flow
```mermaid
sequenceDiagram
    participant Client as Web Client
    participant API as NestJS API
    participant Auth as Authentication Service
    participant DB as PostgreSQL
    participant Cache as Redis Cache

    Client->>API: Request with JWT
    API->>Auth: Validate Token
    Auth-->>API: Token Valid
    API->>Cache: Check Cached Response
    alt Cache Hit
        Cache-->>API: Return Cached Data
    else Cache Miss
        API->>DB: Query Data
        DB-->>API: Return Results
        API->>Cache: Store in Cache
    end
    API-->>Client: Send Response
```

## 🚀 Deployment Architecture
- **Development**: Docker Compose
- **Staging**: Kubernetes Cluster
- **Production**: Multi-Region Cloud Deployment
  - Load Balancing
  - Auto-scaling
  - Disaster Recovery

## 🔬 Technology Choices Rationale

### Why Next.js?
- Server-Side Rendering
- Automatic Code Splitting
- Built-in TypeScript Support
- Optimal Performance

### Why NestJS?
- Modular Architecture
- Dependency Injection
- TypeScript-First
- Enterprise-Grade Scalability

### Why Prisma ORM?
- Type-Safe Database Queries
- Easy Schema Migrations
- Performance Optimization
- Multi-Database Support

## 📈 Future Architecture Roadmap
- Microservices Transition
- Event-Driven Architecture
- Serverless Components
- Enhanced Multi-Tenancy

## 🤝 Architectural Governance
- Quarterly Architecture Reviews
- Performance Benchmark Tracking
- Security Compliance Checks
- Continuous Refactoring
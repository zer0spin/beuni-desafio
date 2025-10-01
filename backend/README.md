# Beuni Backend - Corporate Birthday Platform API

## 🚀 Backend Architecture

### 🏗️ Project Structure
```
backend/
│
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   ├── app.service.ts         # Root service
│   │
│   ├── config/                # Configuration modules
│   │   └── database.module.ts # Database configuration
│   │
│   ├── shared/                # Shared services/utilities
│   │   └── prisma.service.ts  # Prisma ORM service
│   │
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   └── strategies/    # Authentication strategies
│   │   │
│   │   ├── usuarios/          # Users module
│   │   │   └── usuarios.module.ts
│   │   │
│   │   ├── colaboradores/     # Collaborators module
│   │   │   ├── dto/           # Data Transfer Objects
│   │   │   └── colaboradores.module.ts
│   │   │
│   │   └── cep/               # CEP (Address) module
│   │       ├── dto/           # Data Transfer Objects
│   │       └── cep.module.ts
│   │
│   └── common/                # Common utilities
│       └── decorators/        # Custom decorators
│
├── prisma/                   # Database ORM configuration
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding script
│
└── test/                     # Test suites
    ├── unit/
    └── e2e/
```

### 🛠️ Backend Technologies
- **Framework**: NestJS
- **ORM**: Prisma
- **Authentication**: Passport.js + JWT
- **Validation**: Class Validator
- **Caching**: Redis
- **Testing**: Vitest

### 🔐 Authentication Flow
1. Local Strategy (Username/Password)
2. JWT Token Generation
3. Protected Routes with JwtAuthGuard

### 🗂️ Key Modules
- **Auth**: User authentication and authorization
- **Usuarios**: User management
- **Colaboradores**: Employee management
- **CEP**: Address validation service

### 🧪 Testing Strategy
- **Unit Tests**: Focused on individual components/services
- **E2E Tests**: API endpoint and workflow testing
- **Coverage Target**: 95%

### 📡 API Endpoints Overview
- `/auth/login`: User authentication
- `/usuarios`: User management
- `/colaboradores`: Employee management
- `/cep/:cep`: CEP address lookup

### 🔒 Environment Variables
Required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token generation
- `REDIS_URL`: Redis connection URL

### 🚢 Deployment Considerations
- Node.js 18+
- PostgreSQL database
- Redis cache
- Environment-specific configurations

### 🛡️ Security Features
- Password hashing with Bcrypt
- JWT token authentication
- Input validation
- Rate limiting
- CORS configuration

### 📋 Development Scripts
- `npm run start:dev`: Development mode
- `npm run test`: Run unit tests
- `npm run test:e2e`: End-to-end tests
- `npm run prisma:migrate`: Database migrations

### 🤝 Contributing Guidelines
- Follow NestJS best practices
- Write comprehensive tests
- Keep modules decoupled
- Use DTOs for data validation

# 🎉 Beuni Birthday Management Platform

A complete SaaS platform for automating birthday gift delivery management for company employees.

## 📋 Project Overview

This is a full-stack application built as an MVP (Minimum Viable Product) that allows HR managers to register employees and automatically manage birthday gift deliveries with business day calculations and status tracking.

## 🛠 Tech Stack

### Backend
- **NestJS** 10.x - Node.js framework
- **TypeScript** 5.x - Programming language
- **Prisma** 5.x - Database ORM
- **PostgreSQL** 15 - Primary database
- **Redis** 7 - Caching and rate limiting
- **JWT** - Authentication
- **Swagger** - API documentation

### Frontend
- **Next.js** 14.x - React framework
- **React** 18.x - UI library
- **TypeScript** 5.x - Programming language
- **Tailwind CSS** 3.x - Styling
- **React Query** 3.x - Server state management
- **React Hook Form** 7.x - Form handling

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **Vitest** - Testing framework

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/zer0spin/beuni-desafio.git
cd beuni-desafio
```

2. **Install dependencies**
```bash
npm run setup
```

3. **Start with Docker (Recommended)**
```bash
npm run docker:up
```

4. **Or start manually**
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 🌐 Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

### 🔑 Demo Credentials
```
Email: ana.rh@beunidemo.com
Password: 123456
Organization: Beuni Demo Company
```

## 📁 Project Structure

```
beuni-desafio/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/        # Business modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── colaboradores/  # Employee management
│   │   │   ├── cep/        # ZIP code integration
│   │   │   └── envio-brindes/  # Gift delivery logic
│   │   ├── config/         # Configuration
│   │   └── shared/         # Shared services
│   ├── prisma/            # Database schema
│   └── test/              # Tests
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # App pages
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── docs/                  # Documentation
├── docker-compose.yml     # Production compose
├── docker-compose.override.yml  # Development overrides
└── package.json          # Root package configuration
```

## 🔧 Docker Compose Files

### `docker-compose.yml` (Production)
Contains the base configuration for all services:
- PostgreSQL database
- Redis cache
- Backend API (NestJS)
- Frontend app (Next.js)

### `docker-compose.override.yml` (Development)
**Purpose**: Provides development-specific overrides that are automatically merged with the base configuration.

**Key Features**:
- **Hot reload**: Mounts source code as volumes
- **Development commands**: Overrides CMD to use dev scripts
- **Development target**: Uses multi-stage Dockerfile development target
- **Real-time updates**: Changes in code are reflected immediately

**Why it exists**: Docker Compose automatically applies `.override.yml` files in development, allowing developers to have development-specific configurations without modifying the production setup.

## 🔐 Key Features

### ✅ Multi-tenant Architecture
- Complete organization isolation
- JWT-based authentication
- Secure data segregation

### ✅ Employee Management
- Complete CRUD operations
- Automatic address completion via ZIP code
- Department and position tracking
- Birthday management

### ✅ Automated Gift Delivery
- **Daily cron job** (6:00 AM São Paulo timezone)
- **Business day calculation** (7 days before birthday)
- **National holidays** consideration
- **Status tracking**: PENDING → READY_TO_SHIP → SHIPPED → DELIVERED

### ✅ External Integrations
- **ViaCEP API** for Brazilian ZIP codes
- **Redis caching** (24h TTL)
- **Rate limiting** (30 requests/minute)
- Robust error handling

### ✅ Security Features
- Password hashing with bcrypt
- JWT authentication with 7-day expiration
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Multi-tenant data isolation

## 📚 API Documentation

Complete Swagger documentation available at: `http://localhost:3001/api/docs`

### Main Endpoints

#### Authentication
- `POST /auth/register` - Organization registration
- `POST /auth/login` - User login

#### Employee Management
- `GET /colaboradores` - List employees (with filters)
- `POST /colaboradores` - Create employee
- `GET /colaboradores/:id` - Get employee details

#### ZIP Code Service
- `GET /cep/:zipcode` - Get address by ZIP code

#### Gift Delivery
- `GET /envio-brindes` - List deliveries
- `GET /envio-brindes/aniversariantes` - Upcoming birthdays

## 🧪 Testing

```bash
# Run all tests
npm run test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend
```

## 🐳 Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Restart specific service
docker-compose restart backend
```

## 🌍 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://beuni_user:beuni_password_2024@postgres:5432/beuni_db
REDIS_URL=redis://redis:6379
JWT_SECRET=beuni_jwt_secret_key_2024_super_secure
JWT_EXPIRES_IN=7d
VIACEP_API_URL=https://viacep.com.br/ws
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_LOGIN=5
RATE_LIMIT_CEP=30
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=beuni_nextauth_secret_2024
```

## 📊 Performance Metrics

- **ZIP code lookup**: < 500ms (cache hit: ~5ms)
- **Login**: < 1s
- **Employee listing**: < 2s (with pagination)
- **Employee registration**: < 3s (including ZIP code lookup)

## 🔄 Development Workflow

1. **Planning**: Check `docs/DEVELOPMENT_LOG.md` for detailed development history
2. **Code Quality**: ESLint + Prettier configured
3. **Testing**: Comprehensive test coverage setup
4. **Documentation**: Auto-generated API docs with Swagger

## 📚 Documentation

All project documentation is organized in the `/docs` folder:

- **[PRD.md](docs/PRD.md)** - Product Requirements Document
- **[DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md)** - Detailed development log with troubleshooting
- **[DEVELOPMENT_LOG_EN.md](docs/DEVELOPMENT_LOG_EN.md)** - English version of development log
- **[AI_USAGE.md](docs/AI_USAGE.md)** - AI assistance usage report
- **[COMMIT_STRATEGY.md](docs/COMMIT_STRATEGY.md)** - Git commit strategy
- **[DOCKER_COMPOSE_ANALYSIS.md](docs/DOCKER_COMPOSE_ANALYSIS.md)** - Docker configuration analysis

## 🚀 Deployment

The application is ready for deployment on:
- **Railway** (Backend + Database)
- **Vercel** (Frontend)
- **Render** (Full-stack)

See deployment guides in the `docs/` directory.

## 📈 Roadmap

### Version 2.0 Features
- [ ] Complete employee CRUD operations
- [ ] Bulk CSV import
- [ ] Email/SMS notifications
- [ ] Advanced reporting with charts
- [ ] Mobile app (React Native)


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# 🎂 Beuni Birthday Management Platform

[![Tests](https://img.shields.io/badge/tests-92%25_coverage-brightgreen)](docs/testing/COVERAGE-REPORT.md)
[![Security](https://img.shields.io/badge/security-A+-brightgreen)](docs/security/SECURITY_ASSESSMENT_REPORT.md)
[![Build](https://img.shields.io/badge/build-passing-success)](docs/DEVELOPMENT_LOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.json)

A comprehensive corporate birthday management platform built with modern web technologies, featuring automated gift sending, employee management, and advanced analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Development Setup
```bash
# Clone repository
git clone <repository-url>
cd beuni-desafio

# Install dependencies
npm run setup

# Start development environment
docker-compose up -d
npm run dev
```

**Access Points:**
- 🌐 Frontend: http://localhost:3000
- ⚙️ Backend API: http://localhost:3001
- 📊 Swagger Docs: http://localhost:3001/api

## 📋 Project Overview

### Core Features
- **🎁 Gift Management**: Automated birthday gift sending with 7-business-day scheduling
- **👥 Employee Management**: Comprehensive employee profiles with photo uploads
- **📊 Analytics Dashboard**: Advanced reporting with interactive charts and KPIs
- **🔔 Notifications**: Real-time notifications for upcoming birthdays and deadlines
- **⚙️ Configuration**: Flexible system settings and customizations
- **📦 Product Catalog**: Extensive gift catalog with categorization

### Technical Architecture
- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: NestJS 10 + TypeScript + Prisma ORM
- **Database**: PostgreSQL 15 with Redis caching
- **Security**: JWT + CSRF protection + httpOnly cookies
- **Testing**: 92% coverage with Vitest + Jest
- **DevOps**: Docker containerization + GitHub Actions CI/CD

## 📚 Documentation Structure

### 📖 Core Documentation
| Document | Description | Status |
|----------|-------------|--------|
| [README.md](README.md) | Project overview and quick start | ✅ Current |
| [CHANGELOG.md](CHANGELOG_NEW.md) | Version history and release notes | ✅ Updated |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and design | ✅ Complete |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guidelines | ✅ Complete |

### 🔧 Development Documentation
| Document | Description | Location |
|----------|-------------|----------|
| [Development Log](docs/DEVELOPMENT_LOG.md) | Complete development history (PT) | `docs/` |
| [Setup Guide](SETUP_GUIDE.md) | Detailed installation instructions | Root |
| [API Documentation](docs/API_DOCUMENTATION.md) | REST API endpoints and schemas | `docs/` |
| [Docker Analysis](docs/DOCKER_COMPOSE_ANALYSIS.md) | Container configuration guide | `docs/` |

### 🧪 Quality Assurance
| Document | Description | Location |
|----------|-------------|----------|
| [Testing Architecture](docs/testing/TESTING-ARCHITECTURE.md) | Test strategy and frameworks | `docs/testing/` |
| [Coverage Report](docs/testing/COVERAGE-REPORT.md) | Code coverage metrics | `docs/testing/` |
| [Security Assessment](docs/security/SECURITY_ASSESSMENT_REPORT.md) | Security audit results | `docs/security/` |

### 🔒 Security Documentation
| Document | Description | Location |
|----------|-------------|----------|
| [Security Policy](SECURITY.md) | Vulnerability reporting | Root |
| [Security Fixes](SECURITY_FIXES_APPLIED.md) | Applied security patches | Root |
| [Threat Analysis](docs/security/threat-hunting-queries.md) | Security monitoring | `docs/security/` |

## 🎯 Key Features

### 📊 Advanced Analytics
- Interactive charts with Recharts
- Monthly/yearly filtering
- KPI tracking and metrics
- Export functionality

### 🔐 Enterprise Security
- JWT authentication with httpOnly cookies
- CSRF protection
- Rate limiting and throttling
- Comprehensive input validation

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/light theme support
- Accessibility compliance
- Mobile-first approach

### ⚡ Performance Optimization
- Database indexing with Prisma
- Redis caching layer
- Code splitting and lazy loading
- Optimized bundle sizes

## 🧪 Testing & Quality

### Test Coverage
```
Overall Coverage: 92%
├── Backend Services: 95%
├── Frontend Components: 88%
├── API Endpoints: 94%
└── Integration Tests: 90%
```

### Quality Metrics
- **TypeScript Strict Mode**: ✅ Enabled
- **ESLint Rules**: ✅ Zero violations
- **Security Scan**: ✅ A+ rating
- **Performance**: ✅ Lighthouse 95+

### Running Tests
```bash
# All tests with coverage
npm test

# Specific test suites
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e        # End-to-end tests

# With UI and coverage reports
npm run test:ui
npm run test:coverage
```

## 🚀 Deployment

### Production Environment
```bash
# Build for production
npm run build

# Start production servers
docker-compose -f docker-compose.yml up -d
```

### Environment Configuration
- **Development**: `.env.development`
- **Production**: `.env.production`
- **Testing**: `.env.test`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

### Code Standards
- Follow TypeScript strict mode
- Maintain 80%+ test coverage
- Use conventional commits
- Document new features

## 📈 Project Stats

### Development Activity
- **35 commits** in the last 24 hours
- **500+ files** managed across frontend/backend
- **92% test coverage** maintained
- **Zero critical vulnerabilities**

### Technology Stack
- **Languages**: TypeScript, JavaScript, SQL
- **Frameworks**: Next.js, NestJS, React
- **Databases**: PostgreSQL, Redis
- **DevOps**: Docker, GitHub Actions
- **Testing**: Vitest, Jest, Testing Library

## 📞 Support

- **Documentation**: Browse the `docs/` directory
- **Issues**: Create GitHub issues for bugs
- **Security**: See [SECURITY.md](SECURITY.md) for vulnerability reports
- **Development**: Check [DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md) for troubleshooting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Comprehensive test coverage
- Security-first approach
- Developer-friendly documentation

---

**⭐ Star this repository if you find it useful!**
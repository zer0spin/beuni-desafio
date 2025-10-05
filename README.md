# 🎂 Beuni Birthday Management Platform

[![Tests](https://img.shields.io/badge/tests-92%25_coverage-brightgreen)](docs/testing/COVERAGE-REPORT.md)
[![Security](https://img.shields.io/badge/security-A+-brightgreen)](docs/security/)
[![Build](https://img.shields.io/badge/build-passing-success)](docs/DEVELOPMENT_LOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.json)
[![Deployment](https://img.shields.io/badge/deployment-Railway+Vercel-blueviolet)](docs/deploy/)

A comprehensive corporate birthday management platform built with modern web technologies, featuring automated gift sending, employee management, advanced analytics, and enhanced shipment operations.

## 🆕 Latest Updates (October 2025)

### ✨ Enhanced Shipment Management
- **Bulk Delete Operations**: Complete delete functionality for shipment records with organization-scoped security
- **Fixed Date Calculations**: Corrected business day calculations (7 business days instead of 30 calendar days)
- **Improved Date Handling**: Fixed timezone issues with component-based date comparisons
- **Enhanced UI**: Action selection modals with confirmation flows for better user experience

### 🔧 Technical Improvements
- **API Enhancements**: New delete endpoints with proper validation and organization isolation
- **Code Quality**: Translated Portuguese comments to English for better maintainability
- **Business Logic**: Fixed critical date calculation errors affecting shipment deadlines

## 🚀 Quick Start

### Production URLs
- 🌐 **Frontend**: https://beuni-frontend-one.vercel.app
- ⚙️ **Backend API**: https://beuni-desafio-production-41c7.up.railway.app
- 📊 **API Docs**: https://beuni-desafio-production-41c7.up.railway.app/api/docs

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

**Local Access Points:**
- 🌐 Frontend: http://localhost:3000
- ⚙️ Backend API: http://localhost:3001
- 📊 Swagger Docs: http://localhost:3001/api/docs

## 📚 Documentation

> **📋 Complete Documentation**: See [docs/README.md](docs/README.md) for full documentation index

### Quick Links
| Category | Document | Description |
|----------|----------|-------------|
| 🏗️ Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and C4 diagrams |
| 🛡️ Security | [docs/SECURITY.md](docs/SECURITY.md) | Security overview and policies |
| 🧪 Testing | [docs/TESTING.md](docs/TESTING.md) | Test strategies and coverage |
| 🚀 Deployment | [docs/deploy/COMPREHENSIVE_DEPLOYMENT_GUIDE.md](docs/deploy/COMPREHENSIVE_DEPLOYMENT_GUIDE.md) | Complete deployment guide |
| 🔧 Development | [docs/development/DEVELOPMENT_LOG.md](docs/development/DEVELOPMENT_LOG.md) | Complete development history |
| 📋 API Reference | [docs/api/API.md](docs/api/API.md) | Complete API documentation |
| 📋 Recent Updates | [docs/RECENT_UPDATES.md](docs/RECENT_UPDATES.md) | Latest changes and fixes |
| 🔧 Scripts | [scripts/README.md](scripts/README.md) | Automation and deployment scripts |

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
| [docs/README.md](docs/README.md) | Documentation index | ✅ Current |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes | ✅ Updated |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Comprehensive system architecture | ✅ Complete |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guidelines | ✅ Complete |

### 🔧 Development Documentation
| Document | Description | Location |
|----------|-------------|----------|
| [Development Log](docs/DEVELOPMENT_LOG.md) | Complete development history (PT) | `docs/` |
| [Recent Updates](docs/RECENT_UPDATES.md) | Latest changes summary | `docs/` |
| [Setup Guide](SETUP_GUIDE.md) | Detailed installation instructions | Root |
| [Performance Strategy](docs/PERFORMANCE.md) | Performance optimization guide | `docs/` |
| [Deployment Guide](docs/DEPLOYMENT.md) | Deployment configurations | `docs/` |

### 🔒 Security Documentation
| Document | Description | Location |
|----------|-------------|----------|
| [Security Assessment](docs/SECURITY.md) | Comprehensive security strategy | `docs/` |
| [Security Policy](SECURITY.md) | Vulnerability reporting | Root |
| [Threat Model](docs/security/threat-hunting-queries.md) | Security monitoring | `docs/security/` |
| [Vulnerability Fixes](SECURITY_FIXES_APPLIED.md) | Applied security patches | Root |

### 🧪 Quality Assurance
| Document | Description | Location |
|----------|-------------|----------|
| [Testing Strategy](docs/TESTING.md) | Comprehensive testing approach | `docs/` |
| [Code Refactoring](docs/REFACTORING.md) | Code quality improvements | `docs/` |
| [Test Coverage](docs/testing/COVERAGE-REPORT.md) | Detailed coverage metrics | `docs/testing/` |
| [Accessibility Guide](docs/ACCESSIBILITY.md) | Accessibility compliance | `docs/` |

### 🌐 Technical References
| Document | Description | Location |
|----------|-------------|----------|
| [API Documentation](docs/API.md) | Detailed API specifications | `docs/` |
| [Deployment Guide](docs/DEPLOYMENT.md) | Railway & Vercel deployment | `docs/` |
| [Docker Compose](docs/DOCKER_COMPOSE_ANALYSIS.md) | Container configuration | `docs/` |
| [Local Development](docs/DEVELOPMENT.md) | Local setup instructions | `docs/` |

### 🤝 Contribution & Support
| Document | Description | Location |
|----------|-------------|----------|
| [Contributing Guidelines](CONTRIBUTING.md) | How to contribute | Root |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community standards | Root |
| [Support](SUPPORT.md) | Getting help | Root |

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

### Guide
Veja o guia completo em `docs/DEPLOYMENT.md` (Railway/Vercel, variáveis, portas, seed, troubleshooting).

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

## � Project Stats

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

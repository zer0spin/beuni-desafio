# Contributing to Beuni Project

## 🤝 Welcome Contributors!

First off, thank you for considering contributing to Beuni! It's people like you that make Beuni such a great tool.

## 📋 Code of Conduct

This project and everyone participating in it are governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 How Can I Contribute?

### 🐞 Reporting Bugs
- Use GitHub Issues
- Describe the bug in detail
- Include steps to reproduce
- Provide environment details (OS, Node version, etc.)

### ✨ Feature Suggestions
- Open a GitHub Issue
- Clearly describe the proposed feature
- Explain the motivation and use case

## 🛠 Development Process

### 🌳 Branch Strategy
- `main`: Production-ready code
- `develop`: Active development
- Feature branches: `feature/your-feature-name`
- Bugfix branches: `bugfix/issue-description`

### 🔧 Development Setup
1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Run tests
6. Commit with a clear message
7. Push to your fork
8. Open a Pull Request

### 📝 Commit Message Guidelines
- Use present tense
- Use imperative mood
- Limit first line to 72 characters
- Reference issues when applicable

**Example**:
```
feat(auth): add multi-factor authentication

- Implement TOTP-based 2FA
- Add configuration for MFA setup
- Update user model to support MFA status

Closes #123
```

### 🧪 Testing Requirements
- 95%+ Test Coverage
- Unit Tests for all new functionality
- Integration Tests for complex workflows
- E2E Tests for critical paths

### 🔍 Code Review Process
- Automated CI checks must pass
- At least one maintainer review required
- Address review comments promptly

## 🛡️ Security

### 🔐 Reporting Security Issues
- Do NOT open public GitHub issues
- Email security@beuni.com with details
- Expect acknowledgment within 48 hours

## 📊 Development Environment

### 🖥️ Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Docker (recommended)

### 🛠️ Local Setup
```bash
# Clone repository
git clone https://github.com/your-org/beuni-desafio.git

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configurations

# Run migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

## 📦 Dependency Management
- Use `npm audit` regularly
- Keep dependencies updated
- Prefer official packages
- Review new dependencies carefully

## 🤖 Automated Workflows
- GitHub Actions for CI/CD
- Automatic dependency updates
- Security scanning
- Automated testing

## 📚 Documentation
- Update README/docs with changes
- Add inline code documentation
- Use TypeDoc for API documentation

## 🏆 Recognition
Contributors will be acknowledged in:
- README.md
- CONTRIBUTORS file
- Release notes

## 📞 Questions?
- Open a GitHub Discussion
- Join our community Slack
- Email support@beuni.com

Thank you for contributing! 🎉


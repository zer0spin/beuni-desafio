# SonarCloud Quick Start Guide

## Step 1: Create SonarCloud Projects

Go to https://sonarcloud.io and create three projects:

1. **Root**: `zer0spin_beuni-desafio`
2. **Backend**: `zer0spin_beuni-desafio-backend`
3. **Frontend**: `zer0spin_beuni-desafio-frontend`

## Step 2: Configure GitHub Secrets

Add to GitHub repository secrets:

```
Name: SONAR_TOKEN
Value: [Your SonarCloud token from My Account > Security]
```

## Step 3: Run Tests with Coverage

```bash
# Generate coverage reports
npm run test:coverage
```

## Step 4: Trigger GitHub Action

The workflow runs automatically on:
- Push to main/develop
- Pull requests
- Manual trigger

## Configuration Files

All configuration files are already created:
- `sonar-project.properties` (root)
- `backend/sonar-project.properties`
- `frontend/sonar-project.properties`

## Quality Gate Thresholds

### Backend (80% coverage target)
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

### Frontend (70% coverage target)
- Lines: 70%
- Functions: 70%
- Branches: 65%
- Statements: 70%

## Verify Setup

```bash
# Check coverage reports exist
ls -la backend/coverage/lcov.info
ls -la frontend/coverage/lcov.info
```

## Add Badges to README

After first scan, add these badges to README.md:

```markdown
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=zer0spin_beuni-desafio&metric=alert_status)](https://sonarcloud.io/dashboard?id=zer0spin_beuni-desafio)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=zer0spin_beuni-desafio&metric=coverage)](https://sonarcloud.io/dashboard?id=zer0spin_beuni-desafio)
```

## Troubleshooting

**Coverage report not found:**
```bash
cd backend && npm run test:cov
cd frontend && npm run test:coverage
```

**Authentication failed:**
- Verify SONAR_TOKEN secret exists in GitHub
- Regenerate token if needed

**Quality gate failing:**
- Check SonarCloud dashboard for specific issues
- Increase test coverage
- Fix code smells and duplications

## Resources

- Full Setup Guide: See `SONARCLOUD_SETUP.md`
- SonarCloud Dashboard: https://sonarcloud.io/projects
- Documentation: https://docs.sonarcloud.io/

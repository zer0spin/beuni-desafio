# Deployment Guide

> **Last Updated**: October 3, 2025
> **Environments**: Development, Staging, Production

---

## Quick Start

### Prerequisites

- **Node.js**: 18.x or higher
- **Docker**: 20.10+ and Docker Compose
- **PostgreSQL**: 15+ (if not using Docker)
- **Redis**: 7+ (if not using Docker)
- **npm**: 9.x or higher

### Development Environment

```bash
# 1. Clone repository
git clone https://github.com/your-org/beuni-desafio.git
cd beuni-desafio

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Start services with Docker
docker-compose up -d

# 5. Run database migrations
cd backend
npx prisma migrate deploy
npx prisma generate

# 6. Seed database (optional)
npm run seed

# 7. Start development servers
npm run dev        # Backend (port 3001)
cd ../frontend
npm run dev        # Frontend (port 3000)
```

Access: http://localhost:3000

---

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beuni_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secure-random-secret-here"  # Generate: openssl rand -base64 64
JWT_EXPIRATION="7d"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# Node Environment
NODE_ENV="development"  # development | production

# API Keys
VIACEP_API_URL="https://viacep.com.br/ws"

# Server
PORT=3001
```

### Frontend (.env)

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NODE_ENV="development"  # development | production
```

---

## Docker Deployment

### Using Docker Compose (Recommended)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: beuni_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/beuni_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] **Environment Variables**: All secrets properly configured
- [ ] **Database**: Migrations applied
- [ ] **SSL/TLS**: HTTPS certificates configured
- [ ] **CORS**: Production domains whitelisted
- [ ] **Rate Limiting**: Configured for production traffic
- [ ] **Logging**: Centralized logging configured
- [ ] **Monitoring**: Health checks and alerts active
- [ ] **Backups**: Database backup strategy in place
- [ ] **Security**: Security headers and CSP configured

### Build for Production

#### Backend

```bash
cd backend

# Install production dependencies only
npm ci --production

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Start production server
npm run start:prod
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build optimized production bundle
npm run build

# Start production server
npm start
```

### PM2 Process Manager (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start npm --name "beuni-backend" -- run start:prod

# Start frontend
cd frontend
pm2 start npm --name "beuni-frontend" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart services
pm2 restart all
```

---

## Cloud Providers

### AWS Deployment

#### Using AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
cd backend
eb init -p node.js-18 beuni-backend --region us-east-1

# Create environment
eb create beuni-backend-prod

# Deploy
eb deploy

# Configure environment variables
eb setenv DATABASE_URL=postgres://... JWT_SECRET=...

# Open application
eb open
```

#### Using AWS ECS (Docker)

```bash
# Build and push Docker images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t beuni-backend ./backend
docker tag beuni-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/beuni-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/beuni-backend:latest
```

### Google Cloud Platform

#### Using Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/beuni-backend ./backend
gcloud run deploy beuni-backend --image gcr.io/PROJECT-ID/beuni-backend --platform managed --region us-central1

# Set environment variables
gcloud run services update beuni-backend --set-env-vars DATABASE_URL=...,JWT_SECRET=...
```

### Azure

#### Using Azure App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name beuni-rg --location eastus

# Create app service plan
az appservice plan create --name beuni-plan --resource-group beuni-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group beuni-rg --plan beuni-plan --name beuni-backend --runtime "NODE:18-lts"

# Configure environment variables
az webapp config appsettings set --resource-group beuni-rg --name beuni-backend --settings DATABASE_URL=... JWT_SECRET=...

# Deploy
cd backend
zip -r deploy.zip .
az webapp deployment source config-zip --resource-group beuni-rg --name beuni-backend --src deploy.zip
```

---

## Database Migrations

### Running Migrations

```bash
# Development
npx prisma migrate dev --name description_of_changes

# Production
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Creating Migrations

```bash
# 1. Modify schema.prisma
# 2. Generate migration
npx prisma migrate dev --name add_new_field

# 3. Review generated SQL in prisma/migrations/
# 4. Test migration
npm run test

# 5. Commit migration files
git add prisma/migrations/
git commit -m "feat: add new database field"
```

---

## Monitoring & Health Checks

### Health Check Endpoint

```bash
# Check system health
curl http://localhost:3001/health

# Expected response
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

### Monitoring Setup

#### With Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3030:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
pg_dump -h localhost -U postgres beuni_db > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U postgres beuni_db < backup_20251003.sql

# Automated daily backups (cron)
0 2 * * * pg_dump -h localhost -U postgres beuni_db | gzip > /backups/beuni_$(date +\%Y\%m\%d).sql.gz
```

### Redis Backup

```bash
# Redis automatically saves to dump.rdb
# Force save
redis-cli SAVE

# Copy backup
cp /var/lib/redis/dump.rdb /backups/redis_$(date +%Y%m%d).rdb
```

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
psql -h localhost -U postgres -d beuni_db

# Verify DATABASE_URL
echo $DATABASE_URL
```

#### Redis Connection Errors

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping  # Should return PONG
```

#### Port Already in Use

```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Linux/Mac

# Kill process
taskkill /PID <process_id> /F  # Windows
kill -9 <process_id>           # Linux/Mac
```

---

## Security Best Practices

### Production Security Checklist

- [ ] **HTTPS Only**: Enforce SSL/TLS
- [ ] **Strong Secrets**: Use cryptographically secure random secrets
- [ ] **Environment Variables**: Never commit secrets to Git
- [ ] **CORS**: Whitelist only production domains
- [ ] **Rate Limiting**: Enable for all endpoints
- [ ] **Helmet**: Security headers configured
- [ ] **SQL Injection**: Using Prisma ORM (safe by default)
- [ ] **XSS Protection**: React auto-escaping + CSP headers
- [ ] **Dependencies**: Regularly update and audit
- [ ] **Logs**: Sanitize sensitive data from logs
- [ ] **Backups**: Automated and tested

### Secrets Management

```bash
# Use secret managers in production
# AWS Secrets Manager
aws secretsmanager create-secret --name beuni/jwt-secret --secret-string "your-secret"

# Azure Key Vault
az keyvault secret set --vault-name beuni-vault --name jwt-secret --value "your-secret"

# Google Cloud Secret Manager
echo -n "your-secret" | gcloud secrets create jwt-secret --data-file=-
```

---

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

      - name: Build
        run: |
          cd backend && npm run build
          cd ../frontend && npm run build

      - name: Deploy to AWS
        run: |
          # Deploy commands here
```

---

## Rollback Strategy

```bash
# 1. Identify last working version
git log --oneline

# 2. Revert to previous version
git revert <commit-hash>

# 3. Rollback database migration (if needed)
npx prisma migrate rollback

# 4. Redeploy
npm run deploy

# 5. Verify system health
curl http://your-app.com/health
```

---

**Last Updated**: October 3, 2025
**Maintained By**: DevOps Team

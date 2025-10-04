# 🚀 Development Setup Guide - Beuni Platform

## 📋 Common Issue: Prisma Database Connection Errors

### ❌ **The Problem**

When running `npx prisma migrate deploy` **outside the Docker container** (in PowerShell/CMD on Windows), you encounter this error:

```
Error: P1001: Can't reach database server at `postgres:5432`
```

### 🔍 **Technical Explanation**

The `.env` file in the backend contains:

```env
DATABASE_URL="postgresql://beuni:beuni123@postgres:5432/beuni_db"
```

The hostname `postgres:5432` works **only inside the Docker network**. When you run Prisma on **Windows/PowerShell**, it cannot resolve this name because:

1. **Inside Docker**: `postgres` = PostgreSQL container name in the internal network
2. **Outside Docker (Windows)**: `postgres` = unknown hostname ❌

### ✅ **Correct Solution**

**ALWAYS run Prisma commands inside the backend container:**

```powershell
# ✅ CORRECT - Inside the container
docker exec beuni-backend npx prisma generate
docker exec beuni-backend npx prisma migrate deploy
docker exec beuni-backend npm run prisma:seed

# ❌ WRONG - Outside the container (on Windows)
cd backend
npx prisma migrate deploy  # ❌ Will fail!
```

---

## 🎯 Automated Setup (Recommended)

### **Windows (PowerShell)**

```powershell
# Run the setup script
.\scripts\setup\setup.ps1
```

### **Linux/Mac (Bash)**

```bash
# Make the script executable
chmod +x scripts/setup/setup.sh

# Run the script
./scripts/setup/setup.sh
```

The script automates:
1. ✅ Stops existing containers
2. ✅ Starts new containers
3. ✅ Waits for PostgreSQL to be ready
4. ✅ Generates Prisma Client
5. ✅ Applies migrations
6. ✅ Populates database with test data

---

## 🛠️ Manual Setup (Step by Step)

### **1. Start the Containers**

```powershell
docker-compose up -d
```

Wait ~15 seconds for PostgreSQL to fully initialize.

### **2. Generate Prisma Client**

```powershell
docker exec beuni-backend npx prisma generate
```

### **3. Apply Database Migrations**

```powershell
docker exec beuni-backend npx prisma migrate deploy
```

### **4. Populate Database with Test Data**

```powershell
docker exec beuni-backend npm run prisma:seed
```

Alternatively, for a larger, multi-year and multi-status dataset (recommended for dashboards and reports):

```powershell
docker exec beuni-backend npx prisma migrate deploy
docker exec beuni-backend node -e "require('ts-node/register'); require('./prisma/seed-populated.ts');"
```

### **5. Verify Container Status**

```powershell
docker ps
```

You should see 4 containers running:
- ✅ `beuni-frontend` (port 3000)
- ✅ `beuni-backend` (port 3001)
- ✅ `beuni-postgres` (port 15432)
- ✅ `beuni-redis` (port 6379)

---

## 🌐 Available Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | User interface |
| **Backend API** | http://localhost:3001 | REST API |
| **Swagger Docs** | http://localhost:3001/api/docs | API documentation |
| **PostgreSQL** | localhost:15432 | Database (use DBeaver/pgAdmin) |
| **Redis** | localhost:6379 | Cache |

---

## 🔑 Test Credentials

### Frontend Login
```
Email:    ana.rh@beunidemo.com
Password: 123456
```

### Database Connection (DBeaver/pgAdmin)
```
Host:     localhost
Port:     15432
Database: beuni_db
User:     beuni
Password: beuni123
```

---

## 📝 Useful Development Commands

### **View Real-Time Logs**

```powershell
# Backend logs
docker logs beuni-backend -f

# Frontend logs
docker logs beuni-frontend -f

# Database logs
docker logs beuni-postgres -f
```

### **Container Management**

```powershell
# Stop all containers
docker-compose down

# Stop and remove volumes (clean everything)
docker-compose down -v

# Recreate containers from scratch
docker-compose down -v
docker-compose up -d --build
```

### **Database Operations**

```powershell
# Reset database (WARNING: Deletes all data)
docker exec beuni-backend npx prisma migrate reset --force

# View database schema
docker exec beuni-backend npx prisma studio
```

---

## 🐛 Troubleshooting

### **Error: "Can't reach database server at postgres:5432"**

**Cause**: Running Prisma outside the container.

**Solution**: Use `docker exec` to run inside the container:
```powershell
docker exec beuni-backend npx prisma migrate deploy
```

### **Error: "Port 15432 is already allocated"**

**Cause**: Local PostgreSQL or another container using the port.

**Solution**:
```powershell
# Check what's using the port
netstat -ano | findstr :15432

# Stop local PostgreSQL or change port in docker-compose.yml
```

### **Backend Container Unhealthy**

**Cause**: Migrations not applied or database not populated.

**Solution**:
```powershell
docker exec beuni-backend npx prisma migrate deploy
docker exec beuni-backend npm run prisma:seed
docker restart beuni-backend
```

### **Frontend Doesn't Load CSS**

**Cause**: Incomplete Next.js build.

**Solution**:
```powershell
docker-compose restart frontend
```

### **Redis Connection Errors**

**Cause**: Redis container not running or not ready.

**Solution**:
```powershell
# Check Redis status
docker logs beuni-redis

# Restart Redis
docker restart beuni-redis
```

---

## 🔄 Development Workflow

### **Daily Development Routine**

```powershell
# Start containers (if already created)
docker-compose up -d

# Work on development...

# Stop containers (end of day)
docker-compose down
```

### **After Prisma Schema Changes**

```powershell
# Create new migration
docker exec beuni-backend npx prisma migrate dev --name your_change_description

# Apply in other environments
docker exec beuni-backend npx prisma migrate deploy
```

### **After Git Pull with Changes**

```powershell
# Rebuild containers with latest changes
docker-compose up -d --build

# Apply any new migrations
docker exec beuni-backend npx prisma migrate deploy

# Update dependencies if needed
docker exec beuni-backend npm install
docker exec beuni-frontend npm install
```

---

## 📊 Seed Data Structure

The `npm run prisma:seed` command creates:

### **1 Organization**
- Name: Beuni Demo Company
- ID: demo-org-id

### **1 Admin User**
- Email: ana.rh@beunidemo.com
- Password: 123456
- Role: Admin

### **5 Employees**
- Ana Silva (HR)
- Carlos Santos (IT)
- Maria Oliveira (Marketing)
- João Pereira (Sales)
- Paula Costa (Finance)

### **10 Gift Delivery Records**
- 2 Delivered (last year)
- 2 Sent (last month)
- 3 Ready for shipment (this month)
- 3 Pending (next month)

---

## 🎯 Next Steps After Setup

After successful setup:

1. ✅ Access http://localhost:3000
2. ✅ Login with test credentials
3. ✅ Explore the Dashboard
4. ✅ Check API documentation at http://localhost:3001/api/docs
5. ✅ Read [Development Log](./DEVELOPMENT_LOG.md) to understand the architecture

---

## 📚 Additional Documentation

- **[Development Log](./DEVELOPMENT_LOG.md)** - Complete development history
- **[Product Requirements](../project/PRD.md)** - Product requirements document
- **[Docker Analysis](./DOCKER_COMPOSE_ANALYSIS.md)** - Container setup analysis
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

---

## 🆘 Need Help?

1. Check the logs: `docker logs beuni-backend -f`
2. Consult the **Troubleshooting** section above
3. Read the [Development Log](./DEVELOPMENT_LOG.md) for known issues
4. Check [Troubleshooting Guide](../TROUBLESHOOTING.md) for comprehensive solutions

---

**Last Updated**: October 4, 2025  
**Environment**: Local Development Setup
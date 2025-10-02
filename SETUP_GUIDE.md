# 🚀 Setup Guide - Beuni Dashboard

## 📋 Why does the Prisma error happen every time?

### ❌ **The Problem**

When you run `npx prisma migrate deploy` **outside the Docker container** (in PowerShell/CMD on Windows), you see this error:

```
Error: P1001: Can't reach database server at `postgres:5432`
```

### 🔍 **Technical Explanation**

The `.env` file in the backend contains:

```env
DATABASE_URL="postgresql://beuni:beuni123@postgres:5432/beuni_db"
```

The hostname `postgres:5432` works **only inside the Docker network**. When you run Prisma on **Windows/PowerShell**, it can't resolve this name because:

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

## 🎯 Automatic Setup (Recommended)

### **Windows (PowerShell)**

```powershell
# Run the setup script
.\setup.ps1
```

### **Linux/Mac (Bash)**

```bash
# Make the script executable
chmod +x setup.sh

# Run the script
./setup.sh
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

### **1. Start the containers**

```powershell
docker-compose up -d
```

Wait ~15 seconds for PostgreSQL to fully initialize.

### **2. Generate Prisma Client**

```powershell
docker exec beuni-backend npx prisma generate
```

### **3. Apply Migrations**

```powershell
docker exec beuni-backend npx prisma migrate deploy
```

### **4. Populate Database**

```powershell
docker exec beuni-backend npm run prisma:seed
```

### **5. Verify Status**

```powershell
docker ps
```

You should see 4 containers running:
- ✅ `beuni-frontend` (port 3000)
- ✅ `beuni-backend` (port 3001)
- ✅ `beuni-postgres` (port 15432)
- ✅ `beuni-redis` (port 6379)

---

## 🌐 Available URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | User interface |
| **Backend** | http://localhost:3001 | REST API |
| **Swagger** | http://localhost:3001/api/docs | API documentation |
| **PostgreSQL** | localhost:15432 | Database (use DBeaver/pgAdmin) |
| **Redis** | localhost:6379 | Cache |

---

## 🔑 Test Credentials

### Frontend Login
```
Email:    ana.rh@beunidemo.com
Password: 123456
```

### PostgreSQL Connection (DBeaver/pgAdmin)
```
Host:     localhost
Port:     15432
Database: beuni_db
User:     beuni
Password: beuni123
```

---

## 📝 Useful Commands

### **View real-time logs**

```powershell
# Backend
docker logs beuni-backend -f

# Frontend
docker logs beuni-frontend -f

# PostgreSQL
docker logs beuni-postgres -f
```

### **Stop all containers**

```powershell
docker-compose down
```

### **Stop and remove volumes (clean everything)**

```powershell
docker-compose down -v
```

### **Recreate containers from scratch**

```powershell
docker-compose down -v
docker-compose up -d --build
```

### **Reset database**

```powershell
docker exec beuni-backend npx prisma migrate reset --force
```

---

## 🐛 Troubleshooting

### **Error: "Can't reach database server at postgres:5432"**

**Cause**: You're running Prisma outside the container.

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

### **Backend unhealthy**

**Cause**: Migrations not applied or database not populated.

**Solution**:
```powershell
docker exec beuni-backend npx prisma migrate deploy
docker exec beuni-backend npm run prisma:seed
docker restart beuni-backend
```

### **Frontend doesn't load CSS**

**Cause**: Incomplete Next.js build.

**Solution**:
```powershell
docker-compose restart frontend
```

---

## 🔄 Development Workflow

### **Daily routine (containers already created)**

```powershell
# Start containers
docker-compose up -d

# Work normally...

# Stop containers (end of day)
docker-compose down
```

### **After Prisma schema changes**

```powershell
# Create new migration
docker exec beuni-backend npx prisma migrate dev --name your_change

# Apply in other environments
docker exec beuni-backend npx prisma migrate deploy
```

### **After git pull with changes**

```powershell
# Rebuild containers
docker-compose up -d --build

# Apply new migrations
docker exec beuni-backend npx prisma migrate deploy
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

## 🎯 Next Steps

After successful setup:

1. ✅ Access http://localhost:3000
2. ✅ Login with test credentials
3. ✅ Explore the Dashboard
4. ✅ Check API documentation at http://localhost:3001/api/docs
5. ✅ Read `/docs/DEVELOPMENT_LOG.md` to understand the architecture

---

## 📚 Additional Documentation

- **[DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md)** - Complete development log
- **[PRD.md](docs/PRD.md)** - Product requirements
- **[DOCKER_COMPOSE_ANALYSIS.md](docs/DOCKER_COMPOSE_ANALYSIS.md)** - Docker analysis

---

## 🆘 Need Help?

1. Check the logs: `docker logs beuni-backend -f`
2. Consult the **Troubleshooting** section above
3. Read the **DEVELOPMENT_LOG.md** for known issues

---

**Developed with ❤️ by Claude Code + Marvi**

# Troubleshooting Documentation

> **Last Updated**: October 4, 2025
> **Purpose**: Common issues and solutions

---

## 📋 Documentation

| Document | Purpose |
|----------|---------|
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | General troubleshooting guide |
| **[ALPINE_DEBIAN_MIGRATION.md](./ALPINE_DEBIAN_MIGRATION.md)** | Alpine to Debian Docker migration guide |
| **[PRISMA_CORRECTION_GUIDE.md](./PRISMA_CORRECTION_GUIDE.md)** | Prisma database correction procedures |

---

## 🚨 Quick Access

### Common Issues
- Docker container problems
- Database connection issues
- Build and deployment errors
- Prisma migration conflicts

### Diagnostic Tools
```bash
# Check logs
docker-compose logs

# Database status
npx prisma db pull

# Reset database
npx prisma migrate reset
```

---

## 🔗 Related Links
- [Deployment Guide](../deploy/COMPREHENSIVE_DEPLOYMENT_GUIDE.md)
- [Development Guide](../development/SETUP_GUIDE.md)
- [Monitoring](../monitoring/README.md)

**Maintained By**: DevOps Team

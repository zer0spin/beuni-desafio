# 🔧 Scripts Directory

> **Organized automation scripts for the Beuni Platform**

## 📁 Structure

```
scripts/
├── setup/                  # Environment setup scripts
│   ├── setup.ps1          # PowerShell setup for Windows
│   └── setup.sh           # Bash setup for Linux/Mac
│
├── deployment/             # Deployment automation
│   └── railway-check.sh   # Railway service health check
│
├── verification/           # Post-deployment verification
│   ├── verify-deploy.ps1      # Full deployment verification (PowerShell)
│   ├── verify-deploy.sh       # Full deployment verification (Bash)
│   └── verify-deploy-simple.ps1  # Simple verification (PowerShell)
│
└── validation/             # Structure and quality validation
    └── validate-docs-structure.sh # Documentation structure validator
```

## 🚀 Quick Usage

### Environment Setup
```bash
# Linux/Mac
./scripts/setup/setup.sh

# Windows
.\scripts\setup\setup.ps1
```

### Deployment Verification
```bash
# Full verification (Linux/Mac)
./scripts/verification/verify-deploy.sh

# Full verification (Windows)
.\scripts\verification\verify-deploy.ps1

# Simple verification (Windows)
.\scripts\verification\verify-deploy-simple.ps1
```

### Railway Health Check
```bash
./scripts/deployment/railway-check.sh
```

### Documentation Validation
```bash
./scripts/validation/validate-docs-structure.sh
```

## 📝 Script Descriptions

### Setup Scripts
- **setup.ps1**: Windows PowerShell setup script for development environment
- **setup.sh**: Unix/Linux setup script for development environment

### Deployment Scripts  
- **railway-check.sh**: Validates Railway deployment status and health

### Verification Scripts
- **verify-deploy.ps1**: Comprehensive deployment verification for Windows
- **verify-deploy.sh**: Comprehensive deployment verification for Unix/Linux
- **verify-deploy-simple.ps1**: Quick deployment check for Windows

### Validation Scripts
- **validate-docs-structure.sh**: Ensures documentation follows organized structure

## 🛡️ Security Notes

- All scripts are version controlled
- No sensitive data stored in scripts
- Environment variables used for secrets
- Scripts validate inputs before execution

## 📋 Maintenance

- Scripts are tested with each major deployment
- Update scripts when new services are added
- Keep PowerShell and Bash versions in sync
- Document any new scripts in this README

---

**Last Updated**: October 4, 2025  
**Maintained By**: DevOps Team
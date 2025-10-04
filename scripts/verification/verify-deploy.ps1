# Script de verificação pré-deploy para Railway (Windows PowerShell)
# Execute: .\verify-deploy.ps1

$ErrorActionPreference = "Continue"

Write-Host "🔍 Verificando configuração do projeto..." -ForegroundColor Cyan
Write-Host ""

# Função para verificar arquivo
function Check-File {
    param($Path)
    if (Test-Path $Path) {
        Write-Host "✓ $Path encontrado" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Path não encontrado" -ForegroundColor Red
        return $false
    }
}

# Função para verificar conteúdo
function Check-Content {
    param($Path, $Pattern, $Description)
    if ((Test-Path $Path) -and (Select-String -Path $Path -Pattern $Pattern -Quiet)) {
        Write-Host "✓ $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Description" -ForegroundColor Red
        return $false
    }
}

Write-Host "📁 Verificando arquivos necessários..." -ForegroundColor Yellow
Check-File "Dockerfile"
Check-File ".dockerignore"
Check-File "railway.json"
Check-File ".nvmrc"
Check-File "backend\package.json"
Check-File "backend\tsconfig.json"
Check-File "backend\prisma\schema.prisma"
Write-Host ""

Write-Host "🔧 Verificando configurações..." -ForegroundColor Yellow
Check-Content "railway.json" "DOCKERFILE" "railway.json usa builder DOCKERFILE"
Check-Content "railway.json" '"dockerfilePath": "Dockerfile"' "railway.json aponta para Dockerfile correto"
Check-Content "backend\package.json" '"build": "tsc -p tsconfig.json"' "Build script configurado corretamente"
Check-Content "backend\package.json" '"typescript"' "TypeScript em dependencies"
Check-Content "backend\package.json" '"prisma"' "Prisma em dependencies"
Write-Host ""

Write-Host "🐳 Verificando Dockerfile..." -ForegroundColor Yellow
Check-Content "Dockerfile" "backend/package" "Dockerfile usa paths corretos (backend/)"
Check-Content "Dockerfile" "backend/prisma" "Dockerfile copia prisma corretamente"
Check-Content "Dockerfile" "npx prisma generate" "Dockerfile executa prisma generate"
Check-Content "Dockerfile" "npm run build" "Dockerfile executa build"
Check-Content "Dockerfile" "node dist/main.js" "Dockerfile usa comando start correto"
Write-Host ""

Write-Host "📦 Verificando dependências do backend..." -ForegroundColor Yellow
Push-Location backend
try {
    $tsInstalled = npm list typescript 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ TypeScript instalado" -ForegroundColor Green
    } else {
        Write-Host "✗ TypeScript não instalado - execute: cd backend; npm install" -ForegroundColor Red
    }

    $prismaInstalled = npm list prisma 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Prisma instalado" -ForegroundColor Green
    } else {
        Write-Host "✗ Prisma não instalado - execute: cd backend; npm install" -ForegroundColor Red
    }
} finally {
    Pop-Location
}
Write-Host ""

Write-Host "🔨 Testando build do TypeScript..." -ForegroundColor Yellow
Push-Location backend
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build TypeScript bem-sucedido" -ForegroundColor Green
        if (Test-Path "dist") {
            Write-Host "✓ Pasta dist/ criada" -ForegroundColor Green
        } else {
            Write-Host "✗ Pasta dist/ não foi criada" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Build TypeScript falhou" -ForegroundColor Red
    }
} finally {
    Pop-Location
}
Write-Host ""

Write-Host "🗄️ Verificando Prisma..." -ForegroundColor Yellow
Push-Location backend
try {
    $prismaValidate = npx prisma validate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Schema Prisma válido" -ForegroundColor Green
    } else {
        Write-Host "✗ Schema Prisma inválido" -ForegroundColor Red
    }
} finally {
    Pop-Location
}
Write-Host ""

Write-Host "📋 Checklist de variáveis de ambiente no Railway:" -ForegroundColor Cyan
Write-Host "⚠ Verifique se configurou no Railway Dashboard:" -ForegroundColor Yellow
Write-Host "  - DATABASE_URL"
Write-Host "  - REDIS_URL"
Write-Host "  - JWT_SECRET"
Write-Host "  - NODE_ENV=production"
Write-Host "  - PORT=`${{PORT}}"
Write-Host "  - CORS_ORIGIN"
Write-Host ""

Write-Host "✅ Verificação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Commit e push: git add . ; git commit -m 'fix(railway): deploy configuration' ; git push"
Write-Host "2. Configure variáveis de ambiente no Railway Dashboard"
Write-Host "3. Deploy: railway up (ou configure auto-deploy no GitHub)"
Write-Host "4. Execute migrations: railway run npx prisma migrate deploy"
Write-Host ""
Write-Host "📖 Consulte RAILWAY_DEPLOY.md para instruções detalhadas" -ForegroundColor Cyan

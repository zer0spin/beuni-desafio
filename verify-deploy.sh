#!/bin/bash
# Script de verificação pré-deploy para Railway
# Execute: bash verify-deploy.sh

set -e

echo "🔍 Verificando configuração do projeto..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar arquivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 encontrado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 não encontrado"
        return 1
    fi
}

# Função para verificar conteúdo
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        return 1
    fi
}

echo "📁 Verificando arquivos necessários..."
check_file "Dockerfile"
check_file ".dockerignore"
check_file "railway.json"
check_file ".nvmrc"
check_file "backend/package.json"
check_file "backend/tsconfig.json"
check_file "backend/prisma/schema.prisma"
echo ""

echo "🔧 Verificando configurações..."
check_content "railway.json" "DOCKERFILE" "railway.json usa builder DOCKERFILE"
check_content "railway.json" '"dockerfilePath": "Dockerfile"' "railway.json aponta para Dockerfile correto"
check_content "backend/package.json" '"build": "tsc -p tsconfig.json"' "Build script configurado corretamente"
check_content "backend/package.json" '"typescript"' "TypeScript em dependencies"
check_content "backend/package.json" '"prisma"' "Prisma em dependencies"
echo ""

echo "🐳 Verificando Dockerfile..."
check_content "Dockerfile" "backend/package" "Dockerfile usa paths corretos (backend/)"
check_content "Dockerfile" "backend/prisma" "Dockerfile copia prisma corretamente"
check_content "Dockerfile" "npx prisma generate" "Dockerfile executa prisma generate"
check_content "Dockerfile" "npm run build" "Dockerfile executa build"
check_content "Dockerfile" "node dist/main.js" "Dockerfile usa comando start correto"
echo ""

echo "📦 Verificando dependências do backend..."
cd backend
if npm list typescript > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript instalado"
else
    echo -e "${RED}✗${NC} TypeScript não instalado - execute: cd backend && npm install"
fi

if npm list prisma > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Prisma instalado"
else
    echo -e "${RED}✗${NC} Prisma não instalado - execute: cd backend && npm install"
fi
cd ..
echo ""

echo "🔨 Testando build do TypeScript..."
cd backend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build TypeScript bem-sucedido"
    if [ -d "dist" ]; then
        echo -e "${GREEN}✓${NC} Pasta dist/ criada"
    else
        echo -e "${RED}✗${NC} Pasta dist/ não foi criada"
    fi
else
    echo -e "${RED}✗${NC} Build TypeScript falhou"
fi
cd ..
echo ""

echo "🗄️ Verificando Prisma..."
cd backend
if npx prisma validate > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Schema Prisma válido"
else
    echo -e "${RED}✗${NC} Schema Prisma inválido"
fi
cd ..
echo ""

echo "📋 Checklist de variáveis de ambiente no Railway:"
echo -e "${YELLOW}⚠${NC} Verifique se configurou no Railway Dashboard:"
echo "  - DATABASE_URL"
echo "  - REDIS_URL"
echo "  - JWT_SECRET"
echo "  - NODE_ENV=production"
echo "  - PORT=\${{PORT}}"
echo "  - CORS_ORIGIN"
echo ""

echo "✅ Verificação concluída!"
echo ""
echo "📚 Próximos passos:"
echo "1. Commit e push: git add . && git commit -m 'fix(railway): deploy configuration' && git push"
echo "2. Configure variáveis de ambiente no Railway Dashboard"
echo "3. Deploy: railway up (ou configure auto-deploy no GitHub)"
echo "4. Execute migrations: railway run npx prisma migrate deploy"
echo ""
echo "📖 Consulte RAILWAY_DEPLOY.md para instruções detalhadas"

#!/bin/bash
# ============================================
# Beuni Setup Script - Bash (Linux/Mac)
# ============================================
# Este script automatiza o setup completo do ambiente Beuni
# Desenvolvedor: Claude Code + Marvi

echo "🚀 Beuni Setup - Iniciando..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 1. Verificar se Docker está rodando
echo -e "${YELLOW}🔍 Verificando Docker...${NC}"
if ! docker ps >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando! Inicie o Docker e tente novamente.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está rodando${NC}"
echo ""

# 2. Parar e remover containers existentes
echo -e "${YELLOW}🛑 Parando containers existentes...${NC}"
docker-compose down -v
echo -e "${GREEN}✅ Containers removidos${NC}"
echo ""

# 3. Subir containers
echo -e "${YELLOW}🚀 Subindo containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Containers iniciados${NC}"
echo ""

# 4. Aguardar PostgreSQL ficar pronto
echo -e "${YELLOW}⏳ Aguardando PostgreSQL ficar pronto...${NC}"
sleep 15
echo -e "${GREEN}✅ PostgreSQL pronto${NC}"
echo ""

# 5. Executar Prisma generate
echo -e "${YELLOW}🔧 Gerando Prisma Client...${NC}"
docker exec beuni-backend npx prisma generate
echo -e "${GREEN}✅ Prisma Client gerado${NC}"
echo ""

# 6. Executar migrations
echo -e "${YELLOW}📦 Aplicando migrations...${NC}"
docker exec beuni-backend npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations aplicadas${NC}"
echo ""

# 7. Popular banco de dados
echo -e "${YELLOW}🌱 Populando banco de dados...${NC}"
docker exec beuni-backend npm run prisma:seed
echo -e "${GREEN}✅ Banco de dados populado${NC}"
echo ""

# 8. Verificar status dos containers
echo -e "${CYAN}📊 Status dos containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 9. Mensagem final
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${CYAN}🌐 URLs disponíveis:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Swagger:  http://localhost:3001/api/docs"
echo ""
echo -e "${CYAN}📧 Login de teste:${NC}"
echo "   Email:    ana.rh@beunidemo.com"
echo "   Senha:    123456"
echo ""
echo -e "${CYAN}📝 Comandos úteis:${NC}"
echo "   Ver logs backend:  docker logs beuni-backend -f"
echo "   Ver logs frontend: docker logs beuni-frontend -f"
echo "   Parar tudo:        docker-compose down"
echo "   Recriar tudo:      ./setup.sh"
echo ""

# ============================================
# Beuni Setup Script - PowerShell
# ============================================
# Este script automatiza o setup completo do ambiente Beuni
# Desenvolvedor: Claude Code + Marvi

Write-Host "🚀 Beuni Setup - Iniciando..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se Docker está rodando
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker não está rodando! Inicie o Docker Desktop e tente novamente." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado! Instale o Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Parar e remover containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down -v
Write-Host "✅ Containers removidos" -ForegroundColor Green
Write-Host ""

# 3. Subir containers
Write-Host "🚀 Subindo containers..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✅ Containers iniciados" -ForegroundColor Green
Write-Host ""

# 4. Aguardar PostgreSQL ficar pronto
Write-Host "⏳ Aguardando PostgreSQL ficar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host "✅ PostgreSQL pronto" -ForegroundColor Green
Write-Host ""

# 5. Executar Prisma generate
Write-Host "🔧 Gerando Prisma Client..." -ForegroundColor Yellow
docker exec beuni-backend npx prisma generate
Write-Host "✅ Prisma Client gerado" -ForegroundColor Green
Write-Host ""

# 6. Executar migrations
Write-Host "📦 Aplicando migrations..." -ForegroundColor Yellow
docker exec beuni-backend npx prisma migrate deploy
Write-Host "✅ Migrations aplicadas" -ForegroundColor Green
Write-Host ""

# 7. Popular banco de dados
Write-Host "🌱 Populando banco de dados..." -ForegroundColor Yellow
docker exec beuni-backend npm run prisma:seed
Write-Host "✅ Banco de dados populado" -ForegroundColor Green
Write-Host ""

# 8. Verificar status dos containers
Write-Host "📊 Status dos containers:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""

# 9. Mensagem final
Write-Host "======================================" -ForegroundColor Green
Write-Host "✅ Setup concluído com sucesso!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs disponíveis:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Swagger:  http://localhost:3001/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "📧 Login de teste:" -ForegroundColor Cyan
Write-Host "   Email:    ana.rh@beunidemo.com" -ForegroundColor White
Write-Host "   Senha:    123456" -ForegroundColor White
Write-Host ""
Write-Host "📝 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   Ver logs backend:  docker logs beuni-backend -f" -ForegroundColor White
Write-Host "   Ver logs frontend: docker logs beuni-frontend -f" -ForegroundColor White
Write-Host "   Parar tudo:        docker-compose down" -ForegroundColor White
Write-Host "   Recriar tudo:      .\setup.ps1" -ForegroundColor White
Write-Host ""

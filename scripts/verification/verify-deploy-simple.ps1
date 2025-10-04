# Script simples de verificacao pre-deploy para Railway
# Execute: .\verify-deploy-simple.ps1

Write-Host "`n=== Verificando configuracao do projeto ===" -ForegroundColor Cyan

Write-Host "`nArquivos necessarios:" -ForegroundColor Yellow
@("Dockerfile", ".dockerignore", "railway.json", ".nvmrc", "backend\package.json") | ForEach-Object {
    if (Test-Path $_) {
        Write-Host "  [OK] $_" -ForegroundColor Green
    } else {
        Write-Host "  [FALTA] $_" -ForegroundColor Red
    }
}

Write-Host "`nTestando build do backend..." -ForegroundColor Yellow
Push-Location backend
npm run build *>&1 | Out-Null
if ($LASTEXITCODE -eq 0 -and (Test-Path "dist")) {
    Write-Host "  [OK] Build TypeScript funcionando" -ForegroundColor Green
} else {
    Write-Host "  [ERRO] Build TypeScript falhou" -ForegroundColor Red
}
Pop-Location

Write-Host "`nProximos passos:" -ForegroundColor Cyan
Write-Host "1. git add . && git commit -m 'fix(railway): deploy' && git push"
Write-Host "2. Configure variaveis no Railway Dashboard"
Write-Host "3. Execute: railway up"
Write-Host "`nConsulte RAILWAY_DEPLOY.md para detalhes`n" -ForegroundColor Gray

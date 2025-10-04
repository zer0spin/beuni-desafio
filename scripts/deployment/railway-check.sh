#!/bin/bash
# Script de diagnóstico para Railway
# Execute: railway run bash railway-check.sh

echo "=== RAILWAY ENVIRONMENT DIAGNOSTIC ==="
echo ""

echo "1. Verificando variáveis de ambiente:"
echo "-----------------------------------"
echo "DATABASE_URL: ${DATABASE_URL:-[NOT SET]}"
echo "REDIS_URL: ${REDIS_URL:-[NOT SET]}"
echo "PORT: ${PORT:-[NOT SET]}"
echo "NODE_ENV: ${NODE_ENV:-[NOT SET]}"
echo ""

echo "2. Verificando se são strings literais:"
echo "-----------------------------------"
if [[ "$DATABASE_URL" == *"{{Postgres"* ]]; then
    echo "❌ ERROR: DATABASE_URL is a literal string, not a reference!"
    echo "   Value: $DATABASE_URL"
else
    echo "✅ DATABASE_URL appears to be a real URL"
fi

if [[ "$REDIS_URL" == *"{{Redis"* ]]; then
    echo "❌ ERROR: REDIS_URL is a literal string, not a reference!"
    echo "   Value: $REDIS_URL"
else
    echo "✅ REDIS_URL appears to be a real URL"
fi
echo ""

echo "3. Verificando conexão com serviços:"
echo "-----------------------------------"
# Extrair host do DATABASE_URL
if [[ -n "$DATABASE_URL" && "$DATABASE_URL" != *"{{"* ]]; then
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    echo "Database host: $DB_HOST"
    if command -v nc &> /dev/null; then
        nc -zv $DB_HOST 5432 2>&1 | grep -q succeeded && echo "✅ PostgreSQL reachable" || echo "❌ PostgreSQL unreachable"
    fi
fi

if [[ -n "$REDIS_URL" && "$REDIS_URL" != *"{{"* ]]; then
    REDIS_HOST=$(echo $REDIS_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    echo "Redis host: $REDIS_HOST"
    if command -v nc &> /dev/null; then
        nc -zv $REDIS_HOST 6379 2>&1 | grep -q succeeded && echo "✅ Redis reachable" || echo "❌ Redis unreachable"
    fi
fi
echo ""

echo "4. Listando todos os serviços Railway no projeto:"
echo "-----------------------------------"
railway status 2>/dev/null || echo "Railway CLI não disponível no container"
echo ""

echo "5. Verificando se PostgreSQL e Redis estão linkados:"
echo "-----------------------------------"
railway variables 2>/dev/null | grep -E "(DATABASE_URL|REDIS_URL)" || echo "Não foi possível listar variáveis"
echo ""

echo "=== FIM DO DIAGNÓSTICO ==="

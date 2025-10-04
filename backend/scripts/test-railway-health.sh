#!/bin/bash
# Railway Health Check Script

echo "🏥 Beuni Backend - Railway Health Check"
echo "========================================"

# Test PostgreSQL connection
echo ""
echo "📊 PostgreSQL Connection Test:"
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
else
    echo "✅ DATABASE_URL is configured"
    psql "$DATABASE_URL" -c "SELECT 'PostgreSQL is healthy!' as status, version();" 2>&1 || echo "⚠️  Connection failed"
fi

# Test Redis connection
echo ""
echo "🔴 Redis Connection Test:"
if [ -z "$REDIS_URL" ]; then
    echo "❌ REDIS_URL not set"
else
    echo "✅ REDIS_URL is configured"
    redis-cli -u "$REDIS_URL" PING 2>&1 || echo "⚠️  Connection failed"
fi

# Check environment variables
echo ""
echo "🔐 Environment Variables:"
echo "  NODE_ENV: ${NODE_ENV:-not set}"
echo "  PORT: ${PORT:-not set}"
echo "  JWT_SECRET: ${JWT_SECRET:+configured}"
echo "  JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-not set}"
echo "  CORS_ORIGIN: ${CORS_ORIGIN:-not set}"
echo "  VIACEP_API_URL: ${VIACEP_API_URL:-not set}"
echo "  RATE_LIMIT_LOGIN: ${RATE_LIMIT_LOGIN:-not set}"
echo "  RATE_LIMIT_CEP: ${RATE_LIMIT_CEP:-not set}"

echo ""
echo "✅ Health check complete!"

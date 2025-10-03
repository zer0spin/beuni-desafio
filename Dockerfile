# Railway-optimized Dockerfile for NestJS Backend
# Build from repository root
# Using Debian Slim instead of Alpine for better Prisma compatibility
FROM node:18-slim AS deps
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
# Install ALL deps (incl. dev) for build & prisma generate
RUN npm ci && npm cache clean --force

FROM node:18-slim AS builder
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
RUN npx prisma generate && npm run build

FROM node:18-slim AS runner
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY backend/package*.json ./
EXPOSE $PORT
CMD ["node", "dist/main.js"]

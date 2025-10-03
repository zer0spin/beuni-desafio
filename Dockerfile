# Railway-optimized Dockerfile for NestJS Backend
# Build from repository root
FROM node:18-alpine AS deps
RUN apk add --no-cache openssl
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
# Install ALL deps (incl. dev) for build & prisma generate
RUN npm ci && npm cache clean --force

FROM node:18-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
RUN npx prisma generate && npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY backend/package*.json ./
EXPOSE $PORT
CMD ["node", "dist/main.js"]

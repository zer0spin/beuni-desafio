# Railway-optimized Dockerfile for NestJS Backend
FROM node:18-alpine AS deps
# Install OpenSSL and required packages for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Install ALL deps (incl. dev) for build & prisma generate
RUN npm ci && npm cache clean --force

FROM node:18-alpine AS builder
# Install OpenSSL and required packages for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:18-alpine AS runner
# Install OpenSSL and required packages for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
## Ensure public assets folder exists even if empty (prevents cache inconsistency issues on Railway)
RUN mkdir -p public
COPY --from=builder /app/public ./public
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE $PORT
CMD ["node", "dist/main.js"]
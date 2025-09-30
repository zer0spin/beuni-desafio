# ----- 1. ESTÁGIO BASE (com TODAS as dependências) -----
# Este estágio instala tudo, inclusive devDependencies
FROM node:18-alpine AS base

# Adiciona pacotes necessários para o Prisma
RUN apk add --no-cache openssl

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ----- 2. ESTÁGIO DE BUILD (usado para produção) -----
# Começa a partir do estágio base, que já tem tudo instalado
FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run prisma:generate
RUN npm run build

# ----- 3. ESTÁGIO DE PRODUÇÃO (final e enxuto) -----
# Começa de uma imagem limpa para ser o menor possível
FROM node:18-alpine AS production

# Adiciona pacotes necessários na imagem de produção também
RUN apk add --no-cache openssl

WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main"]

# ----- 4. ESTÁGIO DE DESENVOLVIMENTO (COM A CORREÇÃO) -----
# Começa a partir do estágio base, que tem as devDependencies
FROM base AS development
WORKDIR /app

# PRIMEIRO, copie as node_modules do estágio 'base'
COPY --from=base /app/node_modules ./node_modules

# DEPOIS, copie o resto do código fonte.
# Isso garante que a pasta node_modules não seja sobrescrita.
COPY . .

EXPOSE 3001
# O comando padrão para este estágio é o de desenvolvimento
CMD ["npm", "run", "start:dev"]
# Railway-optimized Dockerfile for NestJS Backend
FROM node:18-alpine

# Add necessary packages for Prisma
RUN apk add --no-cache openssl

# Create and change to the app directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the port Railway expects
EXPOSE $PORT

# Start the application
CMD ["node", "dist/main.js"]
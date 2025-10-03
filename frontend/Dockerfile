# Railway-optimized Dockerfile for Next.js Frontend
FROM node:18-alpine

# Install dependencies for Next.js
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . ./

# Build the application
RUN npm run build

# Expose the port Railway expects
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]
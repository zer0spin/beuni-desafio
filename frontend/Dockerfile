FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Clear Next.js cache and build fresh
RUN rm -rf .next

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV development

# Start development server
CMD ["npm", "run", "dev"]
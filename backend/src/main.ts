import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
// Usar require para compatibilidade com CommonJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CsrfGuard } from './common/guards/csrf.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // SECURITY: Global exception filter to prevent information disclosure
  app.useGlobalFilters(new HttpExceptionFilter());

  // Security headers with Helmet (stricter in production)
  const isProd = process.env.NODE_ENV === 'production';
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Allow inline/eval only in non-production for Swagger UI convenience
        styleSrc: isProd ? ["'self'"] : ["'self'", "'unsafe-inline'"],
        scriptSrc: isProd ? ["'self'"] : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    // Enable HSTS in production
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: false } : false,
    crossOriginEmbedderPolicy: isProd ? true : false,
    crossOriginResourcePolicy: { policy: isProd ? 'same-origin' : 'cross-origin' },
  }));

  // Global validation pipe with class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide validation errors in production
    }),
  );

  // CORS configuration with security enhancements and fallbacks
  const allowedOrigins = [
    'http://localhost:3000', // Local development
    'https://localhost:3000', // Local development with HTTPS
    'https://beuni-frontend-one.vercel.app', // Vercel production domain
    /^https:\/\/beuni-frontend.*\.vercel\.app$/, // Any Vercel deployment (preview, staging, etc)
    /^https:\/\/.*\.beuni\.app$/, // Custom domain pattern
    /^https:\/\/.*\.railway\.app$/, // Railway domain pattern for API
  ];

  // Add CORS_ORIGIN from environment if exists
  if (process.env.CORS_ORIGIN) {
    const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);
    allowedOrigins.push(...envOrigins);
  }

  // Add FRONTEND_URL from environment if exists (fallback)
  if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Swagger/OpenAPI Documentation - disabled in production
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Beuni - API de Gestão de Aniversariantes')
      .setDescription(
        'API REST para gerenciar colaboradores e automatizar o envio de brindes de aniversário. ' +
        'Esta API faz parte da plataforma SaaS da Beuni para seus clientes.'
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do endpoint de login',
        },
        'jwt'
      )
      .addTag('Auth', 'Autenticação de usuários')
      .addTag('Colaboradores', 'Gestão de colaboradores e aniversariantes')
      .addTag('CEP', 'Consulta de endereços via CEP')
      .addTag('Envio Brindes', 'Gestão de envios de brindes')
      .addTag('Organizações', 'Gestão de organizações (multi-tenant)')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = parseInt(process.env.PORT || '3001', 10);

  // Register global CSRF guard with DI
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new CsrfGuard(reflector));

  await app.listen(port, '0.0.0.0');

  console.log('🚀 Beuni Backend API rodando em:', `http://0.0.0.0:${port}`);
  console.log('📚 Documentação Swagger disponível em:', `http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
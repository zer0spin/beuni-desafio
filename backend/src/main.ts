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

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for Swagger UI
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for Swagger UI
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin for Swagger
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

  // CORS configuration with security enhancements
  app.enableCors({
    origin: [
      'http://localhost:3000', // Local development
      'https://localhost:3000', // Local development with HTTPS
      'https://beuni-frontend-one.vercel.app', // Vercel production domain
      /^https:\/\/beuni-frontend.*\.vercel\.app$/, // Any Vercel deployment (preview, staging, etc)
      /^https:\/\/.*\.beuni\.app$/, // Custom domain pattern
      ...((process.env.CORS_ORIGIN?.split(',')) || []), // Additional domains from env
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Swagger/OpenAPI Documentation
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
      persistAuthorization: true, // Keep auth token after page refresh
    },
  });

  const port = parseInt(process.env.PORT || '3001', 10);

  // Register global CSRF guard with DI
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new CsrfGuard(reflector));

  await app.listen(port, '0.0.0.0');

  console.log('🚀 Beuni Backend API rodando em:', `http://0.0.0.0:${port}`);
  console.log('📚 Documentação Swagger disponível em:', `http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
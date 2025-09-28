import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe with class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
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

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log('🚀 Beuni Backend API rodando em:', `http://localhost:${port}`);
  console.log('📚 Documentação Swagger disponível em:', `http://localhost:${port}/api/docs`);
}

bootstrap();
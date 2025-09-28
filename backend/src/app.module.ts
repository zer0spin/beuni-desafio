import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

// Configuration
import { DatabaseModule } from './config/database.module';
import { ThrottlerConfigService } from './config/throttler.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { ColaboradoresModule } from './modules/colaboradores/colaboradores.module';
import { CepModule } from './modules/cep/cep.module';
import { EnvioBrindesModule } from './modules/envio-brindes/envio-brindes.module';
import { OrganizacoesModule } from './modules/organizacoes/organizacoes.module';

// Global services
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database (Prisma)
    DatabaseModule,

    // Cache with Redis
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_URL?.split('//')[1]?.split(':')[0] || 'localhost',
            port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
          },
        });

        return {
          store: () => store,
          ttl: 300000, // 5 minutes default TTL
        };
      },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerConfigService,
    }),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Business modules
    AuthModule,
    ColaboradoresModule,
    CepModule,
    EnvioBrindesModule,
    OrganizacoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
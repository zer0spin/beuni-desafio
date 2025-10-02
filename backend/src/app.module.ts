import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Configuration
import { DatabaseModule } from './config/database.module';
import { ThrottlerConfigService } from './config/throttler.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { ColaboradoresModule } from './modules/colaboradores/colaboradores.module';
import { CepModule } from './modules/cep/cep.module';
import { EnvioBrindesModule } from './modules/envio-brindes/envio-brindes.module';
import { OrganizacoesModule } from './modules/organizacoes/organizacoes.module';
import { NotificacoesModule } from './modules/notificacoes/notificacoes.module';

// Global services
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisService } from './shared/redis.service';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database (Prisma)
    DatabaseModule,

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
    NotificacoesModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {}
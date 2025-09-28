import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('🗄️  Conectado ao banco de dados PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Desconectado do banco de dados PostgreSQL');
  }

  // Helper method for enabling/disabling query logging in development
  enableQueryLog() {
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: any) => {
        console.log('🔍 Query:', e.query);
        console.log('⏱️  Duration:', e.duration + 'ms');
      });
    }
  }
}
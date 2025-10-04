import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Retry logic for Railway - PostgreSQL may not be ready immediately
    const maxRetries = 10;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        console.log('🗄️  Conectado ao banco de dados PostgreSQL');
        return;
      } catch (error) {
        console.warn(`⚠️  Tentativa ${attempt}/${maxRetries} de conexão com PostgreSQL falhou`);

        if (attempt === maxRetries) {
          console.error('❌ FATAL: Não foi possível conectar ao PostgreSQL após', maxRetries, 'tentativas');
          throw error;
        }

        console.log(`⏳ Aguardando ${retryDelay}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
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
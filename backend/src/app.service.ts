import { Injectable } from '@nestjs/common';
import { RedisService } from './shared/redis.service';
import { PrismaService } from './shared/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private redisService?: RedisService,
    private prismaService?: PrismaService,
  ) {}

  getHealthCheck() {
    return {
      message: '🎉 Beuni API está funcionando!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getDetailedHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: this.prismaService ? 'connected' : 'not_available',
        redis: this.redisService?.getConnectionStatus() ? 'connected' : 'disconnected',
      },
    };
  }
}
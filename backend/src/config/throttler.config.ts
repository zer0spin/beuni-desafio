import { Injectable } from '@nestjs/common';
import { ThrottlerOptionsFactory, ThrottlerModuleOptions } from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  createThrottlerOptions(): ThrottlerModuleOptions {
    return [
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'login',
        ttl: 60000, // 1 minute
        limit: parseInt(process.env.RATE_LIMIT_LOGIN || '5'), // 5 login attempts per minute
      },
      {
        name: 'cep',
        ttl: 60000, // 1 minute
        limit: parseInt(process.env.RATE_LIMIT_CEP || '30'), // 30 CEP queries per minute
      },
    ];
  }
}
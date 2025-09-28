import { Injectable } from '@nestjs/common';
import { ThrottlerOptionsFactory, ThrottlerModuleOptions } from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    };
  }
}
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CepController } from './cep.controller';
import { CepService } from './cep.service';
import { RedisService } from '../../shared/redis.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [CepController],
  providers: [CepService, RedisService],
  exports: [CepService],
})
export class CepModule {}
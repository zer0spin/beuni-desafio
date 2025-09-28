import { Module } from '@nestjs/common';
import { EnvioBrindesController } from './envio-brindes.controller';
import { EnvioBrindesService } from './envio-brindes.service';
import { BusinessDaysService } from './business-days.service';

@Module({
  controllers: [EnvioBrindesController],
  providers: [EnvioBrindesService, BusinessDaysService],
  exports: [EnvioBrindesService],
})
export class EnvioBrindesModule {}
import { Module } from '@nestjs/common';
import { EnvioBrindesController } from './envio-brindes.controller';
import { EnvioBrindesService } from './envio-brindes.service';
import { BusinessDaysService } from './business-days.service';
import { HolidaysService } from './holidays.service';

@Module({
  controllers: [EnvioBrindesController],
  providers: [EnvioBrindesService, BusinessDaysService, HolidaysService],
  exports: [EnvioBrindesService, BusinessDaysService, HolidaysService],
})
export class EnvioBrindesModule {}
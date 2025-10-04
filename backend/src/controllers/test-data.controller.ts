import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { TestDataService } from '../shared/services/test-data.service';

@Controller('test-data')
@UseGuards(JwtAuthGuard)
export class TestDataController {
  constructor(private readonly testDataService: TestDataService) {}

  @Post('update-envio-status')
  async updateEnvioStatus() {
    return this.testDataService.updateEnvioStatusForTesting();
  }
}
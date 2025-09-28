import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check da API' })
  @ApiResponse({
    status: 200,
    description: 'API está funcionando corretamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        environment: { type: 'string' },
      }
    }
  })
  getHello() {
    return this.appService.getHealthCheck();
  }

  @Get('health')
  @ApiOperation({ summary: 'Endpoint específico de health check' })
  @ApiResponse({
    status: 200,
    description: 'Status detalhado da aplicação',
  })
  getHealth() {
    return this.appService.getDetailedHealth();
  }
}
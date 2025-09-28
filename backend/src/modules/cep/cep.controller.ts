import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CepService } from './cep.service';
import { CepResponseDto } from './dto/cep-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('CEP')
@Controller('cep')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@ApiBearerAuth('jwt')
export class CepController {
  constructor(private readonly cepService: CepService) {}

  @Get(':cep')
  @Throttle(30, 60) // 30 requests per minute
  @ApiOperation({ summary: 'Consultar endereço por CEP' })
  @ApiParam({
    name: 'cep',
    description: 'CEP para consulta (8 dígitos, com ou sem formatação)',
    example: '01310100',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do endereço encontrado',
    type: CepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'CEP inválido ou não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido',
  })
  @ApiResponse({
    status: 429,
    description: 'Limite de consultas por minuto excedido',
  })
  async consultarCep(@Param('cep') cep: string): Promise<CepResponseDto | null> {
    return this.cepService.consultarCep(cep);
  }
}
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { EnvioBrindesService } from './envio-brindes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Envio Brindes')
@Controller('envio-brindes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class EnvioBrindesController {
  constructor(private readonly envioBrindesService: EnvioBrindesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar envios de brindes',
    description: 'Retorna todos os envios de brindes da organização com filtros opcionais.'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrar por status (PENDENTE, PRONTO_PARA_ENVIO, ENVIADO, ENTREGUE, CANCELADO)',
  })
  @ApiQuery({
    name: 'ano',
    required: false,
    type: Number,
    description: 'Filtrar por ano (padrão: ano atual)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10, máximo: 100)',
  })
  @ApiQuery({
    name: 'colaboradorId',
    required: false,
    type: String,
    description: 'Filtrar por ID do colaborador',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de envios de brindes',
  })
  async buscarEnvios(
    @Query('status') status: string,
    @Query('ano') ano: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('colaboradorId') colaboradorId: string,
    @Request() req,
  ) {
    // Converter query params para números
    const anoNum = ano ? parseInt(ano, 10) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.envioBrindesService.buscarEnvios(
      req.user.organizationId,
      {
        status,
        ano: anoNum,
        page: pageNum,
        limit: limitNum,
        colaboradorId
      }
    );
  }

  @Get('prontos-para-envio')
  @ApiOperation({
    summary: 'Listar envios prontos para envio',
    description: 'Retorna todos os brindes que estão marcados como "Pronto para Envio" e precisam ser processados pela logística.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de envios prontos para processamento',
  })
  async buscarEnviosProntosParaEnvio() {
    return this.envioBrindesService.buscarEnviosProntosParaEnvio();
  }

  @Patch(':id/marcar-enviado')
  @ApiOperation({
    summary: 'Marcar envio como realizado',
    description: 'Atualiza o status de um envio para "ENVIADO" quando a logística processa o brinde.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        observacoes: {
          type: 'string',
          description: 'Observações sobre o envio (opcional)',
          example: 'Enviado via Correios - Código de rastreamento: BR123456789'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Envio marcado como realizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Envio não encontrado',
  })
  async marcarEnvioRealizado(
    @Param('id') id: string,
    @Body() body: { observacoes?: string },
  ) {
    return this.envioBrindesService.marcarEnvioRealizado(id, body.observacoes);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Atualizar status do envio',
    description: 'Atualiza o status de um envio de brinde para qualquer estado válido.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDENTE', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'],
          description: 'Novo status do envio',
        },
        observacoes: {
          type: 'string',
          description: 'Observações sobre a mudança (opcional)',
        }
      },
      required: ['status']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Status do envio atualizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Envio não encontrado',
  })
  async atualizarStatusEnvio(
    @Param('id') id: string,
    @Body() body: { status: string; observacoes?: string },
    @Request() req,
  ) {
    return this.envioBrindesService.atualizarStatusEnvio(
      id,
      body.status,
      req.user.organizationId,
      body.observacoes
    );
  }

  @Get('estatisticas')
  @ApiOperation({
    summary: 'Obter estatísticas de envios da organização',
    description: 'Retorna estatísticas de envios agrupadas por status para a organização do usuário autenticado.'
  })
  @ApiQuery({
    name: 'ano',
    required: false,
    type: Number,
    description: 'Ano para consulta (padrão: ano atual)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de envios',
    schema: {
      type: 'object',
      properties: {
        ano: { type: 'number' },
        total: { type: 'number' },
        porStatus: {
          type: 'object',
          properties: {
            PENDENTE: { type: 'number' },
            PRONTO_PARA_ENVIO: { type: 'number' },
            ENVIADO: { type: 'number' },
            ENTREGUE: { type: 'number' },
            CANCELADO: { type: 'number' },
          }
        }
      }
    }
  })
  async buscarEstatisticas(
    @Query('ano') ano: string,
    @Request() req,
  ) {
    const anoNum = ano ? parseInt(ano, 10) : undefined;
    return this.envioBrindesService.buscarEstatisticasEnvios(
      req.user.organizationId,
      anoNum,
    );
  }

  @Post('simular-processamento')
  @ApiOperation({
    summary: 'Simular processamento de aniversários',
    description: 'Executa manualmente a lógica de verificação de aniversários próximos (útil para demonstração e testes).'
  })
  @ApiResponse({
    status: 200,
    description: 'Processamento simulado executado',
  })
  async simularProcessamento() {
    return this.envioBrindesService.simularProcessamento();
  }

  @Post('criar-registros-ano/:ano')
  @ApiOperation({
    summary: 'Criar registros para novo ano',
    description: 'Cria registros de envio de brindes para todos os colaboradores em um novo ano.'
  })
  @ApiResponse({
    status: 201,
    description: 'Registros criados para o novo ano',
  })
  async criarRegistrosParaNovoAno(@Param('ano') ano: string) {
    const anoNum = parseInt(ano, 10);
    return this.envioBrindesService.criarRegistrosParaNovoAno(anoNum);
  }
}
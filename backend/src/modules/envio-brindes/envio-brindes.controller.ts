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
        },
        dataEntrega: {
          type: 'string',
          format: 'date',
          description: 'Data de entrega/envio (opcional, padrão: hoje). Formato: YYYY-MM-DD',
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
    @Body() body: { status: string; observacoes?: string; dataEntrega?: string },
    @Request() req,
  ) {
    return this.envioBrindesService.atualizarStatusEnvio(
      id,
      body.status,
      req.user.organizationId,
      body.observacoes,
      body.dataEntrega
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

  @Get('relatorios')
  @ApiOperation({
    summary: 'Obter relatório completo de envios',
    description: 'Retorna relatório completo com estatísticas de colaboradores, aniversariantes e envios por mês.'
  })
  @ApiQuery({
    name: 'ano',
    required: false,
    type: Number,
    description: 'Ano para consulta (padrão: ano atual)',
  })
  @ApiQuery({
    name: 'mes',
    required: false,
    type: Number,
    description: 'Mês para consulta (1-12, opcional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório completo de envios',
  })
  async buscarRelatorios(
    @Query('ano') ano: string,
    @Query('mes') mes: string,
    @Request() req,
  ) {
    const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
    const mesNum = mes ? parseInt(mes, 10) : undefined;
    return this.envioBrindesService.buscarRelatorios(
      req.user.organizationId,
      anoNum,
      mesNum,
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

  @Post('seed-test-data')
  @ApiOperation({
    summary: 'Popular banco com dados de teste',
    description: 'Cria colaboradores e envios de teste para todos os meses e anos (2021-2025)'
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de teste criados com sucesso',
  })
  async seedTestData(@Request() req) {
    return this.envioBrindesService.seedTestData(req.user.organizationId);
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

  @Post('fix-gatilho-dates')
  @ApiOperation({
    summary: 'Corrigir datas de gatilho existentes',
    description: 'Recalcula as datas de gatilho para todos os envios usando 7 dias úteis corretos.'
  })
  @ApiResponse({
    status: 200,
    description: 'Datas corrigidas com sucesso',
  })
  async fixGatilhoDates(@Request() req) {
    return this.envioBrindesService.fixGatilhoDates(req.user.organizationId);
  }
}
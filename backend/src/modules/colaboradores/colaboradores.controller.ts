import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';

import { ColaboradoresService } from './colaboradores.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { ColaboradorResponseDto } from './dto/colaborador-response.dto';
import { ListColaboradoresDto } from './dto/list-colaboradores.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Colaboradores')
@Controller('colaboradores')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class ColaboradoresController {
  constructor(private readonly colaboradoresService: ColaboradoresService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo colaborador' })
  @ApiResponse({
    status: 201,
    description: 'Colaborador cadastrado com sucesso',
    type: ColaboradorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou CEP não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido',
  })
  async create(
    @Body() createColaboradorDto: CreateColaboradorDto,
    @Request() req,
  ): Promise<ColaboradorResponseDto> {
    return this.colaboradoresService.create(
      createColaboradorDto,
      req.user.organizationId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar colaboradores com filtros e paginação' })
  @ApiQuery({
    name: 'mes',
    required: false,
    type: Number,
    description: 'Filtrar por mês de aniversário (1-12)',
  })
  @ApiQuery({
    name: 'departamento',
    required: false,
    type: String,
    description: 'Filtrar por departamento',
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
  @ApiResponse({
    status: 200,
    description: 'Lista de colaboradores',
    schema: {
      type: 'object',
      properties: {
        colaboradores: {
          type: 'array',
          items: { $ref: '#/components/schemas/ColaboradorResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: ListColaboradoresDto, @Request() req) {
    return this.colaboradoresService.findAll(query, req.user.organizationId);
  }

  @Get('aniversariantes-proximos')
  @ApiOperation({ summary: 'Listar aniversariantes do próximo mês' })
  @ApiResponse({
    status: 200,
    description: 'Aniversariantes do próximo mês',
    type: [ColaboradorResponseDto],
  })
  async getAniversariantesProximos(@Request() req) {
    return this.colaboradoresService.getAniversariantesProximos(
      req.user.organizationId,
    );
  }

  @Get('aniversariantes-proximos-30-dias')
  @ApiOperation({ summary: 'Listar aniversariantes dos próximos 30 dias' })
  @ApiResponse({
    status: 200,
    description: 'Aniversariantes dos próximos 30 dias',
    type: [ColaboradorResponseDto],
  })
  async getAniversariantesProximos30Dias(@Request() req) {
    return this.colaboradoresService.getAniversariantesProximos30Dias(
      req.user.organizationId,
    );
  }

  @Get('estatisticas/departamentos')
  @ApiOperation({ summary: 'Estatísticas por departamento' })
  @ApiQuery({
    name: 'ano',
    required: false,
    type: Number,
    description: 'Ano para consulta (padrão: ano atual)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de colaboradores por departamento',
  })
  async getEstatisticasDepartamentos(
    @Query('ano') ano: number,
    @Request() req
  ) {
    return this.colaboradoresService.getEstatisticasDepartamentos(
      req.user.organizationId,
      ano,
    );
  }

  @Get('estatisticas/aniversarios-mes')
  @ApiOperation({ summary: 'Estatísticas de aniversários por mês' })
  @ApiQuery({
    name: 'ano',
    required: false,
    type: Number,
    description: 'Ano para consulta (padrão: ano atual)',
  })
  @ApiResponse({
    status: 200,
    description: 'Distribuição de aniversários por mês do ano',
  })
  async getAniversariosPorMes(
    @Query('ano') ano: number,
    @Request() req
  ) {
    return this.colaboradoresService.getAniversariosPorMes(
      req.user.organizationId,
      ano,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar colaborador por ID' })
  @ApiResponse({
    status: 200,
    description: 'Dados do colaborador',
    type: ColaboradorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Colaborador não encontrado',
  })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.colaboradoresService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar colaborador' })
  @ApiResponse({
    status: 200,
    description: 'Colaborador atualizado com sucesso',
    type: ColaboradorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Colaborador não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou CEP não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateColaboradorDto: UpdateColaboradorDto,
    @Request() req,
  ): Promise<ColaboradorResponseDto> {
    return this.colaboradoresService.update(
      id,
      updateColaboradorDto,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover colaborador' })
  @ApiResponse({
    status: 200,
    description: 'Colaborador removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Colaborador não encontrado',
  })
  async remove(@Param('id') id: string, @Request() req) {
    return this.colaboradoresService.remove(id, req.user.organizationId);
  }

  @Delete()
  @ApiOperation({ 
    summary: 'Delete ALL colaboradores for organization',
    description: 'Removes ALL colaboradores for the organization. This is a destructive operation that cannot be undone and will also delete all related shipment records.'
  })
  @ApiResponse({
    status: 200,
    description: 'All colaboradores deleted successfully',
  })
  async removeAll(@Request() req) {
    return this.colaboradoresService.removeAll(req.user.organizationId);
  }
}
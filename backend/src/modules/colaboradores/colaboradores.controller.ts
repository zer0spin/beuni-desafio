import {
  Controller,
  Get,
  Post,
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
}
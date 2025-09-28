import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { PrismaService } from '../../shared/prisma.service';
import { CepService } from '../cep/cep.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { ColaboradorResponseDto } from './dto/colaborador-response.dto';
import { ListColaboradoresDto } from './dto/list-colaboradores.dto';

@Injectable()
export class ColaboradoresService {
  constructor(
    private prisma: PrismaService,
    private cepService: CepService,
  ) {}

  async create(
    createColaboradorDto: CreateColaboradorDto,
    organizationId: string,
  ): Promise<ColaboradorResponseDto> {
    const { endereco, ...colaboradorData } = createColaboradorDto;

    // Validar e buscar dados do CEP
    const dadosCep = await this.cepService.consultarCep(endereco.cep);
    if (!dadosCep) {
      throw new BadRequestException('CEP não encontrado');
    }

    // Converter string de data para Date object
    const dataNascimento = new Date(createColaboradorDto.data_nascimento);

    // Criar colaborador e endereço em uma transação
    const result = await this.prisma.$transaction(async (tx) => {
      // Criar endereço
      const enderecoCreated = await tx.endereco.create({
        data: {
          cep: endereco.cep,
          logradouro: dadosCep.logradouro,
          numero: endereco.numero,
          complemento: endereco.complemento || null,
          bairro: dadosCep.bairro,
          cidade: dadosCep.cidade,
          uf: dadosCep.uf,
        },
      });

      // Criar colaborador
      const colaborador = await tx.colaborador.create({
        data: {
          nomeCompleto: colaboradorData.nome_completo,
          dataNascimento,
          cargo: colaboradorData.cargo,
          departamento: colaboradorData.departamento,
          organizationId,
          addressId: enderecoCreated.id,
        },
        include: {
          endereco: true,
        },
      });

      // Criar registro de envio de brinde para o ano atual
      const anoAtual = new Date().getFullYear();
      await tx.envioBrinde.create({
        data: {
          colaboradorId: colaborador.id,
          anoAniversario: anoAtual,
          status: 'PENDENTE',
        },
      });

      return colaborador;
    });

    return this.mapToResponseDto(result);
  }

  async findAll(
    query: ListColaboradoresDto,
    organizationId: string,
  ): Promise<{
    colaboradores: ColaboradorResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { mes, departamento, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      organizationId,
    };

    if (departamento) {
      where.departamento = {
        contains: departamento,
        mode: 'insensitive',
      };
    }

    if (mes) {
      // Filtrar por mês de aniversário
      where.dataNascimento = {
        gte: new Date(new Date().getFullYear(), mes - 1, 1),
        lt: new Date(new Date().getFullYear(), mes, 1),
      };
    }

    // Buscar colaboradores com paginação
    const [colaboradores, total] = await Promise.all([
      this.prisma.colaborador.findMany({
        where,
        include: {
          endereco: true,
          enviosBrinde: {
            where: {
              anoAniversario: new Date().getFullYear(),
            },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: {
          dataNascimento: 'asc',
        },
      }),
      this.prisma.colaborador.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      colaboradores: colaboradores.map((c) => this.mapToResponseDto(c)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<ColaboradorResponseDto> {
    const colaborador = await this.prisma.colaborador.findFirst({
      where: {
        id,
        organizationId, // Garantir isolamento por organização
      },
      include: {
        endereco: true,
        enviosBrinde: {
          where: {
            anoAniversario: new Date().getFullYear(),
          },
          take: 1,
        },
      },
    });

    if (!colaborador) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    return this.mapToResponseDto(colaborador);
  }

  async getAniversariantesProximos(organizationId: string) {
    const hoje = new Date();
    const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    const fimProximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 1);

    const aniversariantes = await this.prisma.colaborador.findMany({
      where: {
        organizationId,
        dataNascimento: {
          gte: proximoMes,
          lt: fimProximoMes,
        },
      },
      include: {
        endereco: true,
        enviosBrinde: {
          where: {
            anoAniversario: hoje.getFullYear(),
          },
          take: 1,
        },
      },
      orderBy: {
        dataNascimento: 'asc',
      },
    });

    return aniversariantes.map((c) => this.mapToResponseDto(c));
  }

  private mapToResponseDto(colaborador: any): ColaboradorResponseDto {
    return {
      id: colaborador.id,
      nome_completo: colaborador.nomeCompleto,
      data_nascimento: format(colaborador.dataNascimento, 'dd/MM/yyyy', {
        locale: ptBR,
      }),
      cargo: colaborador.cargo,
      departamento: colaborador.departamento,
      endereco: {
        logradouro: colaborador.endereco.logradouro,
        bairro: colaborador.endereco.bairro,
        cidade: colaborador.endereco.cidade,
        uf: colaborador.endereco.uf,
      },
      status_envio_atual: colaborador.enviosBrinde?.[0]?.status || 'PENDENTE',
    };
  }
}
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
    const proximoMes = hoje.getMonth() + 1; // 0-11, então +1 para próximo mês
    const mesConsulta = proximoMes > 11 ? 1 : proximoMes + 1; // Se dezembro, volta para janeiro

    // Usar raw query para filtrar por mês independente do ano
    const aniversariantes = await this.prisma.$queryRaw`
      SELECT c.*,
             e.id as endereco_id, e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf
      FROM colaboradores c
      LEFT JOIN enderecos e ON c.address_id = e.id
      WHERE c.organization_id = ${organizationId}
      AND EXTRACT(MONTH FROM c.data_nascimento) = ${mesConsulta}
      ORDER BY EXTRACT(DAY FROM c.data_nascimento) ASC
      LIMIT 50
    `;

    // Transformar os resultados no formato esperado
    const colaboradoresFormatados = (aniversariantes as any[]).map((c) => ({
      id: c.id,
      nomeCompleto: c.nome_completo,
      dataNascimento: c.data_nascimento,
      cargo: c.cargo,
      departamento: c.departamento,
      organizationId: c.organization_id,
      endereco: {
        id: c.endereco_id,
        cep: c.cep,
        logradouro: c.logradouro,
        numero: c.numero,
        complemento: c.complemento,
        bairro: c.bairro,
        cidade: c.cidade,
        uf: c.uf,
      },
      enviosBrinde: [], // Será preenchido depois se necessário
    }));

    return colaboradoresFormatados.map((c) => this.mapToResponseDto(c));
  }

  async update(
    id: string,
    updateColaboradorDto: UpdateColaboradorDto,
    organizationId: string,
  ): Promise<ColaboradorResponseDto> {
    // Verificar se o colaborador existe e pertence à organização
    const colaboradorExistente = await this.prisma.colaborador.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        endereco: true,
      },
    });

    if (!colaboradorExistente) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    const { endereco, ...colaboradorData } = updateColaboradorDto;
    let enderecoData: any = null;

    // Se houver dados de endereço, validar e buscar dados do CEP
    if (endereco) {
      const dadosCep = await this.cepService.consultarCep(endereco.cep);
      if (!dadosCep) {
        throw new BadRequestException('CEP não encontrado');
      }

      enderecoData = {
        cep: endereco.cep.replace(/\D/g, ''),
        logradouro: dadosCep.logradouro,
        numero: endereco.numero || '',
        complemento: endereco.complemento || null,
        bairro: dadosCep.bairro,
        cidade: dadosCep.cidade,
        uf: dadosCep.uf,
      };
    }

    // Converter string de data para Date object se fornecida
    if (colaboradorData.dataNascimento) {
      colaboradorData.dataNascimento = new Date(colaboradorData.dataNascimento);
    }

    // Atualizar colaborador e endereço se necessário
    const colaboradorAtualizado = await this.prisma.colaborador.update({
      where: { id },
      data: {
        ...colaboradorData,
        ...(enderecoData && {
          endereco: {
            update: enderecoData,
          },
        }),
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

    return this.mapToResponseDto(colaboradorAtualizado);
  }

  async remove(id: string, organizationId: string) {
    // Verificar se o colaborador existe e pertence à organização
    const colaborador = await this.prisma.colaborador.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!colaborador) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Soft delete - manter para histórico
    await this.prisma.colaborador.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Colaborador removido com sucesso' };
  }

  async getEstatisticasDepartamentos(organizationId: string, ano?: number) {
    const anoConsulta = ano || new Date().getFullYear();

    const departamentos = await this.prisma.colaborador.groupBy({
      by: ['departamento'],
      where: {
        organizationId,
      },
      _count: {
        departamento: true,
      },
    });

    const estatisticas = [];

    for (const dept of departamentos) {
      const [enviosPendentes, enviosRealizados] = await Promise.all([
        this.prisma.envioBrinde.count({
          where: {
            anoAniversario: anoConsulta,
            status: {
              in: ['PENDENTE', 'PRONTO_PARA_ENVIO'],
            },
            colaborador: {
              organizationId,
              departamento: dept.departamento,
            },
          },
        }),
        this.prisma.envioBrinde.count({
          where: {
            anoAniversario: anoConsulta,
            status: {
              in: ['ENVIADO', 'ENTREGUE'],
            },
            colaborador: {
              organizationId,
              departamento: dept.departamento,
            },
          },
        }),
      ]);

      estatisticas.push({
        nome: dept.departamento,
        totalColaboradores: dept._count.departamento,
        enviosPendentes,
        enviosRealizados,
      });
    }

    return estatisticas;
  }

  async getAniversariosPorMes(organizationId: string, ano?: number) {
    const anoConsulta = ano || new Date().getFullYear();

    const meses = [
      { mes: 1, nomeDoMes: 'Janeiro' },
      { mes: 2, nomeDoMes: 'Fevereiro' },
      { mes: 3, nomeDoMes: 'Março' },
      { mes: 4, nomeDoMes: 'Abril' },
      { mes: 5, nomeDoMes: 'Maio' },
      { mes: 6, nomeDoMes: 'Junho' },
      { mes: 7, nomeDoMes: 'Julho' },
      { mes: 8, nomeDoMes: 'Agosto' },
      { mes: 9, nomeDoMes: 'Setembro' },
      { mes: 10, nomeDoMes: 'Outubro' },
      { mes: 11, nomeDoMes: 'Novembro' },
      { mes: 12, nomeDoMes: 'Dezembro' },
    ];

    const estatisticas = [];

    for (const mesInfo of meses) {
      // Contar colaboradores que fazem aniversário no mês
      const totalColaboradores = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM colaboradores c
        WHERE c.organization_id = ${organizationId}
        AND EXTRACT(MONTH FROM c.data_nascimento) = ${mesInfo.mes}
      `;

      const total = Number(totalColaboradores[0].count);

      // Contar envios realizados para este mês
      const enviadosResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM envio_brindes eb
        JOIN colaboradores c ON eb.colaborador_id = c.id
        WHERE c.organization_id = ${organizationId}
        AND eb.ano_aniversario = ${anoConsulta}
        AND eb.status IN ('ENVIADO', 'ENTREGUE')
        AND EXTRACT(MONTH FROM c.data_nascimento) = ${mesInfo.mes}
      `;

      const enviados = Number(enviadosResult[0].count);

      // Contar envios pendentes para este mês
      const pendentesResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM envio_brindes eb
        JOIN colaboradores c ON eb.colaborador_id = c.id
        WHERE c.organization_id = ${organizationId}
        AND eb.ano_aniversario = ${anoConsulta}
        AND eb.status IN ('PENDENTE', 'PRONTO_PARA_ENVIO')
        AND EXTRACT(MONTH FROM c.data_nascimento) = ${mesInfo.mes}
      `;

      const pendentes = Number(pendentesResult[0].count);

      estatisticas.push({
        mes: mesInfo.mes,
        nomeDoMes: mesInfo.nomeDoMes,
        total,
        enviados,
        pendentes,
      });
    }

    return estatisticas;
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
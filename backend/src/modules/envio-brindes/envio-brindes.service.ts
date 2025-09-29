import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addYears, format, getYear } from 'date-fns';

import { PrismaService } from '../../shared/prisma.service';
import { BusinessDaysService } from './business-days.service';

@Injectable()
export class EnvioBrindesService {
  constructor(
    private prisma: PrismaService,
    private businessDaysService: BusinessDaysService,
  ) {}

  /**
   * Cron job que roda todos os dias às 6:00 AM
   * Identifica aniversários que se aproximam e marca brindes como "Pronto para Envio"
   */
  @Cron('0 6 * * *', {
    name: 'verificar-aniversarios-proximos',
    timeZone: 'America/Sao_Paulo',
  })
  async verificarAniversariosProximos() {
    console.log('🎯 Iniciando verificação de aniversários próximos...');

    try {
      const anoAtual = getYear(new Date());

      // Buscar todos os colaboradores
      const colaboradores = await this.prisma.colaborador.findMany({
        include: {
          enviosBrinde: {
            where: {
              anoAniversario: anoAtual,
            },
          },
        },
      });

      let processados = 0;
      let marcadosParaEnvio = 0;

      for (const colaborador of colaboradores) {
        // Calcular a data do aniversário no ano atual
        const dataAniversario = new Date(colaborador.dataNascimento);
        const aniversarioAnoAtual = new Date(anoAtual, dataAniversario.getMonth(), dataAniversario.getDate());

        // Calcular 7 dias úteis antes do aniversário
        const dataGatilhoEnvio = this.businessDaysService.calculateBusinessDaysBefore(
          aniversarioAnoAtual,
          7
        );

        const hoje = new Date();
        const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

        // Verificar se hoje é o dia de marcar para envio
        if (dataGatilhoEnvio.getTime() === dataHoje.getTime()) {
          // Verificar se já existe um envio para este ano
          let envioBrinde = colaborador.enviosBrinde[0];

          if (!envioBrinde) {
            // Criar novo registro de envio
            envioBrinde = await this.prisma.envioBrinde.create({
              data: {
                colaboradorId: colaborador.id,
                anoAniversario: anoAtual,
                status: 'PRONTO_PARA_ENVIO',
                dataGatilhoEnvio: new Date(),
              },
            });
          } else if (envioBrinde.status === 'PENDENTE') {
            // Atualizar status para "pronto para envio"
            await this.prisma.envioBrinde.update({
              where: { id: envioBrinde.id },
              data: {
                status: 'PRONTO_PARA_ENVIO',
                dataGatilhoEnvio: new Date(),
              },
            });
          }

          marcadosParaEnvio++;
          console.log(`📦 Marcado para envio: ${colaborador.nomeCompleto} (aniversário em ${format(aniversarioAnoAtual, 'dd/MM/yyyy')})`);
        }

        processados++;
      }

      console.log(`✅ Verificação concluída: ${processados} colaboradores processados, ${marcadosParaEnvio} marcados para envio`);
    } catch (error) {
      console.error('❌ Erro na verificação de aniversários:', error);
    }
  }

  /**
   * Buscar envios com filtros e paginação
   */
  async buscarEnvios(
    organizationId: string,
    options: {
      status?: string;
      ano?: number;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { status, ano, page = 1, limit = 10 } = options;
    const anoConsulta = ano || getYear(new Date());
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Máximo 100 itens por página

    const where: any = {
      anoAniversario: anoConsulta,
      colaborador: {
        organizationId,
      },
    };

    if (status) {
      where.status = status;
    }

    const [envios, total] = await Promise.all([
      this.prisma.envioBrinde.findMany({
        where,
        include: {
          colaborador: {
            include: {
              endereco: true,
              organizacao: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { dataGatilhoEnvio: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take,
      }),
      this.prisma.envioBrinde.count({ where }),
    ]);

    return {
      envios,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Buscar todos os envios com status "Pronto para Envio"
   */
  async buscarEnviosProntosParaEnvio() {
    return this.prisma.envioBrinde.findMany({
      where: {
        status: 'PRONTO_PARA_ENVIO',
      },
      include: {
        colaborador: {
          include: {
            endereco: true,
            organizacao: true,
          },
        },
      },
      orderBy: {
        dataGatilhoEnvio: 'asc',
      },
    });
  }

  /**
   * Marcar envio como realizado
   */
  async marcarEnvioRealizado(envioBrindeId: string, observacoes?: string) {
    return this.prisma.envioBrinde.update({
      where: { id: envioBrindeId },
      data: {
        status: 'ENVIADO',
        dataEnvioRealizado: new Date(),
        observacoes,
      },
    });
  }

  /**
   * Atualizar status de um envio de brinde
   */
  async atualizarStatusEnvio(
    envioBrindeId: string,
    novoStatus: string,
    organizationId: string,
    observacoes?: string
  ) {
    // Verificar se o envio existe e pertence à organização
    const envio = await this.prisma.envioBrinde.findFirst({
      where: {
        id: envioBrindeId,
        colaborador: {
          organizationId
        }
      },
      include: {
        colaborador: true
      }
    });

    if (!envio) {
      throw new Error('Envio não encontrado');
    }

    // Preparar dados para atualização
    const updateData: any = {
      status: novoStatus,
      observacoes,
    };

    // Se o status for ENVIADO, adicionar data de envio
    if (novoStatus === 'ENVIADO') {
      updateData.dataEnvioRealizado = new Date();
    }

    // Se o status for PRONTO_PARA_ENVIO, adicionar data do gatilho
    if (novoStatus === 'PRONTO_PARA_ENVIO') {
      updateData.dataGatilhoEnvio = new Date();
    }

    return this.prisma.envioBrinde.update({
      where: { id: envioBrindeId },
      data: updateData,
      include: {
        colaborador: {
          include: {
            endereco: true
          }
        }
      }
    });
  }

  /**
   * Buscar estatísticas de envios por organização
   */
  async buscarEstatisticasEnvios(organizationId: string, ano?: number) {
    const anoConsulta = ano || getYear(new Date());

    const stats = await this.prisma.envioBrinde.groupBy({
      by: ['status'],
      where: {
        anoAniversario: anoConsulta,
        colaborador: {
          organizationId,
        },
      },
      _count: {
        status: true,
      },
    });

    const total = await this.prisma.envioBrinde.count({
      where: {
        anoAniversario: anoConsulta,
        colaborador: {
          organizationId,
        },
      },
    });

    return {
      ano: anoConsulta,
      total,
      porStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Simular processamento para criar registros para próximos aniversários
   * (Útil para demonstração e testes)
   */
  async simularProcessamento() {
    console.log('🧪 Simulando processamento de aniversários...');
    await this.verificarAniversariosProximos();
    return { success: true, message: 'Processamento simulado executado' };
  }

  /**
   * Criar registros de envio para um novo ano
   */
  async criarRegistrosParaNovoAno(ano: number) {
    const colaboradores = await this.prisma.colaborador.findMany();

    const registrosCriados = [];

    for (const colaborador of colaboradores) {
      // Verificar se já existe registro para este ano
      const existeEnvio = await this.prisma.envioBrinde.findUnique({
        where: {
          colaboradorId_anoAniversario: {
            colaboradorId: colaborador.id,
            anoAniversario: ano,
          },
        },
      });

      if (!existeEnvio) {
        const novoEnvio = await this.prisma.envioBrinde.create({
          data: {
            colaboradorId: colaborador.id,
            anoAniversario: ano,
            status: 'PENDENTE',
          },
        });
        registrosCriados.push(novoEnvio);
      }
    }

    return {
      ano,
      registrosCriados: registrosCriados.length,
      totalColaboradores: colaboradores.length,
    };
  }
}
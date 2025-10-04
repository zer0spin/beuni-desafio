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
      colaboradorId?: string;
    } = {}
  ) {
    const { status, ano, page = 1, limit = 10, colaboradorId } = options;
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

    if (colaboradorId) {
      where.colaboradorId = colaboradorId;
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
      throw new Error('Shipment not found');
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
   * Buscar relatório completo de envios
   */
  async buscarRelatorios(organizationId: string, ano: number, mes?: number) {
    // Quando NÃO há filtro de mês, usamos as consultas agregadas (mais performáticas)
    if (!mes) {
      // Total de colaboradores (todos da organização)
      const totalColaboradores = await this.prisma.colaborador.count({
        where: { organizationId },
      });

      // Aniversariantes no ano (com envio registrado para o ano)
      const aniversariantesEsteAno = await this.prisma.colaborador.count({
        where: {
          organizationId,
          enviosBrinde: { some: { anoAniversario: ano } },
        },
      });

      // Estatísticas por status (ano + organização)
      const stats = await this.prisma.envioBrinde.groupBy({
        by: ['status'],
        where: {
          anoAniversario: ano,
          colaborador: { organizationId },
        },
        _count: { status: true },
      });

      const enviosPorStatus = stats.reduce(
        (acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        },
        {
          PENDENTE: 0,
          PRONTO_PARA_ENVIO: 0,
          ENVIADO: 0,
          ENTREGUE: 0,
          CANCELADO: 0,
        } as Record<string, number>
      );

      // Série por mês
      const colaboradoresComEnvios = await this.prisma.colaborador.findMany({
        where: { organizationId },
        include: { enviosBrinde: { where: { anoAniversario: ano } } },
      });

      const mesesParaRetornar = Array.from({ length: 12 }, (_, i) => i + 1);
      const enviosPorMes = mesesParaRetornar.map((mesAtual) => {
        const colaboradoresDoMes = colaboradoresComEnvios.filter((colab) => {
          const dataNasc = new Date(colab.dataNascimento);
          return dataNasc.getMonth() + 1 === mesAtual;
        });

        const enviosDoMes = colaboradoresDoMes.flatMap((c) => c.enviosBrinde);

        return {
          mes: mesAtual,
          total: colaboradoresDoMes.length,
          enviados: enviosDoMes.filter((e) => ['ENVIADO', 'ENTREGUE'].includes(e.status)).length,
          pendentes: enviosDoMes.filter((e) => ['PENDENTE', 'PRONTO_PARA_ENVIO'].includes(e.status)).length,
        };
      });

      const mesesNomes = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ];

      const enviosPorMesFormatado = enviosPorMes.map((m) => ({
        mes: m.mes,
        nomeDoMes: mesesNomes[m.mes - 1],
        total: Number(m.total),
        enviados: Number(m.enviados),
        pendentes: Number(m.pendentes),
      }));

      return {
        totalColaboradores,
        aniversariantesEsteAno,
        enviosPorStatus,
        enviosPorMes: enviosPorMesFormatado,
      };
    }

    // Quando HÁ filtro de mês, fazemos filtragem em memória por mês (compatível com múltiplos anos)
    // 1) Buscar colaboradores e filtrar por mês de aniversário
    const colaboradores = await this.prisma.colaborador.findMany({
      where: { organizationId },
      select: { id: true, dataNascimento: true },
    });
    const colaboradoresDoMes = colaboradores.filter((c) => {
      const dn = new Date(c.dataNascimento);
      return dn.getMonth() + 1 === mes;
    });
    const totalColaboradores = colaboradoresDoMes.length;

    // 2) Buscar envios do ano e filtrar pelo mês do aniversariante
    const enviosAno = await this.prisma.envioBrinde.findMany({
      where: {
        anoAniversario: ano,
        colaborador: { organizationId },
      },
      include: { colaborador: { select: { id: true, dataNascimento: true } } },
    });
    const enviosDoMes = enviosAno.filter((e) => {
      const dn = new Date(e.colaborador.dataNascimento);
      return dn.getMonth() + 1 === mes;
    });

    // 3) Aniversariantes do ano (no mês filtrado): colaboradores únicos com envio no ano
    const aniversariantesEsteAno = new Set(enviosDoMes.map((e) => e.colaboradorId)).size;

    // 4) Estatísticas por status
    const enviosPorStatus = enviosDoMes.reduce(
      (acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      },
      {
        PENDENTE: 0,
        PRONTO_PARA_ENVIO: 0,
        ENVIADO: 0,
        ENTREGUE: 0,
        CANCELADO: 0,
      } as Record<string, number>
    );

    // 5) Série por dia do mês
    const diasDoMes = Array.from({ length: 31 }, (_, i) => i + 1);
    const enviosPorMes = diasDoMes
      .map((dia) => {
        const colaboradoresDia = colaboradoresDoMes.filter((c) => new Date(c.dataNascimento).getDate() === dia);
        if (colaboradoresDia.length === 0) return null;

        const idsDia = new Set(colaboradoresDia.map((c) => c.id));
        const enviosDia = enviosDoMes.filter((e) => idsDia.has(e.colaboradorId));

        return {
          mes: dia,
          nomeDoMes: `Dia ${dia}`,
          total: colaboradoresDia.length,
          enviados: enviosDia.filter((e) => ['ENVIADO', 'ENTREGUE'].includes(e.status)).length,
          pendentes: enviosDia.filter((e) => ['PENDENTE', 'PRONTO_PARA_ENVIO'].includes(e.status)).length,
        };
      })
      .filter(Boolean) as Array<{ mes: number; nomeDoMes: string; total: number; enviados: number; pendentes: number }>;

    return {
      totalColaboradores,
      aniversariantesEsteAno,
      enviosPorStatus,
      enviosPorMes,
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
   * Popular banco com dados de teste
   */
  async seedTestData(organizationId: string) {
    const nomes = ['Rafael', 'Fernanda', 'Lucas', 'Juliana', 'Thiago', 'Camila', 'Felipe', 'Amanda', 'Rodrigo', 'Beatriz', 'Bruno', 'Larissa', 'Guilherme', 'Patrícia', 'Marcelo', 'Renata', 'André', 'Carolina', 'Diego', 'Vanessa'];
    const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro'];
    const cargos = ['Desenvolvedor Full Stack', 'Analista de Dados', 'Gerente de Projetos', 'Designer UX/UI', 'Engenheiro de Software', 'Product Owner', 'Scrum Master', 'DevOps Engineer', 'QA Analyst', 'Business Analyst'];
    const departamentos = ['Tecnologia', 'Produto', 'Engenharia', 'Design', 'Qualidade', 'DevOps', 'Dados', 'Inovação'];
    const cidades = [
      { cidade: 'São Paulo', uf: 'SP', cep: '01000000' },
      { cidade: 'Rio de Janeiro', uf: 'RJ', cep: '20000000' },
      { cidade: 'Belo Horizonte', uf: 'MG', cep: '30000000' },
      { cidade: 'Curitiba', uf: 'PR', cep: '80000000' },
    ];

    const randomItem = <T,>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
    const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const generateBirthDate = (mes: number) => {
      const ano = 1985 + Math.floor(Math.random() * 15);
      const dia = 1 + Math.floor(Math.random() * 28);
      return new Date(ano, mes - 1, dia);
    };

    const colaboradoresCriados = [];

    // Criar 30 colaboradores distribuídos em todos os meses
    for (let i = 0; i < 30; i++) {
      const mes = (i % 12) + 1;
      const nome = randomItem(nomes);
      const sobrenome = randomItem(sobrenomes);
      const endereco = randomItem(cidades);

      const colaborador = await this.prisma.colaborador.create({
        data: {
          nomeCompleto: `${nome} ${sobrenome} ${i}`,
          dataNascimento: generateBirthDate(mes),
          cargo: randomItem(cargos),
          departamento: randomItem(departamentos),
          organizacao: {
            connect: { id: organizationId }
          },
          endereco: {
            create: {
              logradouro: `Rua ${randomItem(['das Flores', 'Principal', 'Central'])}`,
              numero: String(100 + Math.floor(Math.random() * 900)),
              bairro: randomItem(['Centro', 'Jardim', 'Vila Nova']),
              cidade: endereco.cidade,
              uf: endereco.uf,
              cep: endereco.cep,
            }
          },
        },
      });

      colaboradoresCriados.push(colaborador);
    }

    // Criar envios para múltiplos anos
    const anos = [2021, 2022, 2023, 2024, 2025];
    let totalEnvios = 0;

    for (const ano of anos) {
      for (const colaborador of colaboradoresCriados) {
        let status: string;
        const random = Math.random();

        if (ano < 2024) {
          if (random < 0.7) status = 'ENTREGUE';
          else if (random < 0.85) status = 'ENVIADO';
          else if (random < 0.95) status = 'CANCELADO';
          else status = 'PRONTO_PARA_ENVIO';
        } else if (ano === 2024) {
          if (random < 0.5) status = 'ENTREGUE';
          else if (random < 0.7) status = 'ENVIADO';
          else if (random < 0.85) status = 'PRONTO_PARA_ENVIO';
          else if (random < 0.95) status = 'PENDENTE';
          else status = 'CANCELADO';
        } else {
          if (random < 0.3) status = 'ENTREGUE';
          else if (random < 0.5) status = 'ENVIADO';
          else if (random < 0.7) status = 'PRONTO_PARA_ENVIO';
          else if (random < 0.9) status = 'PENDENTE';
          else status = 'CANCELADO';
        }

        const dataNasc = new Date(colaborador.dataNascimento);
        const dataGatilho = new Date(ano, dataNasc.getMonth(), dataNasc.getDate() - 30);
        let dataEnvio = null;
        if (['ENVIADO', 'ENTREGUE'].includes(status)) {
          dataEnvio = randomDate(dataGatilho, new Date(ano, dataNasc.getMonth(), dataNasc.getDate()));
        }

        await this.prisma.envioBrinde.upsert({
          where: {
            colaboradorId_anoAniversario: {
              colaboradorId: colaborador.id,
              anoAniversario: ano,
            },
          },
          update: {
            status: status as any,
            dataGatilhoEnvio: dataGatilho,
            dataEnvioRealizado: dataEnvio,
          },
          create: {
            colaboradorId: colaborador.id,
            anoAniversario: ano,
            status: status as any,
            dataGatilhoEnvio: dataGatilho,
            dataEnvioRealizado: dataEnvio,
          },
        });

        totalEnvios++;
      }
    }

    return {
      success: true,
      colaboradoresCriados: colaboradoresCriados.length,
      totalEnvios,
      anos,
      message: 'Dados de teste criados com sucesso!'
    };
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
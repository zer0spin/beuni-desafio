import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import {
  NotificacaoResponseDto,
  TipoNotificacao,
  PrioridadeNotificacao,
  NotificacaoColaboradorData,
  ListarNotificacoesQueryDto,
} from './dto';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listarNotificacoes(
    organizationId: string,
    query: ListarNotificacoesQueryDto,
  ): Promise<NotificacaoResponseDto[]> {
    // Gerar notificações baseadas nos dados atuais do sistema
    const notificacoes: NotificacaoResponseDto[] = [];

    // 1. Notificações de aniversários próximos
    const aniversariosNotificacoes = await this.gerarNotificacoesAniversarios(organizationId);
    notificacoes.push(...aniversariosNotificacoes);

    // 2. Notificações de envios pendentes
    const enviosNotificacoes = await this.gerarNotificacoesEnvios(organizationId);
    notificacoes.push(...enviosNotificacoes);

    // 3. Notificações de sistema (mock por enquanto)
    const sistemaNotificacoes = await this.gerarNotificacoesSistema();
    notificacoes.push(...sistemaNotificacoes);

    // Aplicar filtros
    let notificacoesFiltradas = notificacoes;

    if (query.tipo) {
      notificacoesFiltradas = notificacoesFiltradas.filter(n => n.tipo === query.tipo);
    }

    if (query.filtro === 'nao-lidas') {
      notificacoesFiltradas = notificacoesFiltradas.filter(n => !n.lida);
    }

    if (query.busca) {
      const buscaLower = query.busca.toLowerCase();
      notificacoesFiltradas = notificacoesFiltradas.filter(n =>
        n.titulo.toLowerCase().includes(buscaLower) ||
        n.descricao.toLowerCase().includes(buscaLower) ||
        (n.dadosColaborador?.nome.toLowerCase().includes(buscaLower))
      );
    }

    // Ordenar por data de notificação (mais recentes primeiro)
    notificacoesFiltradas.sort((a, b) => 
      new Date(b.dataNotificacao).getTime() - new Date(a.dataNotificacao).getTime()
    );

    return notificacoesFiltradas;
  }

  private async gerarNotificacoesAniversarios(organizationId: string): Promise<NotificacaoResponseDto[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proximos5Dias = new Date(hoje);
    proximos5Dias.setDate(hoje.getDate() + 5);

    // Buscar colaboradores com aniversários nos próximos 5 dias
    const colaboradores = await this.prisma.colaborador.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        nomeCompleto: true,
        dataNascimento: true,
        departamento: true,
      },
    });

    const notificacoes: NotificacaoResponseDto[] = [];

    colaboradores.forEach((colaborador) => {
      const aniversarioEsteAno = new Date(
        hoje.getFullYear(),
        colaborador.dataNascimento.getMonth(),
        colaborador.dataNascimento.getDate()
      );

      // Se o aniversário já passou este ano, considerar o próximo ano
      if (aniversarioEsteAno < hoje) {
        aniversarioEsteAno.setFullYear(hoje.getFullYear() + 1);
      }

      const diasAteAniversario = Math.ceil(
        (aniversarioEsteAno.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diasAteAniversario >= 0 && diasAteAniversario <= 5) {
        let titulo = '';
        let prioridade: PrioridadeNotificacao = PrioridadeNotificacao.BAIXA;

        if (diasAteAniversario === 0) {
          titulo = '🎉 Aniversário hoje!';
          prioridade = PrioridadeNotificacao.ALTA;
        } else if (diasAteAniversario === 1) {
          titulo = '🎂 Aniversário amanhã';
          prioridade = PrioridadeNotificacao.ALTA;
        } else {
          titulo = `📅 Aniversário em ${diasAteAniversario} dias`;
          prioridade = diasAteAniversario <= 3 ? PrioridadeNotificacao.MEDIA : PrioridadeNotificacao.BAIXA;
        }

        const descricao = `${colaborador.nomeCompleto} faz aniversário ${
          diasAteAniversario === 0 ? 'hoje' : `em ${diasAteAniversario} dia${diasAteAniversario > 1 ? 's' : ''}`
        }. Lembre-se de enviar o brinde!`;

        notificacoes.push({
          id: `aniv-${colaborador.id}`,
          tipo: TipoNotificacao.ANIVERSARIO,
          titulo,
          descricao,
          dataEvento: aniversarioEsteAno.toISOString(),
          dataNotificacao: new Date().toISOString(),
          lida: false, // Por padrão, notificações são não lidas
          prioridade,
          dadosColaborador: {
            id: colaborador.id,
            nome: colaborador.nomeCompleto,
            dataAniversario: colaborador.dataNascimento.toLocaleDateString('pt-BR'),
            departamento: colaborador.departamento,
          },
        });
      }
    });

    return notificacoes;
  }

  private async gerarNotificacoesEnvios(organizationId: string): Promise<NotificacaoResponseDto[]> {
    const notificacoes: NotificacaoResponseDto[] = [];

    // Buscar envios pendentes
    const enviosPendentes = await this.prisma.envioBrinde.count({
      where: {
        colaborador: {
          organizationId,
        },
        status: 'PENDENTE',
      },
    });

    if (enviosPendentes > 0) {
      notificacoes.push({
        id: 'envios-pendentes',
        tipo: TipoNotificacao.ENVIO,
        titulo: '📦 Envios pendentes',
        descricao: `Existem ${enviosPendentes} envio${enviosPendentes > 1 ? 's' : ''} de brinde aguardando processamento.`,
        dataEvento: new Date().toISOString(),
        dataNotificacao: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
        lida: Math.random() > 0.5, // 50% chance de estar lida (simulação)
        prioridade: PrioridadeNotificacao.MEDIA,
      });
    }

    // Buscar envios prontos para envio
    const enviosProntos = await this.prisma.envioBrinde.count({
      where: {
        colaborador: {
          organizationId,
        },
        status: 'PRONTO_PARA_ENVIO',
      },
    });

    if (enviosProntos > 0) {
      notificacoes.push({
        id: 'envios-prontos',
        tipo: TipoNotificacao.ENVIO,
        titulo: '🚀 Envios prontos para processamento',
        descricao: `${enviosProntos} envio${enviosProntos > 1 ? 's' : ''} pronto${enviosProntos > 1 ? 's' : ''} para ser${enviosProntos > 1 ? 'em' : ''} processado${enviosProntos > 1 ? 's' : ''}.`,
        dataEvento: new Date().toISOString(),
        dataNotificacao: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
        lida: false,
        prioridade: PrioridadeNotificacao.ALTA,
      });
    }

    return notificacoes;
  }

  private async gerarNotificacoesSistema(): Promise<NotificacaoResponseDto[]> {
    // Por enquanto, notificações de sistema são mock
    // Em uma implementação real, essas poderiam vir de uma tabela específica
    return [
      {
        id: 'sys-1',
        tipo: TipoNotificacao.SISTEMA,
        titulo: '⚙️ Sistema atualizado',
        descricao: 'O sistema foi atualizado com novas funcionalidades de relatórios e notificações.',
        dataEvento: new Date().toISOString(),
        dataNotificacao: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
        lida: false,
        prioridade: PrioridadeNotificacao.MEDIA,
      },
    ];
  }

  async marcarComoLida(notificationId: string): Promise<{ success: boolean }> {
    // Por enquanto, apenas simular sucesso
    // Em uma implementação real, isso seria salvo em uma tabela de notificações lidas
    return { success: true };
  }

  async marcarTodasComoLidas(organizationId: string): Promise<{ success: boolean }> {
    // Por enquanto, apenas simular sucesso
    // Em uma implementação real, isso seria salvo em uma tabela de notificações lidas
    return { success: true };
  }

  async contarNaoLidas(organizationId: string): Promise<{ count: number }> {
    // Gerar todas as notificações e contar as não lidas
    const todasNotificacoes = await this.listarNotificacoes(organizationId, {});
    const count = todasNotificacoes.filter(n => !n.lida).length;
    
    return { count };
  }
}
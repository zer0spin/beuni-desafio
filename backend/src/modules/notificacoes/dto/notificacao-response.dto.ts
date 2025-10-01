export enum TipoNotificacao {
  ANIVERSARIO = 'aniversario',
  ENVIO = 'envio',
  SISTEMA = 'sistema',
}

export enum PrioridadeNotificacao {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
}

export interface NotificacaoColaboradorData {
  id: string;
  nome: string;
  dataAniversario: string;
  departamento: string;
}

export interface NotificacaoResponseDto {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  dataEvento: string;
  dataNotificacao: string;
  lida: boolean;
  prioridade: PrioridadeNotificacao;
  dadosColaborador?: NotificacaoColaboradorData;
}
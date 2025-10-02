/**
 * Fixtures de dados de teste para notificações
 */

export const mockNotificacaoAniversario = {
  id: 'notif-aniv-123',
  tipo: 'ANIVERSARIO',
  titulo: '🎉 Aniversário hoje!',
  descricao: 'Maria Santos faz aniversário hoje. Lembre-se de enviar o brinde!',
  dataEvento: new Date().toISOString(),
  dataNotificacao: new Date().toISOString(),
  lida: false,
  prioridade: 'ALTA',
  dadosColaborador: {
    id: 'colab-123',
    nome: 'Maria Santos',
    dataAniversario: '15/06/1990',
    departamento: 'Tecnologia',
  },
};

export const mockNotificacaoEnvio = {
  id: 'notif-envio-123',
  tipo: 'ENVIO',
  titulo: '📦 Envios pendentes',
  descricao: 'Existem 5 envios de brinde aguardando processamento.',
  dataEvento: new Date().toISOString(),
  dataNotificacao: new Date(Date.now() - 7200000).toISOString(),
  lida: false,
  prioridade: 'MEDIA',
};

export const mockNotificacaoSistema = {
  id: 'notif-sys-123',
  tipo: 'SISTEMA',
  titulo: '⚙️ Sistema atualizado',
  descricao: 'O sistema foi atualizado com novas funcionalidades de relatórios e notificações.',
  dataEvento: new Date().toISOString(),
  dataNotificacao: new Date(Date.now() - 86400000).toISOString(),
  lida: true,
  prioridade: 'BAIXA',
};

export const mockNotificacoesList = [
  mockNotificacaoAniversario,
  mockNotificacaoEnvio,
  mockNotificacaoSistema,
  {
    ...mockNotificacaoAniversario,
    id: 'notif-aniv-456',
    titulo: '🎂 Aniversário amanhã',
    descricao: 'João Pedro faz aniversário amanhã.',
    prioridade: 'ALTA',
    dadosColaborador: {
      id: 'colab-456',
      nome: 'João Pedro',
      dataAniversario: new Date(Date.now() + 86400000).toLocaleDateString('pt-BR'),
      departamento: 'Marketing',
    },
  },
];

/**
 * Fixtures de dados de teste para envios de brindes
 */

import { mockColaboradorWithEndereco, mockOrganizacao } from './index';

export const mockEnvioBrinde = {
  id: 'envio-123',
  colaboradorId: 'colab-123',
  anoAniversario: new Date().getFullYear(),
  status: 'PENDENTE',
  dataGatilhoEnvio: null,
  dataEnvioRealizado: null,
  observacoes: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockEnvioBrindeProntoParaEnvio = {
  ...mockEnvioBrinde,
  id: 'envio-456',
  status: 'PRONTO_PARA_ENVIO',
  dataGatilhoEnvio: new Date(),
};

export const mockEnvioBrindeEnviado = {
  ...mockEnvioBrinde,
  id: 'envio-789',
  status: 'ENVIADO',
  dataGatilhoEnvio: new Date(Date.now() - 86400000),
  dataEnvioRealizado: new Date(),
  observacoes: 'Enviado via Correios',
};

export const mockEnvioBrindeWithColaborador = {
  ...mockEnvioBrinde,
  colaborador: {
    ...mockColaboradorWithEndereco,
    organizacao: mockOrganizacao,
  },
};

export const mockEnviosList = [
  mockEnvioBrindeWithColaborador,
  {
    ...mockEnvioBrindeWithColaborador,
    id: 'envio-456',
    status: 'PRONTO_PARA_ENVIO',
    dataGatilhoEnvio: new Date(),
  },
  {
    ...mockEnvioBrindeWithColaborador,
    id: 'envio-789',
    status: 'ENVIADO',
    dataEnvioRealizado: new Date(),
  },
];

export const mockEstatisticasEnvios = {
  ano: new Date().getFullYear(),
  total: 100,
  porStatus: {
    PENDENTE: 30,
    PRONTO_PARA_ENVIO: 20,
    ENVIADO: 40,
    ENTREGUE: 10,
    CANCELADO: 0,
  },
};

export const mockRelatorioEnvios = {
  totalColaboradores: 100,
  aniversariantesEsteAno: 100,
  enviosPorStatus: {
    PENDENTE: 30,
    PRONTO_PARA_ENVIO: 20,
    ENVIADO: 40,
    ENTREGUE: 10,
    CANCELADO: 0,
  },
  enviosPorMes: [
    { mes: 1, nomeDoMes: 'Janeiro', total: 10, enviados: 8, pendentes: 2 },
    { mes: 2, nomeDoMes: 'Fevereiro', total: 8, enviados: 6, pendentes: 2 },
    { mes: 3, nomeDoMes: 'Março', total: 9, enviados: 7, pendentes: 2 },
    { mes: 4, nomeDoMes: 'Abril', total: 7, enviados: 5, pendentes: 2 },
    { mes: 5, nomeDoMes: 'Maio', total: 8, enviados: 6, pendentes: 2 },
    { mes: 6, nomeDoMes: 'Junho', total: 10, enviados: 8, pendentes: 2 },
    { mes: 7, nomeDoMes: 'Julho', total: 9, enviados: 7, pendentes: 2 },
    { mes: 8, nomeDoMes: 'Agosto', total: 8, enviados: 6, pendentes: 2 },
    { mes: 9, nomeDoMes: 'Setembro', total: 7, enviados: 5, pendentes: 2 },
    { mes: 10, nomeDoMes: 'Outubro', total: 9, enviados: 7, pendentes: 2 },
    { mes: 11, nomeDoMes: 'Novembro', total: 8, enviados: 6, pendentes: 2 },
    { mes: 12, nomeDoMes: 'Dezembro', total: 7, enviados: 5, pendentes: 2 },
  ],
};

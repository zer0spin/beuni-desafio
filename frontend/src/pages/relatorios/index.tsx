import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BarChart3, Users, Calendar, Package, TrendingUp, Download, Filter, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api, { getUser } from '../../lib/api';

interface EstatisticasRelatorio {
  totalColaboradores: number;
  aniversariantesEsteAno: number;
  enviosPorStatus: {
    PENDENTE: number;
    PRONTO_PARA_ENVIO: number;
    ENVIADO: number;
    ENTREGUE: number;
    CANCELADO: number;
  };
  enviosPorMes: Array<{
    mes: number;
    nomeDoMes: string;
    total: number;
    enviados: number;
    pendentes: number;
  }>;
  departamentos: Array<{
    nome: string;
    totalColaboradores: number;
    enviosPendentes: number;
    enviosRealizados: number;
  }>;
  proximosAniversarios: Array<{
    id: string;
    nome_completo: string;
    data_nascimento: string;
    cargo: string;
    departamento: string;
    diasParaAniversario: number;
  }>;
}

export default function RelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EstatisticasRelatorio | null>(null);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    loadRelatorios();
  }, [anoSelecionado]);

  const loadRelatorios = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas gerais
      const [colaboradoresRes, estatisticasRes, proximosRes] = await Promise.all([
        api.get('/colaboradores?limit=1'),
        api.get('/envio-brindes/estatisticas'),
        api.get('/colaboradores/aniversariantes-proximos'),
      ]);

      // Simular dados mais completos para o relatório
      const mockStats: EstatisticasRelatorio = {
        totalColaboradores: colaboradoresRes.data.total || 0,
        aniversariantesEsteAno: colaboradoresRes.data.total || 0,
        enviosPorStatus: {
          PENDENTE: estatisticasRes.data?.porStatus?.PENDENTE || 0,
          PRONTO_PARA_ENVIO: estatisticasRes.data?.porStatus?.PRONTO_PARA_ENVIO || 0,
          ENVIADO: estatisticasRes.data?.porStatus?.ENVIADO || 0,
          ENTREGUE: estatisticasRes.data?.porStatus?.ENTREGUE || 0,
          CANCELADO: estatisticasRes.data?.porStatus?.CANCELADO || 0,
        },
        enviosPorMes: [
          { mes: 1, nomeDoMes: 'Janeiro', total: 12, enviados: 10, pendentes: 2 },
          { mes: 2, nomeDoMes: 'Fevereiro', total: 8, enviados: 8, pendentes: 0 },
          { mes: 3, nomeDoMes: 'Março', total: 15, enviados: 12, pendentes: 3 },
          { mes: 4, nomeDoMes: 'Abril', total: 9, enviados: 9, pendentes: 0 },
          { mes: 5, nomeDoMes: 'Maio', total: 11, enviados: 8, pendentes: 3 },
          { mes: 6, nomeDoMes: 'Junho', total: 13, enviados: 13, pendentes: 0 },
          { mes: 7, nomeDoMes: 'Julho', total: 7, enviados: 5, pendentes: 2 },
          { mes: 8, nomeDoMes: 'Agosto', total: 14, enviados: 11, pendentes: 3 },
          { mes: 9, nomeDoMes: 'Setembro', total: 10, enviados: 10, pendentes: 0 },
          { mes: 10, nomeDoMes: 'Outubro', total: 16, enviados: 14, pendentes: 2 },
          { mes: 11, nomeDoMes: 'Novembro', total: 12, enviados: 9, pendentes: 3 },
          { mes: 12, nomeDoMes: 'Dezembro', total: 18, enviados: 15, pendentes: 3 },
        ],
        departamentos: [
          { nome: 'TI', totalColaboradores: 25, enviosPendentes: 3, enviosRealizados: 22 },
          { nome: 'RH', totalColaboradores: 8, enviosPendentes: 1, enviosRealizados: 7 },
          { nome: 'Financeiro', totalColaboradores: 12, enviosPendentes: 2, enviosRealizados: 10 },
          { nome: 'Marketing', totalColaboradores: 15, enviosPendentes: 1, enviosRealizados: 14 },
          { nome: 'Vendas', totalColaboradores: 30, enviosPendentes: 4, enviosRealizados: 26 },
        ],
        proximosAniversarios: proximosRes.data || [],
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = () => {
    if (!stats) return;

    const dadosCSV = [
      ['Relatório de Colaboradores e Envios', ''],
      ['Ano', anoSelecionado.toString()],
      ['Data de Geração', new Date().toLocaleDateString('pt-BR')],
      [''],
      ['RESUMO GERAL', ''],
      ['Total de Colaboradores', stats.totalColaboradores.toString()],
      ['Aniversariantes Este Ano', stats.aniversariantesEsteAno.toString()],
      [''],
      ['ENVIOS POR STATUS', ''],
      ['Pendente', stats.enviosPorStatus.PENDENTE.toString()],
      ['Pronto para Envio', stats.enviosPorStatus.PRONTO_PARA_ENVIO.toString()],
      ['Enviado', stats.enviosPorStatus.ENVIADO.toString()],
      ['Entregue', stats.enviosPorStatus.ENTREGUE.toString()],
      ['Cancelado', stats.enviosPorStatus.CANCELADO.toString()],
      [''],
      ['DEPARTAMENTOS', 'Total', 'Pendentes', 'Realizados'],
      ...stats.departamentos.map(dep => [dep.nome, dep.totalColaboradores.toString(), dep.enviosPendentes.toString(), dep.enviosRealizados.toString()]),
    ];

    const csvContent = dadosCSV.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_beuni_${anoSelecionado}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast.success('Relatório exportado com sucesso!');
  };

  const getStatusBadge = (status: string, count: number) => {
    const statusConfig = {
      PENDENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      PRONTO_PARA_ENVIO: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pronto' },
      ENVIADO: { bg: 'bg-green-100', text: 'text-green-800', label: 'Enviado' },
      ENTREGUE: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Entregue' },
      CANCELADO: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDENTE;

    return (
      <div className={`flex items-center justify-between p-3 ${config.bg} rounded-lg`}>
        <span className={`font-medium ${config.text}`}>{config.label}</span>
        <span className={`text-lg font-bold ${config.text}`}>{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
                  <p className="text-sm text-gray-600">Analise dados e estatísticas dos colaboradores e envios</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={anoSelecionado}
                  onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {[2024, 2023, 2022].map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={exportarRelatorio}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Colaboradores</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats?.totalColaboradores || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Aniversariantes {anoSelecionado}</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats?.aniversariantesEsteAno || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Envios Realizados</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {(stats?.enviosPorStatus.ENVIADO || 0) + (stats?.enviosPorStatus.ENTREGUE || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Taxa de Sucesso</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats ? Math.round((((stats.enviosPorStatus.ENVIADO + stats.enviosPorStatus.ENTREGUE) /
                    (Object.values(stats.enviosPorStatus).reduce((a, b) => a + b, 0) || 1)) * 100)) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Status dos Envios</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats && Object.entries(stats.enviosPorStatus).map(([status, count]) => (
              <div key={status}>
                {getStatusBadge(status, count)}
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Envios por Mês */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Envios por Mês ({anoSelecionado})</h2>
            <div className="space-y-4">
              {stats?.enviosPorMes.map((mes) => (
                <div key={mes.mes} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{mes.nomeDoMes}</span>
                      <span className="text-sm text-gray-500">{mes.enviados}/{mes.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full"
                        style={{ width: `${mes.total > 0 ? (mes.enviados / mes.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departamentos */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Por Departamento</h2>
            <div className="space-y-4">
              {stats?.departamentos.map((dept) => (
                <div key={dept.nome} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">{dept.nome}</h3>
                    <span className="text-sm text-gray-500">{dept.totalColaboradores} colaboradores</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Realizados:</span>
                      <span className="font-medium text-green-600">{dept.enviosRealizados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pendentes:</span>
                      <span className="font-medium text-yellow-600">{dept.enviosPendentes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Próximos Aniversários */}
        {stats?.proximosAniversarios && stats.proximosAniversarios.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Próximos Aniversários</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.proximosAniversarios.slice(0, 6).map((colaborador) => (
                <div key={colaborador.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{colaborador.nome_completo}</h3>
                  <p className="text-sm text-gray-600">{colaborador.cargo} - {colaborador.departamento}</p>
                  <p className="text-sm text-orange-600 font-medium mt-2">
                    Aniversário: {colaborador.data_nascimento}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
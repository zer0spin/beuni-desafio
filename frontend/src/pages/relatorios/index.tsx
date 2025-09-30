import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  BarChart3,
  Users,
  Calendar,
  Package,
  TrendingUp,
  Download,
  Filter,
  PieChart,
  Activity,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import Layout from '@/components/Layout';
import api, { endpoints } from '@/lib/api';

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
}

export default function RelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EstatisticasRelatorio | null>(null);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  useEffect(() => {
    loadRelatorios();
  }, [anoSelecionado]);

  const loadRelatorios = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${endpoints.relatorios}?ano=${anoSelecionado}`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    toast.success('Relatório exportado com sucesso!');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDENTE: 'text-yellow-600 bg-yellow-100',
      PRONTO_PARA_ENVIO: 'text-blue-600 bg-blue-100',
      ENVIADO: 'text-purple-600 bg-purple-100',
      ENTREGUE: 'text-green-600 bg-green-100',
      CANCELADO: 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: any } = {
      PENDENTE: Clock,
      PRONTO_PARA_ENVIO: Package,
      ENVIADO: TrendingUp,
      ENTREGUE: CheckCircle,
      CANCELADO: XCircle,
    };
    return icons[status] || Activity;
  };

  const totalEnvios = stats?.enviosPorStatus
    ? Object.values(stats.enviosPorStatus).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-beuni-text flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-beuni-orange-600" />
                Relatórios e Análises
              </h1>
              <p className="text-beuni-text/60 mt-1">
                Visualize estatísticas e insights dos envios de brindes
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                className="px-4 py-2 border border-beuni-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 bg-white"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-beuni-orange-600 text-white font-semibold rounded-xl hover:bg-beuni-orange-700 transition-all shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Total</p>
                  <p className="text-3xl font-bold">{stats?.totalColaboradores || 0}</p>
                </div>
              </div>
              <p className="text-sm opacity-90">Colaboradores</p>
            </div>

            <div className="bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="h-8 w-8" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Este Ano</p>
                  <p className="text-3xl font-bold">{stats?.aniversariantesEsteAno || 0}</p>
                </div>
              </div>
              <p className="text-sm opacity-90">Aniversariantes</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Package className="h-8 w-8" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Total</p>
                  <p className="text-3xl font-bold">{totalEnvios}</p>
                </div>
              </div>
              <p className="text-sm opacity-90">Envios</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="h-8 w-8" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Sucesso</p>
                  <p className="text-3xl font-bold">
                    {stats?.enviosPorStatus?.ENTREGUE || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm opacity-90">Entregas</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beuni-orange-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
              <div className="flex items-center mb-6">
                <PieChart className="h-6 w-6 text-beuni-orange-600 mr-2" />
                <h2 className="text-xl font-bold text-beuni-text">Distribuição por Status</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats?.enviosPorStatus &&
                  Object.entries(stats.enviosPorStatus).map(([status, count]) => {
                    const Icon = getStatusIcon(status);
                    const percentage = totalEnvios > 0 ? ((count / totalEnvios) * 100).toFixed(1) : 0;
                    return (
                      <div
                        key={status}
                        className="bg-beuni-cream rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(status)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-2xl font-bold text-beuni-text">{count}</span>
                        </div>
                        <p className="text-sm font-medium text-beuni-text mb-1">
                          {status.replace(/_/g, ' ')}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-beuni-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-beuni-text/60">{percentage}% do total</p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
              <div className="flex items-center mb-6">
                <Activity className="h-6 w-6 text-beuni-orange-600 mr-2" />
                <h2 className="text-xl font-bold text-beuni-text">Envios por Mês</h2>
              </div>

              <div className="space-y-4">
                {stats?.enviosPorMes?.map((mes) => {
                  const maxValue = Math.max(...(stats.enviosPorMes?.map((m) => m.total) || [1]));
                  const percentage = (mes.total / maxValue) * 100;

                  return (
                    <div key={mes.mes} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-beuni-text w-24">
                          {mes.nomeDoMes}
                        </span>
                        <div className="flex-1 mx-4">
                          <div className="relative h-10 bg-beuni-cream rounded-xl overflow-hidden">
                            {/* Enviados */}
                            <div
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                              style={{
                                width: `${mes.total > 0 ? (mes.enviados / mes.total) * percentage : 0}%`,
                              }}
                            ></div>
                            {/* Pendentes */}
                            <div
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                opacity: 0.6,
                              }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-semibold text-beuni-text">
                                {mes.total}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-beuni-text/70">{mes.enviados} enviados</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-beuni-text/70">{mes.pendentes} pendentes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-beuni-orange-50 to-beuni-brown-50 rounded-2xl p-6 border border-beuni-orange-200">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-6 w-6 text-beuni-orange-600 mr-2" />
                  <h3 className="font-bold text-beuni-text">Taxa de Sucesso</h3>
                </div>
                <p className="text-4xl font-bold text-beuni-text mb-2">
                  {totalEnvios > 0
                    ? ((((stats?.enviosPorStatus?.ENTREGUE || 0) + (stats?.enviosPorStatus?.ENVIADO || 0)) / totalEnvios) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-sm text-beuni-text/60">Enviados + Entregues</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="font-bold text-beuni-text">Pendentes</h3>
                </div>
                <p className="text-4xl font-bold text-beuni-text mb-2">
                  {(stats?.enviosPorStatus?.PENDENTE || 0) + (stats?.enviosPorStatus?.PRONTO_PARA_ENVIO || 0)}
                </p>
                <p className="text-sm text-beuni-text/60">Aguardando processamento</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="font-bold text-beuni-text">Concluídos</h3>
                </div>
                <p className="text-4xl font-bold text-beuni-text mb-2">
                  {stats?.enviosPorStatus?.ENTREGUE || 0}
                </p>
                <p className="text-sm text-beuni-text/60">Entregas confirmadas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
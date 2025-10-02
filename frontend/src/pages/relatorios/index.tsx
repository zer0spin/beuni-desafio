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
  XCircle,
  Target,
  Zap,
  AlertTriangle,
  Award,
  MousePointer,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';

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

// Cores para os gráficos
const COLORS = {
  primary: '#ea580c',
  secondary: '#f97316', 
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  gray: '#6b7280'
};

const STATUS_COLORS = {
  PENDENTE: COLORS.warning,
  PRONTO_PARA_ENVIO: COLORS.info,
  ENVIADO: COLORS.purple,
  ENTREGUE: COLORS.success,
  CANCELADO: COLORS.danger,
};

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

  const exportToCSV = async () => {
    try {
      toast.loading('Preparando relatório...');

      // Buscar dados dos envios para exportação
      const response = await api.get(`/envio-brindes?ano=${anoSelecionado}&limit=1000`);
      const envios = response.data.envios || [];

      if (envios.length === 0) {
        toast.dismiss();
        toast.error('Nenhum dado para exportar');
        return;
      }

      // Preparar dados para CSV
      const csvRows = [];

      // Cabeçalho
      csvRows.push([
        'ID',
        'Colaborador',
        'Cargo',
        'Departamento',
        'Data Nascimento',
        'Cidade',
        'UF',
        'Status',
        'Ano Aniversário',
        'Data Gatilho',
        'Data Envio',
        'Observações'
      ].join(','));

      // Dados
      envios.forEach((envio: any) => {
        csvRows.push([
          envio.id,
          `"${envio.colaborador.nomeCompleto}"`,
          `"${envio.colaborador.cargo || ''}"`,
          `"${envio.colaborador.departamento || ''}"`,
          envio.colaborador.dataNascimento,
          `"${envio.colaborador.endereco.cidade}"`,
          envio.colaborador.endereco.uf,
          envio.status,
          envio.anoAniversario,
          envio.dataGatilhoEnvio || '',
          envio.dataEnvioRealizado || '',
          `"${envio.observacoes || ''}"`
        ].join(','));
      });

      // Criar blob e download
      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_envios_${anoSelecionado}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.dismiss();
      toast.error('Erro ao exportar relatório');
    }
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

  // Dados para gráficos
  const pieData = stats?.enviosPorStatus ? Object.entries(stats.enviosPorStatus).map(([status, value]) => ({
    name: status.replace(/_/g, ' '),
    value,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
  })) : [];

  const monthlyData = stats?.enviosPorMes?.map(mes => ({
    month: mes.nomeDoMes.substring(0, 3),
    total: mes.total,
    enviados: mes.enviados,
    pendentes: mes.pendentes,
    taxaEnvio: mes.total > 0 ? ((mes.enviados / mes.total) * 100).toFixed(1) : 0
  })) || [];

  // Cálculos de insights
  const taxaSucesso = totalEnvios > 0 
    ? ((((stats?.enviosPorStatus?.ENTREGUE || 0) + (stats?.enviosPorStatus?.ENVIADO || 0)) / totalEnvios) * 100) 
    : 0;

  const produtividadeAnual = stats?.aniversariantesEsteAno || 0;
  const pendentesTotal = (stats?.enviosPorStatus?.PENDENTE || 0) + (stats?.enviosPorStatus?.PRONTO_PARA_ENVIO || 0);
  const melhorMes = monthlyData.reduce((prev, current) => prev.total > current.total ? prev : current, { total: 0, month: 'N/A' });
  
  // Dados para gráfico radial
  const radialData = [
    { name: 'Taxa de Sucesso', value: taxaSucesso, fill: COLORS.success },
    { name: 'Taxa de Pendentes', value: totalEnvios > 0 ? (pendentesTotal / totalEnvios) * 100 : 0, fill: COLORS.warning },
    { name: 'Taxa de Cancelados', value: totalEnvios > 0 ? ((stats?.enviosPorStatus?.CANCELADO || 0) / totalEnvios) * 100 : 0, fill: COLORS.danger }
  ];

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Compacto */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-beuni-text flex items-center">
              <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 mr-2 text-beuni-orange-600" />
              Analytics Dashboard
            </h1>
            <p className="text-sm text-beuni-text/60 mt-1">
              Insights e métricas de performance dos envios
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-beuni-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 bg-white"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-2 bg-beuni-orange-600 text-white text-sm font-medium rounded-lg hover:bg-beuni-orange-700 transition-all shadow-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beuni-orange-500"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Colaboradores */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <Users className="h-6 w-6 opacity-80" />
                  <div className="text-right">
                    <p className="text-lg lg:text-2xl font-bold">{stats?.totalColaboradores || 0}</p>
                    <p className="text-xs opacity-90">Colaboradores</p>
                  </div>
                </div>
              </div>

              {/* Aniversariantes */}
              <div className="bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <Calendar className="h-6 w-6 opacity-80" />
                  <div className="text-right">
                    <p className="text-lg lg:text-2xl font-bold">{produtividadeAnual}</p>
                    <p className="text-xs opacity-90">Aniversários {anoSelecionado}</p>
                  </div>
                </div>
              </div>

              {/* Total Envios */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <Package className="h-6 w-6 opacity-80" />
                  <div className="text-right">
                    <p className="text-lg lg:text-2xl font-bold">{totalEnvios}</p>
                    <p className="text-xs opacity-90">Total Envios</p>
                  </div>
                </div>
              </div>

              {/* Taxa de Sucesso */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <Target className="h-6 w-6 opacity-80" />
                  <div className="text-right">
                    <p className="text-lg lg:text-2xl font-bold">{taxaSucesso.toFixed(1)}%</p>
                    <p className="text-xs opacity-90">Taxa Sucesso</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Mensal */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-beuni-text flex items-center">
                    <Activity className="h-5 w-5 text-beuni-orange-600 mr-2" />
                    Performance Mensal
                  </h3>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-beuni-orange-500 rounded-full mr-2"></div>
                      <span>Total</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Enviados</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="enviados"
                      stackId="2"
                      stroke={COLORS.success}
                      fill={COLORS.success}
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-beuni-text flex items-center mb-6">
                  <PieChart className="h-5 w-5 text-beuni-orange-600 mr-2" />
                  Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Melhor Mês */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-3">
                  <Award className="h-6 w-6 text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    DESTAQUE
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{melhorMes.month}</p>
                <p className="text-sm text-gray-600">Melhor mês ({melhorMes.total} envios)</p>
              </div>

              {/* Pendências */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    ATENÇÃO
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{pendentesTotal}</p>
                <p className="text-sm text-gray-600">Envios pendentes</p>
              </div>

              {/* Eficiência */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <Zap className="h-6 w-6 text-green-600" />
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    PERFORMANCE
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.enviosPorStatus?.ENTREGUE || 0}
                </p>
                <p className="text-sm text-gray-600">Entregas confirmadas</p>
              </div>

              {/* Alertas */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    ALERTA
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.enviosPorStatus?.CANCELADO || 0}
                </p>
                <p className="text-sm text-gray-600">Envios cancelados</p>
              </div>
            </div>

            {/* Detailed Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-beuni-text flex items-center mb-6">
                <MousePointer className="h-5 w-5 text-beuni-orange-600 mr-2" />
                Métricas Detalhadas de Performance
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Taxa de Conversão */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Taxa de Entrega</span>
                    <span className="text-sm font-bold text-green-600">
                      {totalEnvios > 0 ? (((stats?.enviosPorStatus?.ENTREGUE || 0) / totalEnvios) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${totalEnvios > 0 ? (((stats?.enviosPorStatus?.ENTREGUE || 0) / totalEnvios) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Taxa de Cancelamento */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Taxa de Cancelamento</span>
                    <span className="text-sm font-bold text-red-600">
                      {totalEnvios > 0 ? (((stats?.enviosPorStatus?.CANCELADO || 0) / totalEnvios) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${totalEnvios > 0 ? (((stats?.enviosPorStatus?.CANCELADO || 0) / totalEnvios) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Taxa de Processamento */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Em Processamento</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {totalEnvios > 0 ? ((pendentesTotal / totalEnvios) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${totalEnvios > 0 ? ((pendentesTotal / totalEnvios) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
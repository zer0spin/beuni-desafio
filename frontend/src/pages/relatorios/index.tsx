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
  Eye,
  Info,
  ChevronDown
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

const STATUS_LABELS = {
  PENDENTE: 'Pendente',
  PRONTO_PARA_ENVIO: 'Pronto p/ Envio',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

// Definições de métricas com explicações
const METRIC_EXPLANATIONS = {
  totalColaboradores: {
    title: 'Total de Colaboradores',
    description: 'Número total de colaboradores ativos cadastrados no sistema.',
    calculation: 'Contagem direta de registros ativos na base de dados.'
  },
  aniversariantes: {
    title: 'Aniversariantes do Ano',
    description: 'Colaboradores que fazem aniversário no ano selecionado.',
    calculation: 'Filtro por ano de nascimento dos colaboradores.'
  },
  totalEnvios: {
    title: 'Total de Envios',
    description: 'Soma de todos os envios de brindes realizados no período.',
    calculation: 'Soma de: Pendentes + Prontos + Enviados + Entregues + Cancelados'
  },
  taxaSucesso: {
    title: 'Taxa de Sucesso',
    description: 'Percentual de envios bem-sucedidos (enviados + entregues).',
    calculation: '((Enviados + Entregues) / Total de Envios) × 100'
  },
  taxaEntrega: {
    title: 'Taxa de Entrega',
    description: 'Percentual de envios que foram efetivamente entregues.',
    calculation: '(Entregues / Total de Envios) × 100'
  },
  taxaCancelamento: {
    title: 'Taxa de Cancelamento',
    description: 'Percentual de envios que foram cancelados.',
    calculation: '(Cancelados / Total de Envios) × 100'
  },
  emProcessamento: {
    title: 'Em Processamento',
    description: 'Envios que ainda estão em fase de processamento.',
    calculation: 'Pendentes + Prontos para Envio'
  }
};

const MESES = [
  { value: 0, label: 'Todos os meses' },
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

export default function RelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EstatisticasRelatorio | null>(null);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(0); // 0 = todos os meses
  const [showFilters, setShowFilters] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    loadRelatorios();
  }, [anoSelecionado, mesSelecionado]);

  const loadRelatorios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ ano: anoSelecionado.toString() });
      if (mesSelecionado > 0) {
        params.append('mes', mesSelecionado.toString());
      }
      
      const response = await api.get(`${endpoints.relatorios}?${params}`);
      
      setStats(response.data);
    } catch (error) {
      // Error is handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      toast.loading('Preparando relatório...');

      const params = new URLSearchParams({ ano: anoSelecionado.toString(), limit: '1000' });
      if (mesSelecionado > 0) {
        params.append('mes', mesSelecionado.toString());
      }

      const response = await api.get(`/envio-brindes?${params}`);
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

      const mesLabel = mesSelecionado > 0 ? `_${MESES[mesSelecionado].label}` : '';
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_envios_${anoSelecionado}${mesLabel}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
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

  // Dados para gráfico de pizza com legenda
  const pieData = stats?.enviosPorStatus ? Object.entries(stats.enviosPorStatus).map(([status, value]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
    value,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
    percentage: totalEnvios > 0 ? ((value / totalEnvios) * 100).toFixed(1) : 0
  })) : [];

  // Filtrar dados mensais se um mês específico foi selecionado
  const monthlyData = stats?.enviosPorMes?.map(mes => ({
    month: mesSelecionado > 0 ? mes.nomeDoMes : mes.nomeDoMes.substring(0, 3),
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

  // Tooltip Component com posicionamento inteligente
  const MetricTooltip = ({ metricKey }: { metricKey: string }) => {
    const metric = METRIC_EXPLANATIONS[metricKey as keyof typeof METRIC_EXPLANATIONS];
    if (!metric) return null;

    return (
      <div className="fixed z-50 w-80 bg-white border-2 border-beuni-orange-200 rounded-xl shadow-2xl p-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[90vw]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Info className="h-5 w-5 text-beuni-orange-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-beuni-text mb-2">{metric.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
            <div className="bg-beuni-orange-50 rounded-lg p-3 border border-beuni-orange-100">
              <p className="text-xs font-mono text-beuni-orange-900 font-semibold">
                Cálculo:
              </p>
              <p className="text-xs font-mono text-beuni-orange-700 mt-1">
                {metric.calculation}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Gerar últimos 5 anos incluindo o ano atual (nunca anos futuros)
  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = Array.from(
    { length: 5 },
    (_, i) => anoAtual - i
  ).reverse();

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold flex items-center mb-2">
                <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 mr-3" />
                Analytics Dashboard
              </h1>
              <p className="text-beuni-orange-100 text-sm lg:text-base">
                Insights e métricas avançadas de performance dos envios de brindes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/30 transition-all shadow-lg border border-white/30"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2.5 bg-white text-beuni-orange-600 font-medium rounded-xl hover:bg-beuni-orange-50 transition-all shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Filtros Modernos */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filtro de Ano */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/90 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ano
                  </label>
                  <select
                    value={anoSelecionado}
                    onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/95 text-beuni-text border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent font-medium shadow-lg"
                  >
                    {anosDisponiveis.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro de Mês */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/90 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Mês
                  </label>
                  <select
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/95 text-beuni-text border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent font-medium shadow-lg"
                  >
                    {MESES.map((mes) => (
                      <option key={mes.value} value={mes.value}>{mes.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
                <Info className="h-4 w-4" />
                <span>
                  Exibindo dados de: <strong className="text-white">
                    {mesSelecionado > 0 ? MESES[mesSelecionado].label : 'Todos os meses'} de {anoSelecionado}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-beuni-orange-500"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid com Tooltips */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Colaboradores */}
              <div
                className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 lg:p-5 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onMouseEnter={() => setActiveTooltip('totalColaboradores')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <div className="flex items-center justify-between">
                  <Users className="h-6 w-6 lg:h-7 lg:w-7 opacity-80 group-hover:scale-110 transition-transform" />
                  <Eye className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl lg:text-3xl font-bold">{stats?.totalColaboradores || 0}</p>
                  <p className="text-xs lg:text-sm opacity-90 mt-1">Colaboradores</p>
                </div>
                {activeTooltip === 'totalColaboradores' && <MetricTooltip metricKey="totalColaboradores" />}
              </div>

              {/* Aniversariantes */}
              <div
                className="relative bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 rounded-xl p-4 lg:p-5 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onMouseEnter={() => setActiveTooltip('aniversariantes')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <div className="flex items-center justify-between">
                  <Calendar className="h-6 w-6 lg:h-7 lg:w-7 opacity-80 group-hover:scale-110 transition-transform" />
                  <Eye className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl lg:text-3xl font-bold">{produtividadeAnual}</p>
                  <p className="text-xs lg:text-sm opacity-90 mt-1">Aniversários {anoSelecionado}</p>
                </div>
                {activeTooltip === 'aniversariantes' && <MetricTooltip metricKey="aniversariantes" />}
              </div>

              {/* Total Envios */}
              <div
                className="relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 lg:p-5 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onMouseEnter={() => setActiveTooltip('totalEnvios')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <div className="flex items-center justify-between">
                  <Package className="h-6 w-6 lg:h-7 lg:w-7 opacity-80 group-hover:scale-110 transition-transform" />
                  <Eye className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl lg:text-3xl font-bold">{totalEnvios}</p>
                  <p className="text-xs lg:text-sm opacity-90 mt-1">Total Envios</p>
                </div>
                {activeTooltip === 'totalEnvios' && <MetricTooltip metricKey="totalEnvios" />}
              </div>

              {/* Taxa de Sucesso */}
              <div
                className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 lg:p-5 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onMouseEnter={() => setActiveTooltip('taxaSucesso')}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <div className="flex items-center justify-between">
                  <Target className="h-6 w-6 lg:h-7 lg:w-7 opacity-80 group-hover:scale-110 transition-transform" />
                  <Eye className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl lg:text-3xl font-bold">{taxaSucesso.toFixed(1)}%</p>
                  <p className="text-xs lg:text-sm opacity-90 mt-1">Taxa Sucesso</p>
                </div>
                {activeTooltip === 'taxaSucesso' && <MetricTooltip metricKey="taxaSucesso" />}
              </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Mensal */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-beuni-text flex items-center">
                    <Activity className="h-5 w-5 text-beuni-orange-600 mr-2" />
                    {mesSelecionado > 0 
                      ? `Performance de ${MESES.find(m => m.value === mesSelecionado)?.label} ${anoSelecionado}`
                      : `Performance Mensal ${anoSelecionado}`
                    }
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
                {monthlyData.length === 0 || monthlyData.every(m => m.total === 0) ? (
                  <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
                    <Activity className="h-16 w-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Sem dados neste período</p>
                    <p className="text-sm mt-2">Selecione outro período para visualizar dados</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        angle={mesSelecionado > 0 ? -45 : 0}
                        textAnchor={mesSelecionado > 0 ? 'end' : 'middle'}
                        height={mesSelecionado > 0 ? 60 : 30}
                        interval={mesSelecionado > 0 ? 0 : 'preserveStartEnd'}
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
                        formatter={(value: any, name: string) => [
                          value,
                          name === 'total' ? 'Aniversariantes' : 
                          name === 'enviados' ? 'Enviados' : name
                        ]}
                        labelFormatter={(label: string) => 
                          mesSelecionado > 0 ? label : `Mês: ${label}`
                        }
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
                )}
              </div>

              {/* Distribuição de Status com Legenda */}
              <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
                <h3 className="text-xl font-bold text-beuni-text mb-6 flex items-center">
                  Distribuição de Status
                </h3>
                {totalEnvios === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                    <PieChart className="h-16 w-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Sem dados neste período</p>
                    <p className="text-sm mt-2 text-center">Nenhum envio encontrado</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
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

                    {/* Legenda Customizada */}
                    <div className="mt-4 space-y-2">
                      {pieData.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                            <span className="text-xs text-gray-500">({entry.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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

            {/* Detailed Performance Metrics com Tooltips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-beuni-text flex items-center mb-6">
                <MousePointer className="h-5 w-5 text-beuni-orange-600 mr-2" />
                Métricas Detalhadas de Performance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Taxa de Entrega */}
                <div
                  className="relative space-y-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-md transition-all cursor-pointer group"
                  onMouseEnter={() => setActiveTooltip('taxaEntrega')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Taxa de Entrega
                      <Eye className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                    </span>
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
                  {activeTooltip === 'taxaEntrega' && <MetricTooltip metricKey="taxaEntrega" />}
                </div>

                {/* Taxa de Cancelamento */}
                <div
                  className="relative space-y-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 hover:shadow-md transition-all cursor-pointer group"
                  onMouseEnter={() => setActiveTooltip('taxaCancelamento')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Taxa de Cancelamento
                      <Eye className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                    </span>
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
                  {activeTooltip === 'taxaCancelamento' && <MetricTooltip metricKey="taxaCancelamento" />}
                </div>

                {/* Taxa de Processamento */}
                <div
                  className="relative space-y-3 p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-md transition-all cursor-pointer group"
                  onMouseEnter={() => setActiveTooltip('emProcessamento')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Em Processamento
                      <Eye className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                    </span>
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
                  {activeTooltip === 'emProcessamento' && <MetricTooltip metricKey="emProcessamento" />}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

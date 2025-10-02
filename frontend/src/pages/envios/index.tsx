import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Package, MapPin, Calendar, Truck, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

import Layout from '@/components/Layout';
import api, { getUser } from '@/lib/api';

// Business days utilities (frontend-only) mirroring backend logic
// NOTE: We cannot import backend services into the frontend, so we replicate
// a minimal, deterministic subset of the holiday/business-day rules here to
// compute "business days left" for display purposes only. We DO NOT mutate
// any persisted timestamps; this is purely a UI calculation.
const FIXED_HOLIDAYS = [
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência do Brasil
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '11-20', // Consciência Negra (national holiday since 2024)
  '12-25', // Natal
];

// Movable holidays by year, mirroring backend HolidaysService (subset used by UI)
const MOVABLE_HOLIDAYS_BY_YEAR: Record<number, string[]> = {
  2024: ['2024-02-12', '2024-02-13', '2024-03-29', '2024-03-31', '2024-05-30'],
  2025: ['2025-03-03', '2025-03-04', '2025-04-18', '2025-04-20', '2025-06-19'],
  2026: ['2026-02-16', '2026-02-17', '2026-04-03', '2026-04-05', '2026-06-04'],
};

function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const monthDay = ymd(date).slice(5); // MM-DD
  if (FIXED_HOLIDAYS.includes(monthDay)) return true;
  const movable = MOVABLE_HOLIDAYS_BY_YEAR[year] || [];
  return movable.includes(ymd(date));
}

function isWeekend(date: Date): boolean {
  const dow = date.getDay();
  return dow === 0 || dow === 6; // Sunday or Saturday
}

function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

function addDaysLocal(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Calculates the date that is N business days before a target date
function calculateBusinessDaysBefore(targetDate: Date, businessDays: number): Date {
  let currentDate = new Date(targetDate);
  let daysToSubtract = 0;
  while (businessDays > 0) {
    daysToSubtract++;
    currentDate = addDaysLocal(targetDate, -daysToSubtract);
    if (isBusinessDay(currentDate)) businessDays--;
  }
  return currentDate;
}

// Counts business days between two dates (inclusive of end, exclusive of start)
// i.e., from (start + 1 day) up to end
function countBusinessDaysBetween(startDate: Date, endDate: Date): number {
  if (endDate < startDate) return 0;
  let count = 0;
  let cur = addDaysLocal(startDate, 1);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    if (isBusinessDay(cur)) count++;
    cur = addDaysLocal(cur, 1);
  }
  return count;
}

interface EnvioBrinde {
  id: string;
  colaboradorId: string;
  anoAniversario: number;
  status: 'PENDENTE' | 'PRONTO_PARA_ENVIO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  dataGatilhoEnvio?: string;
  dataEnvioRealizado?: string;
  observacoes?: string;
  createdAt: string;
  colaborador: {
    id: string;
    nomeCompleto: string;
    dataNascimento: string;
    cargo: string;
    departamento: string;
    organizationId: string;
    endereco: {
      id: string;
      cep: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
    };
    organizacao: {
      id: string;
      nome: string;
    };
  };
}

interface EnviosResponse {
  envios: EnvioBrinde[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function EnviosPage() {
  const router = useRouter();
  const [envios, setEnvios] = useState<EnvioBrinde[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, page: 1, totalPages: 0 });
  const [filter, setFilter] = useState<string>('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    loadEnvios();
  }, [filter, currentPage]);

  const loadEnvios = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filter !== 'TODOS') {
        params.append('status', filter);
      }
      params.append('ano', '2025');
      params.append('page', currentPage.toString());
      params.append('limit', '15');

      const response = await api.get(`/envio-brindes?${params.toString()}`);
      const data = response.data;

      setEnvios(data.envios || []);
      setStats({
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1
      });
    } catch (error) {
      console.error('Erro ao carregar envios:', error);
      toast.error('Erro ao carregar envios');
      setEnvios([]);
      setStats({ total: 0, page: 1, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarEnviado = async (envioId: string) => {
    setProcessingId(envioId);
    try {
      await api.patch(`/envio-brindes/${envioId}/marcar-enviado`);
      toast.success('Envio marcado como enviado!');
      loadEnvios();
    } catch (error: any) {
      console.error('Erro ao marcar envio:', error);
      toast.error(error.response?.data?.message || 'Erro ao marcar envio');
    } finally {
      setProcessingId(null);
    }
  };

  // Returns deadline info for UI ONLY (no backend mutation)
  // - businessDaysUntilIdeal: business days left from today until ideal send date
  // - passouIdeal: ideal date already passed
  // - passouAniversario: birthday already passed
  // - dataGatilho: ideal deadline (7 business days before birthday) from backend if present
  const getPrazoInfo = (envio: EnvioBrinde) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataNascimento = new Date(envio.colaborador.dataNascimento);
    const dataAniversario = new Date(envio.anoAniversario, dataNascimento.getMonth(), dataNascimento.getDate());
    dataAniversario.setHours(0, 0, 0, 0);

    const passouAniversario = dataAniversario.getTime() < hoje.getTime();

    // Only for visual guidance about the ideal deadline (7 business days before)
    const dataGatilho = envio.dataGatilhoEnvio ? new Date(envio.dataGatilhoEnvio) : null;
    if (dataGatilho) dataGatilho.setHours(0, 0, 0, 0);
    const idealDate = dataGatilho || calculateBusinessDaysBefore(dataAniversario, 7);
    const passouIdeal = idealDate.getTime() < hoje.getTime();
    const businessDaysUntilIdeal = passouIdeal ? 0 : countBusinessDaysBetween(hoje, idealDate);

    const passouGatilho = dataGatilho ? hoje.getTime() > dataGatilho.getTime() : false;

    return { businessDaysUntilIdeal, passouIdeal, passouAniversario, passouGatilho, idealDate } as const;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente', icon: Clock },
      PRONTO_PARA_ENVIO: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pronto', icon: Package },
      ENVIADO: { bg: 'bg-green-100', text: 'text-green-800', label: 'Enviado', icon: Truck },
      ENTREGUE: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Entregue', icon: CheckCircle },
      CANCELADO: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado', icon: AlertCircle },
    };
    return configs[status as keyof typeof configs] || configs.PENDENTE;
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      if (!dateInput) return '';
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) {
        if (typeof dateInput === 'string' && dateInput.includes('/')) return dateInput;
        return '';
      }
      return date.toLocaleDateString('pt-BR');
    } catch {
      return typeof dateInput === 'string' ? dateInput : '';
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
          <div className="mb-8">
          <div className="bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <Package className="h-8 w-8 mr-3" />
                  Controle de Envios
                </h1>
                <p className="text-white/80 mt-1">Gerencie os envios de brindes de aniversário</p>
              </div>
              <div className="flex items-center space-x-2 bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-xl shadow-md border border-white/20">
                <Package className="h-5 w-5" />
                <span className="font-bold text-2xl">{stats.total}</span>
                <span className="text-sm opacity-90">envios</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'TODOS', label: 'Todos', icon: Package },
                { key: 'PENDENTE', label: 'Pendentes', icon: Clock },
                { key: 'PRONTO_PARA_ENVIO', label: 'Prontos', icon: Package },
                { key: 'ENVIADO', label: 'Enviados', icon: Truck },
                { key: 'ENTREGUE', label: 'Entregues', icon: CheckCircle },
                { key: 'CANCELADO', label: 'Cancelados', icon: AlertCircle },
              ].map((filterOption) => {
                const Icon = filterOption.icon;
                return (
                  <button
                    key={filterOption.key}
                    onClick={() => {
                      setFilter(filterOption.key);
                      setCurrentPage(1); // Reset para primeira página ao mudar filtro
                    }}
                    className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all ${
                      filter === filterOption.key
                        ? 'bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white shadow-md scale-105'
                        : 'bg-beuni-cream text-beuni-text hover:bg-beuni-orange-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {filterOption.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-beuni-text/40" />
              <input
                type="text"
                placeholder="Buscar por nome, destino, departamento ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-beuni-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beuni-orange-600"></div>
          </div>
        ) : envios.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-beuni-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-beuni-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-beuni-text mb-2">Nenhum envio encontrado</h3>
            <p className="text-beuni-text/60">
              {filter === 'TODOS' ? 'Não há envios cadastrados' : `Nenhum envio "${filter.replace(/_/g, ' ').toLowerCase()}"`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {envios
              .filter((envio) => {
                const searchLower = searchTerm.toLowerCase();
                return (
                  envio.colaborador.nomeCompleto?.toLowerCase().includes(searchLower) ||
                  envio.colaborador.departamento?.toLowerCase().includes(searchLower) ||
                  envio.colaborador.cargo?.toLowerCase().includes(searchLower) ||
                  `${envio.colaborador.endereco.cidade}/${envio.colaborador.endereco.uf}`.toLowerCase().includes(searchLower)
                );
              })
              .sort((a, b) => {
                const nomeA = a.colaborador.nomeCompleto?.toLowerCase() || '';
                const nomeB = b.colaborador.nomeCompleto?.toLowerCase() || '';
                return nomeA.localeCompare(nomeB);
              })
              .map((envio) => {
              const statusConfig = getStatusConfig(envio.status);
              const StatusIcon = statusConfig.icon;
              const { businessDaysUntilIdeal, passouIdeal, passouAniversario, passouGatilho, idealDate } = getPrazoInfo(envio);

              return (
                <div
                  key={envio.id}
                  className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-5 hover:shadow-md transition-all"
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                        {envio.colaborador.nomeCompleto.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-beuni-text text-lg truncate">
                          {envio.colaborador.nomeCompleto}
                        </h3>
                        <p className="text-sm text-beuni-text/60 truncate">
                          {envio.colaborador.cargo} • {envio.colaborador.departamento}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                        {statusConfig.label}
                      </span>
                      {envio.status === 'PRONTO_PARA_ENVIO' && (
                        <button
                          onClick={() => handleMarcarEnviado(envio.id)}
                          disabled={processingId === envio.id}
                          className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-sm"
                        >
                          {processingId === envio.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5"></div>
                              Processando...
                            </>
                          ) : (
                            <>
                              <Truck className="h-3.5 w-3.5 mr-1.5" />
                              Marcar Enviado
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info Grid Compacta - SEMPRE 3 COLUNAS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Aniversário */}
                    <div className="flex items-center space-x-2 bg-beuni-cream rounded-lg px-3 py-2">
                      <Calendar className="h-4 w-4 text-beuni-orange-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-beuni-text/60 font-semibold uppercase">Aniversário</p>
                        <p className="text-sm font-bold text-beuni-text truncate">{formatDate(envio.colaborador.dataNascimento)}</p>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="flex items-center space-x-2 bg-beuni-cream rounded-lg px-3 py-2">
                      <MapPin className="h-4 w-4 text-beuni-orange-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-beuni-text/60 font-semibold uppercase">Destino</p>
                        <p className="text-sm font-medium text-beuni-text truncate">
                          {envio.colaborador.endereco.cidade}/{envio.colaborador.endereco.uf}
                        </p>
                      </div>
                    </div>

                    {/* Deadline / Dates - visual logic (business-day aware, ideal date focused) */}
                    {envio.status === 'ENTREGUE' ? (
                      <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-emerald-700 font-semibold uppercase">Entregue em</p>
                          <p className="text-sm font-bold text-emerald-900 truncate">{formatDate(envio.dataEnvioRealizado || '')}</p>
                        </div>
                      </div>
                    ) : envio.status === 'ENVIADO' && envio.dataEnvioRealizado ? (
                      <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <Truck className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-emerald-700 font-semibold uppercase">Entregue em</p>
                          <p className="text-sm font-bold text-emerald-900 truncate">
                            {envio.dataEnvioRealizado ? formatDate(envio.dataEnvioRealizado) : '-'}
                          </p>
                        </div>
                      </div>
                    ) : envio.status === 'ENVIADO' ? (
                      <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <Truck className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-green-700 font-semibold uppercase">Enviado em</p>
                          <p className="text-sm font-bold text-green-900 truncate">
                            {envio.dataEnvioRealizado ? formatDate(envio.dataEnvioRealizado) : '-'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      (() => {
                        // For PENDENTE/PRONTO_PARA_ENVIO, show countdown to IDEAL send date (7 business days before birthday)
                        const bgClass = passouAniversario
                          ? 'bg-red-50 border border-red-200'
                          : passouIdeal
                          ? 'bg-orange-50 border border-orange-200'
                          : businessDaysUntilIdeal === 0
                          ? 'bg-red-50 border border-red-200'
                          : businessDaysUntilIdeal <= 2
                          ? 'bg-orange-50 border border-orange-200'
                          : businessDaysUntilIdeal <= 5
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-blue-50 border border-blue-200';

                        const textTone = passouAniversario
                          ? { small: 'text-red-700', big: 'text-red-900' }
                          : passouIdeal
                          ? { small: 'text-orange-700', big: 'text-orange-900' }
                          : businessDaysUntilIdeal === 0
                          ? { small: 'text-red-700', big: 'text-red-900' }
                          : businessDaysUntilIdeal <= 2
                          ? { small: 'text-orange-700', big: 'text-orange-900' }
                          : businessDaysUntilIdeal <= 5
                          ? { small: 'text-yellow-700', big: 'text-yellow-900' }
                          : { small: 'text-blue-700', big: 'text-blue-900' };

                        return (
                          <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 ${bgClass}`}>
                            {passouAniversario ? (
                              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
                            ) : (
                              <Clock className={`h-4 w-4 flex-shrink-0 ${
                                passouIdeal
                                  ? 'text-orange-600'
                                  : businessDaysUntilIdeal === 0
                                  ? 'text-red-600'
                                  : businessDaysUntilIdeal <= 2
                                  ? 'text-orange-600'
                                  : businessDaysUntilIdeal <= 5
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                              }`} />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-semibold uppercase ${textTone.small}`}>
                                {passouAniversario
                                  ? 'ATRASADO'
                                  : passouIdeal
                                  ? 'APÓS PRAZO IDEAL'
                                  : businessDaysUntilIdeal === 0
                                  ? 'ÚLTIMO DIA PARA ENVIAR'
                                  : 'PRAZO IDEAL'}
                              </p>
                              <p className={`text-sm font-bold truncate ${textTone.big}`}>
                                {passouAniversario
                                  ? '—'
                                  : passouIdeal
                                  ? 'Envie o quanto antes'
                                  : businessDaysUntilIdeal === 0
                                  ? 'Hoje é o último dia'
                                  : `${businessDaysUntilIdeal} dias para enviar brinde`}
                              </p>
                              {idealDate && (
                                <p className="text-[12px] mt-0.5">
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-beuni-orange-100 text-beuni-orange-700 font-semibold mr-2">Prazo ideal</span>
                                  <span className="text-beuni-text font-medium">até {formatDate(idealDate)}{' '}
                                    {passouIdeal && <span className="text-red-600 font-semibold">(após o prazo ideal)</span>}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {!loading && envios.length > 0 && stats.totalPages > 1 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Informações da Página */}
              <div className="text-sm text-beuni-text/60">
                Mostrando <span className="font-bold text-beuni-text">{envios.length}</span> de{' '}
                <span className="font-bold text-beuni-text">{stats.total}</span> envios
                <span className="mx-2">•</span>
                Página <span className="font-bold text-beuni-text">{stats.page}</span> de{' '}
                <span className="font-bold text-beuni-text">{stats.totalPages}</span>
              </div>

              {/* Controles de Navegação */}
              <div className="flex items-center space-x-2">
                {/* Botão Anterior */}
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-beuni-cream text-beuni-text hover:bg-beuni-orange-50 disabled:hover:bg-beuni-cream"
                >
                  Anterior
                </button>

                {/* Números das Páginas */}
                <div className="hidden sm:flex items-center space-x-1">
                  {Array.from({ length: stats.totalPages }, (_, i) => i + 1).map((page) => {
                    // Mostra apenas algumas páginas próximas da atual
                    if (
                      page === 1 ||
                      page === stats.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white shadow-md'
                              : 'bg-beuni-cream text-beuni-text hover:bg-beuni-orange-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="text-beuni-text/40 px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Botão Próxima */}
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, stats.totalPages));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === stats.totalPages}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-beuni-cream text-beuni-text hover:bg-beuni-orange-50 disabled:hover:bg-beuni-cream"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

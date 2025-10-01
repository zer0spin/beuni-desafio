import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Package, MapPin, Calendar, Truck, CheckCircle, Clock, AlertCircle, Filter, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

import Layout from '@/components/Layout';
import api, { getUser } from '@/lib/api';

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

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    loadEnvios();
  }, [filter]);

  const loadEnvios = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filter !== 'TODOS') {
        params.append('status', filter);
      }
      params.append('ano', '2025');
      params.append('page', '1');
      params.append('limit', '50');

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

  const calcularDiasRestantes = (dataLimite?: string): number | null => {
    if (!dataLimite) return null;
    const hoje = new Date();
    const limite = new Date(dataLimite);
    hoje.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);
    const diffTime = limite.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-beuni-text flex items-center">
                <Package className="h-8 w-8 mr-3 text-beuni-orange-600" />
                Controle de Envios
              </h1>
              <p className="text-beuni-text/60 mt-1">
                Gerencie os envios de brindes de aniversário
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white px-6 py-3 rounded-xl shadow-md">
              <Package className="h-5 w-5" />
              <span className="font-bold text-2xl">{stats.total}</span>
              <span className="text-sm opacity-90">envios</span>
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
                    onClick={() => setFilter(filterOption.key)}
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
            {envios.map((envio) => {
              const statusConfig = getStatusConfig(envio.status);
              const StatusIcon = statusConfig.icon;
              const diasRestantes = calcularDiasRestantes(envio.dataGatilhoEnvio);

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

                  {/* Info Grid Compacta */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
                    {/* Aniversário */}
                    <div className="flex items-center space-x-2 bg-beuni-cream rounded-lg px-3 py-2">
                      <Calendar className="h-4 w-4 text-beuni-orange-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-beuni-text/60 font-semibold uppercase">Aniversário</p>
                        <p className="text-sm font-bold text-beuni-text truncate">{formatDate(envio.colaborador.dataNascimento)}</p>
                      </div>
                    </div>

                    {/* Data Limite */}
                    {envio.dataGatilhoEnvio && (
                      <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-amber-700 font-semibold uppercase">Enviar até</p>
                          <p className="text-sm font-bold text-amber-900 truncate">{formatDate(envio.dataGatilhoEnvio)}</p>
                        </div>
                      </div>
                    )}

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
                  </div>

                  {/* Alertas */}
                  <div className="flex flex-wrap gap-2">
                    {/* Dias Restantes */}
                    {envio.status !== 'ENVIADO' && envio.status !== 'ENTREGUE' && envio.status !== 'CANCELADO' && diasRestantes !== null && (
                      <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        diasRestantes < 0
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : diasRestantes === 0
                          ? 'bg-red-50 border border-red-200 text-red-700 animate-pulse'
                          : diasRestantes <= 2
                          ? 'bg-orange-50 border border-orange-200 text-orange-700'
                          : diasRestantes <= 5
                          ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                          : 'bg-blue-50 border border-blue-200 text-blue-700'
                      }`}>
                        {diasRestantes < 0 ? (
                          <>
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Atrasado {Math.abs(diasRestantes)}d</span>
                          </>
                        ) : diasRestantes === 0 ? (
                          <>
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>ÚLTIMO DIA!</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            <span>{diasRestantes}d restante{diasRestantes > 1 ? 's' : ''}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Data de Envio Realizado */}
                    {envio.dataEnvioRealizado && (
                      <div className="flex items-center space-x-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold text-green-700">
                        <Truck className="h-3.5 w-3.5" />
                        <span>Enviado em {formatDate(envio.dataEnvioRealizado)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

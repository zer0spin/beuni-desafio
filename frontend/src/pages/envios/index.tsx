import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Package, User, MapPin, Calendar, Truck, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
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

      // Construir parâmetros da query
      const params = new URLSearchParams();
      if (filter !== 'TODOS') {
        params.append('status', filter);
      }
      params.append('ano', '2024');
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
      setStats({
        total: 0,
        page: 1,
        totalPages: 1
      });
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

  // Calcular dias restantes até a data limite de envio
  const calcularDiasRestantes = (dataLimite?: string): number | null => {
    if (!dataLimite) return null;

    const hoje = new Date();
    const limite = new Date(dataLimite);

    // Normalizar para início do dia
    hoje.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);

    const diffTime = limite.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Obter badge de alerta baseado nos dias restantes
  const getAlertaBadge = (diasRestantes: number | null) => {
    if (diasRestantes === null) return null;

    if (diasRestantes < 0) {
      return (
        <div className="flex items-center space-x-2 bg-red-50 border-2 border-red-200 px-3 py-2 rounded-xl">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700 font-bold">
            ⚠️ Prazo vencido há {Math.abs(diasRestantes)} dia(s)
          </span>
        </div>
      );
    }

    if (diasRestantes === 0) {
      return (
        <div className="flex items-center space-x-2 bg-red-50 border-2 border-red-200 px-3 py-2 rounded-xl animate-pulse">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700 font-bold">
            ⚠️ ÚLTIMO DIA para envio!
          </span>
        </div>
      );
    }

    if (diasRestantes <= 2) {
      return (
        <div className="flex items-center space-x-2 bg-orange-50 border-2 border-orange-200 px-3 py-2 rounded-xl">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-orange-700 font-bold">
            ⏰ Enviar em até {diasRestantes} dia(s)
          </span>
        </div>
      );
    }

    if (diasRestantes <= 5) {
      return (
        <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-xl">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-700 font-semibold">
            {diasRestantes} dias restantes
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl">
        <Clock className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-700 font-medium">
          {diasRestantes} dias restantes
        </span>
      </div>
    );
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      PENDENTE: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pendente',
        icon: Clock,
        description: 'Aguardando processamento'
      },
      PRONTO_PARA_ENVIO: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Pronto',
        icon: Package,
        description: 'Pronto para envio'
      },
      ENVIADO: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Enviado',
        icon: Truck,
        description: 'Enviado'
      },
      ENTREGUE: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        label: 'Entregue',
        icon: CheckCircle,
        description: 'Entregue'
      },
      CANCELADO: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Cancelado',
        icon: AlertCircle,
        description: 'Cancelado'
      },
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDENTE;
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusInfo(status);
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      if (!dateInput) return '';
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) {
        // Se a data for inválida, tenta retornar o string original se for dd/MM/yyyy
        if (typeof dateInput === 'string' && dateInput.includes('/')) {
          return dateInput;
        }
        return '';
      }
      return date.toLocaleDateString('pt-BR');
    } catch {
      return typeof dateInput === 'string' ? dateInput : '';
    }
  };

  const formatAddress = (endereco: any) => {
    const complemento = endereco.complemento ? `, ${endereco.complemento}` : '';
    return `${endereco.logradouro}, ${endereco.numero}${complemento} - ${endereco.bairro}, ${endereco.cidade}/${endereco.uf}`;
  };

  return (
      <Layout>
        <div className="p-6 lg:p-8">
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
              <div className="flex items-center space-x-2 bg-beuni-cream px-4 py-2 rounded-xl">
                <Package className="h-5 w-5 text-beuni-orange-600" />
                <span className="font-bold text-beuni-text text-lg">{stats.total}</span>
                <span className="text-beuni-text/60 text-sm">envios</span>
              </div>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-4">
            <div className="flex items-center mb-3">
              <Filter className="h-5 w-5 text-beuni-orange-600 mr-2" />
              <h3 className="font-bold text-beuni-text">Filtrar por Status</h3>
            </div>
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
                    className={`flex items-center px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 ${
                      filter === filterOption.key
                        ? 'bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white shadow-md'
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

        {/* Main Content */}
        <div className="pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beuni-orange-600"></div>
          </div>
        ) : envios.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 overflow-hidden">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-beuni-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-beuni-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-beuni-text mb-2">Nenhum envio encontrado</h3>
              <p className="text-beuni-text/60 text-sm">
                {filter === 'TODOS'
                  ? 'Não há envios cadastrados no sistema'
                  : `Não há envios com status "${filter.replace(/_/g, ' ').toLowerCase()}"`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-beuni-orange-100 bg-gradient-to-r from-beuni-cream to-white">
              <h3 className="text-xl font-bold text-beuni-text flex items-center">
                <Package className="h-6 w-6 mr-2 text-beuni-orange-600" />
                Lista de Envios
                {stats.total > 0 && (
                  <span className="ml-2 px-3 py-1 bg-beuni-orange-100 text-beuni-orange-700 rounded-full text-sm font-bold">
                    {stats.total}
                  </span>
                )}
              </h3>
            </div>

            <div className="divide-y divide-beuni-orange-100">
              {envios.map((envio) => (
                <div key={envio.id} className="p-6 hover:bg-beuni-cream/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Colaborador Info */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {envio.colaborador.nomeCompleto.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-beuni-text text-lg">
                            {envio.colaborador.nomeCompleto}
                          </h4>
                          <p className="text-sm text-beuni-text/60 font-medium">
                            {envio.colaborador.cargo} • {envio.colaborador.departamento}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-start space-x-3 bg-beuni-cream rounded-xl p-3">
                          <Calendar className="h-5 w-5 text-beuni-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-beuni-text/60 font-semibold uppercase tracking-wide mb-1">Aniversário</p>
                            <p className="text-sm font-bold text-beuni-text">
                              {formatDate(envio.colaborador.dataNascimento)}
                            </p>
                          </div>
                        </div>

                        {envio.dataGatilhoEnvio && (
                          <div className="flex items-start space-x-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                            <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-1">
                                Data Limite de Envio
                              </p>
                              <p className="text-sm font-bold text-amber-900">
                                {formatDate(envio.dataGatilhoEnvio)}
                              </p>
                              <p className="text-xs text-amber-600 font-medium mt-0.5">
                                7 dias úteis antes
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start space-x-3 bg-beuni-cream rounded-xl p-3">
                          <MapPin className="h-5 w-5 text-beuni-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-beuni-text/60 font-semibold uppercase tracking-wide mb-1">Endereço de entrega</p>
                            <p className="text-sm text-beuni-text font-medium">
                              {formatAddress(envio.colaborador.endereco)}
                            </p>
                            <p className="text-xs text-beuni-text/50 font-medium mt-1">
                              CEP: {envio.colaborador.endereco.cep}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Alerta de dias restantes para envio */}
                      {envio.status !== 'ENVIADO' && envio.status !== 'ENTREGUE' && envio.status !== 'CANCELADO' && envio.dataGatilhoEnvio && (
                        <div className="mb-3">
                          {getAlertaBadge(calcularDiasRestantes(envio.dataGatilhoEnvio))}
                        </div>
                      )}

                      {envio.dataEnvioRealizado && (
                        <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-xl">
                          <Truck className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-semibold">
                            Enviado em: {formatDate(envio.dataEnvioRealizado)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      {getStatusBadge(envio.status)}

                      {envio.status === 'PRONTO_PARA_ENVIO' && (
                        <button
                          onClick={() => handleMarcarEnviado(envio.id)}
                          disabled={processingId === envio.id}
                          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === envio.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processando...
                            </>
                          ) : (
                            <>
                              <Truck className="h-4 w-4 mr-2" />
                              Marcar como Enviado
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </Layout>
  );
}
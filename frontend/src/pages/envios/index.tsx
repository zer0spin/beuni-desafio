import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, User, MapPin, Calendar, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api, { getUser } from '../../lib/api';

interface EnvioBrinde {
  id: string;
  anoAniversario: number;
  status: 'PENDENTE' | 'PRONTO_PARA_ENVIO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  dataEnvio?: string;
  colaborador: {
    id: string;
    nomeCompleto: string;
    dataNascimento: string;
    cargo: string;
    departamento: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
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
      let url = '/envio-brindes/prontos-para-envio';

      if (filter === 'TODOS') {
        url = '/envio-brindes';
      } else if (filter !== 'PRONTO_PARA_ENVIO') {
        url = `/envio-brindes?status=${filter}`;
      }

      const response = await api.get<EnviosResponse>(url);
      setEnvios(response.data.envios || response.data);
      if (response.data.total !== undefined) {
        setStats({
          total: response.data.total,
          page: response.data.page,
          totalPages: response.data.totalPages
        });
      }
    } catch (error) {
      console.error('Erro ao carregar envios:', error);
      toast.error('Erro ao carregar envios');
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatAddress = (endereco: any) => {
    const complemento = endereco.complemento ? `, ${endereco.complemento}` : '';
    return `${endereco.logradouro}, ${endereco.numero}${complemento} - ${endereco.bairro}, ${endereco.cidade}/${endereco.uf}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Controle de Envios</h1>
                  <p className="text-sm text-gray-600">Gerencie os envios de brindes de aniversário</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'TODOS', label: 'Todos' },
              { key: 'PENDENTE', label: 'Pendentes' },
              { key: 'PRONTO_PARA_ENVIO', label: 'Prontos' },
              { key: 'ENVIADO', label: 'Enviados' },
              { key: 'ENTREGUE', label: 'Entregues' },
              { key: 'CANCELADO', label: 'Cancelados' },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : envios.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum envio encontrado</h3>
              <p className="text-gray-500 text-sm">
                {filter === 'TODOS'
                  ? 'Não há envios cadastrados no sistema'
                  : `Não há envios com status "${filter.toLowerCase()}"`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Lista de Envios {stats.total > 0 && `(${stats.total} itens)`}
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {envios.map((envio) => (
                <div key={envio.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {envio.colaborador.nomeCompleto}
                          </span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {envio.colaborador.cargo} - {envio.colaborador.departamento}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600">Aniversário</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(envio.colaborador.dataNascimento)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600">Endereço de entrega</p>
                            <p className="text-sm text-gray-900">
                              {formatAddress(envio.colaborador.endereco)}
                            </p>
                            <p className="text-sm text-gray-500">
                              CEP: {envio.colaborador.endereco.cep}
                            </p>
                          </div>
                        </div>
                      </div>

                      {envio.dataEnvio && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Enviado em: {formatDate(envio.dataEnvio)}
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
                          className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors disabled:opacity-50"
                        >
                          {processingId === envio.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
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
    </div>
  );
}
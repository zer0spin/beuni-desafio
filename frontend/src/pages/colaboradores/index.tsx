import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Users, Plus, Calendar, Edit, Eye, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api, { getUser } from '../../lib/api';

interface Colaborador {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  cargo: string;
  departamento: string;
  endereco: {
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  status_envio_atual: string;
}

interface ColaboradoresResponse {
  colaboradores: Colaborador[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ColaboradoresPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, page: 1, totalPages: 0 });
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadColaboradores();
  }, []);

  const loadColaboradores = async () => {
    try {
      setLoading(true);
      const response = await api.get<ColaboradoresResponse>('/colaboradores');
      setColaboradores(response.data.colaboradores);
      setStats({
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      PRONTO_PARA_ENVIO: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pronto' },
      ENVIADO: { bg: 'bg-green-100', text: 'text-green-800', label: 'Enviado' },
      ENTREGUE: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Entregue' },
      CANCELADO: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDENTE;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const updateColaboradorStatus = async (colaboradorId: string, newStatus: string) => {
    try {
      setUpdatingStatus(colaboradorId);

      // Primeiro buscar o ID do envio de brinde do colaborador
      const enviosResponse = await api.get(`/envio-brindes?colaboradorId=${colaboradorId}&ano=${new Date().getFullYear()}`);
      const envio = enviosResponse.data.envios?.[0];

      if (!envio) {
        toast.error('Envio de brinde não encontrado para este colaborador');
        return;
      }

      // Atualizar status do envio
      await api.patch(`/envio-brindes/${envio.id}/status`, {
        status: newStatus,
        observacoes: `Status atualizado para ${getStatusLabel(newStatus)} via interface web`
      });

      toast.success('Status atualizado com sucesso!');

      // Recarregar lista de colaboradores
      loadColaboradores();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do colaborador');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'PENDENTE': 'Pendente',
      'PRONTO_PARA_ENVIO': 'Pronto para Envio',
      'ENVIADO': 'Enviado',
      'ENTREGUE': 'Entregue',
      'CANCELADO': 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const StatusDropdown = ({ colaborador }: { colaborador: Colaborador }) => {
    const [isOpen, setIsOpen] = useState(false);
    const currentStatus = colaborador.status_envio_atual || 'PENDENTE';

    const statusOptions = [
      { value: 'PENDENTE', label: 'Pendente', color: 'yellow' },
      { value: 'PRONTO_PARA_ENVIO', label: 'Pronto para Envio', color: 'blue' },
      { value: 'ENVIADO', label: 'Enviado', color: 'green' },
      { value: 'ENTREGUE', label: 'Entregue', color: 'emerald' },
      { value: 'CANCELADO', label: 'Cancelado', color: 'red' }
    ];

    // Fechar dropdown ao clicar fora
    useEffect(() => {
      const handleClickOutside = () => setIsOpen(false);
      if (isOpen) {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
      }
    }, [isOpen]);

    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={updatingStatus === colaborador.id}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
        >
          {getStatusBadge(currentStatus)}
          <Settings className="h-3 w-3 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="py-1">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (option.value !== currentStatus) {
                      updateColaboradorStatus(colaborador.id, option.value);
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors ${
                    option.value === currentStatus ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      option.color === 'yellow' ? 'bg-yellow-500' :
                      option.color === 'blue' ? 'bg-blue-500' :
                      option.color === 'green' ? 'bg-green-500' :
                      option.color === 'emerald' ? 'bg-emerald-500' :
                      'bg-red-500'
                    }`}></span>
                    <span>{option.label}</span>
                    {option.value === currentStatus && (
                      <span className="ml-auto text-orange-600 font-bold">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Colaboradores</h1>
                  <p className="text-sm text-gray-600">Gerencie os colaboradores da sua organização</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                ← Dashboard
              </Link>
              <Link
                href="/calendario"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 font-medium rounded-lg hover:from-orange-200 hover:to-red-200 hover:text-orange-800 transition-all duration-200 border border-orange-200 hover:border-orange-300"
              >
                <Calendar className="h-4 w-4 mr-2" />
                📅 Calendário
              </Link>
              <Link
                href="/colaboradores/novo"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Novo Colaborador
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : colaboradores.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador cadastrado</h3>
              <p className="text-gray-500 text-sm mb-6">Comece adicionando o primeiro colaborador da sua organização</p>
              <Link
                href="/colaboradores/novo"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Primeiro Colaborador
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {stats.total} colaborador{stats.total !== 1 ? 'es' : ''} cadastrado{stats.total !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-4 border-l border-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <span className="text-sm text-gray-600">
                      Visualizar aniversários
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    href="/calendario"
                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Calendário
                  </Link>
                  <Link
                    href="/relatorios"
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Relatórios →
                  </Link>
                </div>
              </div>

              {/* Calendar Quick Info */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">📅 Calendário de Aniversários</h4>
                      <p className="text-xs text-gray-600">Visualize todos os aniversários em formato mensal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link
                      href="/calendario"
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                    >
                      Abrir calendário completo →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Colaboradores Table */}
            <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-visible">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista de Colaboradores</h3>
              </div>
              <div className="overflow-x-auto overflow-y-visible">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aniversário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {colaboradores.map((colaborador) => (
                      <tr key={colaborador.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {colaborador.nome_completo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {colaborador.endereco.cidade}, {colaborador.endereco.uf}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {colaborador.cargo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {colaborador.departamento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {colaborador.data_nascimento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusDropdown colaborador={colaborador} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/colaboradores/editar/${colaborador.id}`}
                              className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
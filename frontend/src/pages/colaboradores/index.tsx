import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Users, Plus, Search, Edit, Calendar, MapPin, Briefcase, Package, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import Layout from '@/components/Layout';
import api, { endpoints } from '@/lib/api';
import type { ColaboradoresResponse, Colaborador } from '@/types';

interface EnvioBrinde {
  id: string;
  colaboradorId: string;
  status: 'PENDENTE' | 'PRONTO_PARA_ENVIO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  createdAt: string;
  updatedAt: string;
}

export default function ColaboradoresPage() {
  const parseBrDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy) return null;
    return new Date(yyyy, mm - 1, dd);
  };
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, page: 1, totalPages: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [enviosBrindes, setEnviosBrindes] = useState<EnvioBrinde[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadColaboradores(currentPage);
  }, [currentPage]);

    const loadColaboradores = async (page: number = 1) => {
    try {
      setLoading(true);
      const [colaboradoresResponse, enviosResponse] = await Promise.all([
        api.get<ColaboradoresResponse>(`${endpoints.colaboradores}?page=${page}&limit=10`),
        api.get<{ envios: EnvioBrinde[] }>(endpoints.enviosBrindes)
      ]);

      setColaboradores(colaboradoresResponse.data.colaboradores);
      setEnviosBrindes(enviosResponse.data.envios || []);
      setStats({
        total: colaboradoresResponse.data.total,
        page: colaboradoresResponse.data.page,
        totalPages: colaboradoresResponse.data.totalPages,
      });
    } catch (error) {
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllColaboradores = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(endpoints.colaboradores);
      toast.success('Todos os colaboradores deletados com sucesso!');
      setShowDeleteConfirm(false);
      loadColaboradores(1);
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao deletar colaboradores');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusEnvio = (colaboradorId: string) => {
    const envio = enviosBrindes.find(e => e.colaboradorId === colaboradorId);
    return envio?.status || null;
  };

  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PRONTO_PARA_ENVIO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ENVIADO':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ENTREGUE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'PRONTO_PARA_ENVIO':
        return 'Pronto';
      case 'ENVIADO':
        return 'Enviado';
      case 'ENTREGUE':
        return 'Entregue';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return 'Sem envio';
    }
  };

  const filteredColaboradores = colaboradores
    .filter((col) =>
      col.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nomeA = a.nome_completo?.toLowerCase() || '';
      const nomeB = b.nome_completo?.toLowerCase() || '';
      return nomeA.localeCompare(nomeB);
    });

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <Users className="h-8 w-8 mr-3" />
                  Colaboradores
                </h1>
                <p className="text-white/80 mt-1">Gerencie todos os colaboradores da organização</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Deletar Todos
                </button>
                <button
                  onClick={() => router.push('/colaboradores/novo')}
                  className="flex items-center px-6 py-3 bg-white text-beuni-orange-600 font-semibold rounded-xl hover:bg-beuni-orange-50 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Colaborador
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-beuni-orange-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-beuni-text/60 mb-1">Total</p>
                  <p className="text-3xl font-bold text-beuni-text">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-beuni-orange-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-beuni-text/60 mb-1">Aniversários Este Mês</p>
                  <p className="text-3xl font-bold text-beuni-text">
                    {colaboradores.filter(c => {
                      const birthday = parseBrDate(c.data_nascimento);
                      return birthday && birthday.getMonth() === new Date().getMonth();
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-beuni-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-beuni-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-beuni-orange-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-beuni-text/60 mb-1">Departamentos</p>
                  <p className="text-3xl font-bold text-beuni-text">
                    {new Set(colaboradores.map(c => c.departamento).filter(Boolean)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-beuni-text/40" />
            <input
              type="text"
              placeholder="Buscar por nome, cargo ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-beuni-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beuni-orange-500 mx-auto"></div>
              <p className="mt-4 text-beuni-text/60">Carregando colaboradores...</p>
            </div>
          ) : filteredColaboradores.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-beuni-text/30 mx-auto mb-4" />
              <p className="text-beuni-text/60">
                {searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador cadastrado'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/colaboradores/novo')}
                  className="mt-4 text-beuni-orange-600 hover:text-beuni-orange-700 font-medium"
                >
                  Cadastrar primeiro colaborador
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-beuni-cream border-b border-beuni-orange-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-beuni-text/70 uppercase tracking-wider">
                      Colaborador
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-beuni-text/70 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-beuni-text/70 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-beuni-text/70 uppercase tracking-wider">
                      Status Envio
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-beuni-text/70 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beuni-orange-100">
                  {filteredColaboradores.map((colaborador) => (
                    <tr
                      key={colaborador.id}
                      className="hover:bg-beuni-cream/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {colaborador.nome_completo ? colaborador.nome_completo.charAt(0) : '?'}
                          </div>
                          <div className="ml-4">
                            <p className="font-semibold text-beuni-text">{colaborador.nome_completo || 'Nome não disponível'}</p>
                            <p className="text-sm text-beuni-text/60">{colaborador.cargo || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-beuni-text">{colaborador.departamento || '-'}</p>
                        <p className="text-sm text-beuni-text/60 flex items-center mt-1">
                          <Calendar className="h-3 w-3 text-beuni-orange-600 mr-1" />
                          {colaborador.data_nascimento
                            ? (() => {
                                const d = parseBrDate(colaborador.data_nascimento);
                                return d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : '-';
                              })()
                            : '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-beuni-text/40 mr-2" />
                          <span className="text-sm text-beuni-text">
                            {colaborador.endereco?.cidade}, {colaborador.endereco?.uf}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const status = getStatusEnvio(colaborador.id);
                          return (
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-beuni-text/40 mr-2" />
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(status)}`}>
                                {getStatusLabel(status)}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/colaboradores/editar/${colaborador.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && stats.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-beuni-text/60">
              Mostrando {filteredColaboradores.length} de {stats.total} colaboradores • Página {currentPage} de {stats.totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border-2 border-beuni-orange-200 rounded-lg hover:bg-beuni-cream disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
              >
                Anterior
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: stats.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white shadow-md'
                        : 'border-2 border-beuni-orange-200 hover:bg-beuni-cream'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, stats.totalPages))}
                disabled={currentPage === stats.totalPages}
                className="px-4 py-2 border-2 border-beuni-orange-200 rounded-lg hover:bg-beuni-cream disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ⚠️ DELETAR TODOS OS COLABORADORES
              </h3>
              <p className="text-gray-600 mb-6">
                Isso irá deletar permanentemente <strong>TODOS os colaboradores</strong> e <strong>TODOS os registros de envio relacionados</strong>. 
                Esta ação não pode ser desfeita e irá resetar completamente seu banco de dados.
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                  className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAllColaboradores}
                  disabled={deleteLoading}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Deletando...' : 'DELETAR TODOS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
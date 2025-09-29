import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Users, Calendar, Package, TrendingUp, Gift, BarChart3, Settings, Bell, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api, { getUser, removeAuthToken, endpoints } from '@/lib/api';
import type { User, ColaboradoresResponse, EstatisticasEnvio } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalColaboradores: 0,
    aniversariantesProximoMes: 0,
    enviosPendentes: 0,
    enviosRealizados: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load colaboradores stats
      const colaboradoresResponse = await api.get<ColaboradoresResponse>(
        endpoints.colaboradores + '?limit=1'
      );

      // Load upcoming birthdays
      const proximosResponse = await api.get(endpoints.colaboradoresProximos);

      // Load delivery statistics
      const statsResponse = await api.get<EstatisticasEnvio>(
        endpoints.estatisticas
      );

      setStats({
        totalColaboradores: colaboradoresResponse.data.total,
        aniversariantesProximoMes: proximosResponse.data.length,
        enviosPendentes: statsResponse.data.porStatus?.PENDENTE || 0,
        enviosRealizados: statsResponse.data.porStatus?.ENVIADO || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
                    Beuni Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">
                    {user.nome} - {user.organizacao.nome}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-white/5 rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Olá, {user.nome.split(' ')[0]}! 👋</h2>
              <p className="text-orange-100 text-lg">
                Aqui está um resumo dos aniversários da sua empresa hoje.
              </p>
              <div className="mt-6 flex items-center space-x-4">
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">Hoje: {new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500">
                  Total de Colaboradores
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  ) : (
                    stats.totalColaboradores
                  )}
                </dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500">
                  Aniversários Próximo Mês
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  ) : (
                    stats.aniversariantesProximoMes
                  )}
                </dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500">
                  Envios Pendentes
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  ) : (
                    stats.enviosPendentes
                  )}
                </dd>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500">
                  Envios Realizados
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  ) : (
                    stats.enviosRealizados
                  )}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Calendar Access - Enhanced */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 bg-white/5 rounded-full"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-8 w-8 text-white" />
                  <h3 className="text-2xl font-bold">📅 Calendário de Aniversários</h3>
                </div>
                <p className="text-orange-100 mb-2">
                  Visualize todos os aniversários dos colaboradores em formato de calendário mensal
                </p>
                <div className="text-sm text-orange-200">
                  • Exportar eventos para seu calendário pessoal • Filtrar por departamento • Acompanhar status de envios
                </div>
              </div>
              <div className="ml-6 flex flex-col space-y-3">
                <button
                  onClick={() => router.push('/calendario')}
                  className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 backdrop-blur-sm"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Abrir Calendário</span>
                </button>
                <div className="text-center">
                  <p className="text-sm text-orange-200">
                    {stats.aniversariantesProximoMes > 0 && (
                      <span>🎂 {stats.aniversariantesProximoMes} próximo{stats.aniversariantesProximoMes !== 1 ? 's' : ''}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Ações Rápidas
            </h2>
            <span className="text-sm text-gray-500">Acesse rapidamente as principais funcionalidades</span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => router.push('/colaboradores')}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-200 text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Colaboradores
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Visualizar, adicionar e editar colaboradores da organização
              </p>
            </button>

            <button
              onClick={() => router.push('/colaboradores/novo')}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200 text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    Novo Colaborador
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Adicionar novo colaborador ao sistema com dados completos
              </p>
            </button>

            <button
              onClick={() => router.push('/envios')}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-200 text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Controle de Envios
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Acompanhar e gerenciar status dos envios de brindes
              </p>
            </button>

            <button
              onClick={() => router.push('/calendario')}
              className="group bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-2xl shadow-sm border border-orange-200 p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-200 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-orange-200/20 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:from-orange-600 group-hover:to-red-700 transition-colors shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                      📅 Calendário
                    </h3>
                  </div>
                  {stats.aniversariantesProximoMes > 0 && (
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {stats.aniversariantesProximoMes} próximo{stats.aniversariantesProximoMes !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  Visualize aniversários em formato de calendário, exporte eventos e filtre por departamento
                </p>
              </div>
            </button>

            <button
              onClick={() => router.push('/relatorios')}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    Relatórios
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Analise dados, estatísticas e gere relatórios completos
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
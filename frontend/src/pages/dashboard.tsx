import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Users, Calendar, Package, TrendingUp } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Beuni
              </h1>
              <p className="text-gray-600">
                Bem-vindo, {user.nome} - {user.organizacao.nome}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Colaboradores
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {isLoading ? '...' : stats.totalColaboradores}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Aniversários Próximo Mês
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {isLoading ? '...' : stats.aniversariantesProximoMes}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-warning-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Envios Pendentes
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {isLoading ? '...' : stats.enviosPendentes}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-success-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Envios Realizados
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {isLoading ? '...' : stats.enviosRealizados}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => router.push('/colaboradores')}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                <div className="card-body text-left">
                  <h3 className="text-lg font-medium text-gray-900">
                    Gerenciar Colaboradores
                  </h3>
                  <p className="text-gray-600">
                    Visualizar, adicionar e editar colaboradores
                  </p>
                </div>
              </button>

              <button
                onClick={() => router.push('/colaboradores/novo')}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                <div className="card-body text-left">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cadastrar Colaborador
                  </h3>
                  <p className="text-gray-600">
                    Adicionar novo colaborador ao sistema
                  </p>
                </div>
              </button>

              <button
                onClick={() => router.push('/envios')}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                <div className="card-body text-left">
                  <h3 className="text-lg font-medium text-gray-900">
                    Controle de Envios
                  </h3>
                  <p className="text-gray-600">
                    Acompanhar status dos envios de brindes
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
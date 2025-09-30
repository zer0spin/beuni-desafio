import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Users,
  Calendar,
  Package,
  TrendingUp,
  Gift,
  ArrowRight,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import Layout from '@/components/Layout';
import api, { endpoints } from '@/lib/api';
import type { ColaboradoresResponse, EstatisticasEnvio } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalColaboradores: 0,
    aniversariantesProximoMes: 0,
    enviosPendentes: 0,
    enviosRealizados: 0,
    enviosEmTransito: 0,
    aniversariantesHoje: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentBirthdays, setRecentBirthdays] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const [colaboradoresRes, proximosRes, statsRes] = await Promise.all([
        api.get<ColaboradoresResponse>(endpoints.colaboradores + '?limit=1'),
        api.get(endpoints.colaboradoresProximos),
        api.get<EstatisticasEnvio>(endpoints.estatisticas),
      ]);

      // Filtrar colaboradores com aniversário nos próximos 30 dias
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Zera as horas para comparação apenas de data

      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const parseBrDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        const [dd, mm, yyyy] = parts.map(Number);
        if (!dd || !mm || !yyyy) return null;
        return new Date(yyyy, mm - 1, dd);
      };

      const upcomingBirthdays = proximosRes.data.filter((p: any) => {
        if (!p.data_nascimento || !p.nome_completo) return false;

        const birthday = parseBrDate(p.data_nascimento);
        if (!birthday) return false;

        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());

        // Verifica se o aniversário está dentro dos próximos 30 dias (considerando virada de ano)
        return (thisYearBirthday >= today && thisYearBirthday <= thirtyDaysFromNow) ||
               (nextYearBirthday >= today && nextYearBirthday <= thirtyDaysFromNow);
      }).sort((a: any, b: any) => {
        // Ordena por data mais próxima
        const dateA = parseBrDate(a.data_nascimento)!;
        const dateB = parseBrDate(b.data_nascimento)!;
        const birthdayA = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate());
        const birthdayB = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate());

        if (birthdayA < today) birthdayA.setFullYear(today.getFullYear() + 1);
        if (birthdayB < today) birthdayB.setFullYear(today.getFullYear() + 1);

        return birthdayA.getTime() - birthdayB.getTime();
      });

      const birthdaysToday = proximosRes.data.filter((p: any) => {
        if (!p.data_nascimento || !p.nome_completo) return false;
        const birthday = parseBrDate(p.data_nascimento);
        return birthday &&
          birthday.getDate() === today.getDate() &&
          birthday.getMonth() === today.getMonth();
      });

      setStats({
        totalColaboradores: colaboradoresRes.data.total,
        aniversariantesProximoMes: upcomingBirthdays.length,
        enviosPendentes: statsRes.data.porStatus?.PENDENTE || 0,
        enviosRealizados: statsRes.data.porStatus?.ENVIADO || 0,
        enviosEmTransito: 0,
        aniversariantesHoje: birthdaysToday.length,
      });

      setRecentBirthdays(upcomingBirthdays.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-beuni-text/70 mb-1">{title}</p>
        {isLoading ? (
          <div className="h-8 bg-beuni-orange-100 rounded animate-pulse w-20"></div>
        ) : (
          <p className="text-3xl font-bold text-beuni-text">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Welcome Banner */}
        <div className="mb-8 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-white/5 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-3">
              <Gift className="h-8 w-8 mr-3" />
              <h1 className="text-3xl font-bold">Dashboard Beuni</h1>
            </div>
            <p className="text-beuni-orange-100 text-lg mb-4">
              Bem-vindo! Gerencie aniversários e envios de brindes em um só lugar.
            </p>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="text-sm font-medium">📅 {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Colaboradores"
            value={stats.totalColaboradores}
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="Aniversários Próximo Mês"
            value={stats.aniversariantesProximoMes}
            icon={Calendar}
            color="bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600"
          />
          <StatCard
            title="Envios Pendentes"
            value={stats.enviosPendentes}
            icon={Clock}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <StatCard
            title="Envios Realizados"
            value={stats.enviosRealizados}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend="up"
            trendValue="+8%"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Próximos Aniversariantes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-beuni-orange-600 mr-2" />
                  <h2 className="text-xl font-bold text-beuni-text">Próximos Aniversariantes</h2>
                </div>
                <button
                  onClick={() => router.push('/calendario')}
                  className="text-sm font-medium text-beuni-orange-600 hover:text-beuni-orange-700 flex items-center"
                >
                  Ver todos
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-4 bg-beuni-cream rounded-xl animate-pulse">
                      <div className="w-12 h-12 bg-beuni-orange-200 rounded-full"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-beuni-orange-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-beuni-orange-100 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentBirthdays.length > 0 ? (
                <div className="space-y-3">
                  {recentBirthdays.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center p-4 bg-beuni-cream hover:bg-beuni-orange-50 rounded-xl transition-colors cursor-pointer"
                      onClick={() => router.push(`/colaboradores/editar/${person.id}`)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        {person.nome ? person.nome.charAt(0) : '?'}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-beuni-text">{person.nome || 'Nome não disponível'}</p>
                        <p className="text-sm text-beuni-text/60">
                          {person.data_nascimento ? new Date(person.data_nascimento).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : 'Data não disponível'}
                        </p>
                      </div>
                      <div className="text-2xl">🎂</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-beuni-text/30 mx-auto mb-3" />
                  <p className="text-beuni-text/60">Nenhum aniversariante próximo</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Aniversariantes Hoje */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center mb-3">
                <Gift className="h-6 w-6 mr-2" />
                <h3 className="font-bold text-lg">Hoje</h3>
              </div>
              <p className="text-4xl font-bold mb-2">{stats.aniversariantesHoje}</p>
              <p className="text-purple-100 text-sm">Aniversariantes hoje 🎉</p>
            </div>

            {/* Envios em Trânsito */}
            <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
              <div className="flex items-center mb-3">
                <Package className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="font-bold text-beuni-text">Em Trânsito</h3>
              </div>
              <p className="text-3xl font-bold text-beuni-text mb-2">{stats.enviosEmTransito}</p>
              <p className="text-sm text-beuni-text/60">Brindes em transporte</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
          <h2 className="text-xl font-bold text-beuni-text mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/colaboradores/novo')}
              className="flex items-center p-4 bg-beuni-cream hover:bg-beuni-orange-50 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 text-left">
                <p className="font-semibold text-beuni-text text-sm">Novo Colaborador</p>
                <p className="text-xs text-beuni-text/60">Adicionar ao sistema</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/colaboradores')}
              className="flex items-center p-4 bg-beuni-cream hover:bg-beuni-orange-50 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 text-left">
                <p className="font-semibold text-beuni-text text-sm">Ver Colaboradores</p>
                <p className="text-xs text-beuni-text/60">Lista completa</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/calendario')}
              className="flex items-center p-4 bg-beuni-cream hover:bg-beuni-orange-50 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 text-left">
                <p className="font-semibold text-beuni-text text-sm">Calendário</p>
                <p className="text-xs text-beuni-text/60">Visualizar datas</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/envios')}
              className="flex items-center p-4 bg-beuni-cream hover:bg-beuni-orange-50 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 text-left">
                <p className="font-semibold text-beuni-text text-sm">Controlar Envios</p>
                <p className="text-xs text-beuni-text/60">Gerenciar entregas</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
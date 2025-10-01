import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Bell,
  BellRing,
  Calendar,
  Gift,
  Users,
  Check,
  Archive,
  Trash2,
  MoreVertical,
  AlertCircle,
  Clock,
  Filter,
  Search
} from 'lucide-react';

import Layout from '@/components/Layout';
import api, { endpoints, getUser } from '@/lib/api';

interface Notification {
  id: string;
  tipo: 'aniversario' | 'envio' | 'sistema';
  titulo: string;
  descricao: string;
  dataEvento: string;
  dataNotificacao: string;
  lida: boolean;
  prioridade: 'baixa' | 'media' | 'alta';
  dadosColaborador?: {
    id: string;
    nome: string;
    dataAniversario: string;
    departamento: string;
  };
}

export default function NotificacoesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'nao-lidas' | 'aniversario' | 'envio' | 'sistema'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, searchTerm]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(endpoints.notificacoes);
      setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Aplicar filtro por tipo
    if (filter === 'nao-lidas') {
      filtered = filtered.filter(n => !n.lida);
    } else if (filter !== 'todos') {
      filtered = filtered.filter(n => n.tipo === filter);
    }

    // Aplicar busca por texto
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(n =>
        n.titulo.toLowerCase().includes(searchLower) ||
        n.descricao.toLowerCase().includes(searchLower) ||
        (n.dadosColaborador?.nome.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar por data de notificação (mais recentes primeiro)
    filtered.sort((a, b) => new Date(b.dataNotificacao).getTime() - new Date(a.dataNotificacao).getTime());

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.post(endpoints.marcarNotificacaoLida(notificationId));
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lida: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post(endpoints.marcarTodasNotificacoesLidas);
      setNotifications(prev => 
        prev.map(n => ({ ...n, lida: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    // Por enquanto, apenas remover localmente
    // Em uma implementação real, faria uma chamada para deletar no backend
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (tipo: string, prioridade: string) => {
    const iconClass = prioridade === 'alta' ? 'text-red-600' : 
                     prioridade === 'media' ? 'text-yellow-600' : 'text-blue-600';
    
    switch (tipo) {
      case 'aniversario':
        return <Calendar className={`h-5 w-5 ${iconClass}`} />;
      case 'envio':
        return <Gift className={`h-5 w-5 ${iconClass}`} />;
      case 'sistema':
        return <AlertCircle className={`h-5 w-5 ${iconClass}`} />;
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-white/5 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BellRing className="h-8 w-8 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold">Notificações</h1>
                  <p className="text-purple-100 text-lg mt-1">
                    Acompanhe aniversários e atualizações do sistema
                  </p>
                </div>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="text-sm font-medium">
                  {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-beuni-text/60" />
              <input
                type="text"
                placeholder="Buscar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-beuni-orange-200 rounded-xl focus:ring-2 focus:ring-beuni-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'todos', label: 'Todos', icon: Bell },
                { key: 'nao-lidas', label: 'Não lidas', icon: BellRing },
                { key: 'aniversario', label: 'Aniversários', icon: Calendar },
                { key: 'envio', label: 'Envios', icon: Gift },
                { key: 'sistema', label: 'Sistema', icon: AlertCircle }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-beuni-orange-500 text-white'
                      : 'bg-beuni-cream text-beuni-text hover:bg-beuni-orange-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center px-4 py-2 bg-beuni-orange-500 text-white rounded-lg hover:bg-beuni-orange-600 transition-colors text-sm font-medium"
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-beuni-orange-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-beuni-orange-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-beuni-orange-100 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-beuni-orange-100 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                  notification.lida 
                    ? 'border-beuni-orange-100' 
                    : 'border-beuni-orange-200 ring-2 ring-beuni-orange-100'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      notification.prioridade === 'alta' ? 'bg-red-100' :
                      notification.prioridade === 'media' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {getNotificationIcon(notification.tipo, notification.prioridade)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold text-beuni-text ${!notification.lida ? 'font-bold' : ''}`}>
                          {notification.titulo}
                        </h3>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-beuni-text/60 whitespace-nowrap">
                            {formatRelativeTime(notification.dataNotificacao)}
                          </span>
                          <div className="relative">
                            <button className="p-1 hover:bg-beuni-orange-100 rounded transition-colors">
                              <MoreVertical className="h-4 w-4 text-beuni-text/60" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-beuni-text/70 mb-3 leading-relaxed">
                        {notification.descricao}
                      </p>

                      {/* Colaborador info para notificações de aniversário */}
                      {notification.dadosColaborador && (
                        <div className="bg-beuni-cream p-3 rounded-xl mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {notification.dadosColaborador.nome.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-beuni-text text-sm">
                                {notification.dadosColaborador.nome}
                              </p>
                              <p className="text-xs text-beuni-text/60">
                                {notification.dadosColaborador.departamento} • Aniversário: {notification.dadosColaborador.dataAniversario}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.lida && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex items-center px-3 py-1 bg-beuni-orange-100 text-beuni-orange-700 rounded-lg hover:bg-beuni-orange-200 transition-colors text-sm"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar como lida
                          </button>
                        )}
                        
                        {notification.dadosColaborador && (
                          <button
                            onClick={() => router.push(`/colaboradores/editar/${notification.dadosColaborador!.id}`)}
                            className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Ver colaborador
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-12 text-center">
              <Bell className="h-16 w-16 text-beuni-text/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-beuni-text mb-2">
                {filter === 'todos' ? 'Nenhuma notificação' : `Nenhuma notificação ${filter === 'nao-lidas' ? 'não lida' : `do tipo "${filter}"`}`}
              </h3>
              <p className="text-beuni-text/60 mb-6">
                {filter === 'todos' 
                  ? 'Você está em dia! Não há notificações no momento.'
                  : 'Tente ajustar os filtros para ver outras notificações.'
                }
              </p>
              {filter !== 'todos' && (
                <button
                  onClick={() => setFilter('todos')}
                  className="px-4 py-2 bg-beuni-orange-500 text-white rounded-lg hover:bg-beuni-orange-600 transition-colors"
                >
                  Ver todas as notificações
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
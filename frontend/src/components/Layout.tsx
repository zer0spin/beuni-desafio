import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import {
  Gift,
  LayoutDashboard,
  Users,
  Calendar,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getUser, removeAuthToken } from '@/lib/api';
import api, { endpoints } from '@/lib/api';
import type { User } from '@/types';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Carregar notificações da API
    loadNotifications();
    loadUnreadCount();

    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadCount();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  const loadNotifications = async () => {
    try {
      const response = await api.get(`${endpoints.notificacoes}?limit=5`);
      setNotifications(response.data.slice(0, 5)); // Apenas as 5 mais recentes para o popup
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.get(endpoints.notificacoesNaoLidas);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erro ao carregar contador de notificações:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post(endpoints.marcarTodasNotificacoesLidas);
      setNotifications(notifications.map(n => ({ ...n, lida: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'aniversario':
        return <Gift className="h-5 w-5 text-beuni-orange-500" />;
      case 'envio':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'sistema':
        return <BarChart3 className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
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

  const handleLogout = () => {
    removeAuthToken();
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Colaboradores', href: '/colaboradores', icon: Users },
    { name: 'Calendário', href: '/calendario', icon: Calendar },
    { name: 'Catálogo', href: '/catalogo', icon: Gift },
    { name: 'Envios', href: '/envios', icon: Package },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beuni-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beuni-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beuni-cream flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-beuni-orange-100 transition-all duration-300 ${
          sidebarOpen ? 'lg:w-64' : 'lg:w-20'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-beuni-orange-100">
            {sidebarOpen ? (
              <img
                src="/images/logos/logo-beuni.png"
                alt="Beuni Logo"
                className="h-8 w-auto"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 mx-auto">
                <Gift className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white shadow-md'
                      : 'text-beuni-text/70 hover:bg-beuni-orange-50 hover:text-beuni-orange-600'
                  }`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${!sidebarOpen && 'mx-auto'}`} />
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="flex-shrink-0 border-t border-beuni-orange-100 p-4">
            {sidebarOpen ? (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.nome.charAt(0)}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-beuni-text truncate">
                    {user.nome}
                  </p>
                  <p className="text-xs text-beuni-text/60 truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-beuni-text/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full p-2 text-beuni-text/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5 mx-auto" />
              </button>
            )}
          </div>

          {/* Toggle Sidebar Button */}
          <div className="border-t border-beuni-orange-100 p-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full p-2 text-beuni-text/60 hover:text-beuni-orange-600 hover:bg-beuni-orange-50 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 mx-auto" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-beuni-orange-100">
                <img
                  src="/images/logos/logo-beuni.png"
                  alt="Beuni Logo"
                  className="h-8 w-auto"
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-beuni-text/60 hover:bg-beuni-orange-50 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white shadow-md'
                          : 'text-beuni-text/70 hover:bg-beuni-orange-50 hover:text-beuni-orange-600'
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="ml-3">{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User Section */}
              <div className="border-t border-beuni-orange-100 p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.nome.charAt(0)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-beuni-text">{user.nome}</p>
                    <p className="text-xs text-beuni-text/60">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Sair</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-beuni-orange-100 sticky top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-beuni-text/60 hover:bg-beuni-orange-50 rounded-lg"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Organization Name - Destaque Maior */}
              <div className="hidden lg:block">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-beuni-cream to-beuni-orange-50 px-5 py-2.5 rounded-xl border border-beuni-orange-200 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 rounded-lg flex items-center justify-center shadow-md">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-beuni-text/60 font-semibold uppercase tracking-wide">Organização</p>
                    <p className="text-base font-bold text-beuni-text">{user.organizacao.nome}</p>
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-2">
                <button className="p-2 text-beuni-text/60 hover:text-beuni-orange-500 hover:bg-beuni-orange-50 rounded-xl transition-colors">
                  <Search className="h-5 w-5" />
                </button>

                {/* Notifications Button */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-beuni-text/60 hover:text-beuni-orange-500 hover:bg-beuni-orange-50 rounded-xl transition-colors relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popup */}
                  {notificationsOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setNotificationsOpen(false)}
                      />

                      {/* Popup */}
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-beuni-orange-100 z-50 max-h-[500px] flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-beuni-orange-100 bg-gradient-to-r from-beuni-cream to-beuni-orange-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Bell className="h-5 w-5 text-beuni-orange-600" />
                              <h3 className="text-lg font-bold text-beuni-text">Notificações</h3>
                              {unreadCount > 0 && (
                                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => setNotificationsOpen(false)}
                              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                            >
                              <X className="h-5 w-5 text-beuni-text/60" />
                            </button>
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="mt-2 text-sm text-beuni-orange-600 hover:text-beuni-orange-700 font-semibold"
                            >
                              Marcar todas como lidas
                            </button>
                          )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="h-12 w-12 text-beuni-text/30 mx-auto mb-3" />
                              <p className="text-beuni-text/60 font-medium">Nenhuma notificação</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-beuni-orange-100">
                              {notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`p-4 hover:bg-beuni-cream/50 transition-colors cursor-pointer ${
                                    !notification.lida ? 'bg-beuni-orange-50/30' : ''
                                  }`}
                                  onClick={() => {
                                    // Navegar ou executar ação baseada no tipo
                                    if (notification.tipo === 'aniversario') {
                                      router.push('/calendario');
                                    } else if (notification.tipo === 'envio') {
                                      router.push('/envios');
                                    } else if (notification.tipo === 'sistema') {
                                      router.push('/relatorios');
                                    }
                                    setNotificationsOpen(false);
                                  }}
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                      {getNotificationIcon(notification.tipo)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-bold text-beuni-text">
                                          {notification.titulo}
                                        </p>
                                        {!notification.lida && (
                                          <span className="h-2 w-2 bg-beuni-orange-500 rounded-full flex-shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-sm text-beuni-text/70 mb-1">
                                        {notification.descricao}
                                      </p>
                                      <p className="text-xs text-beuni-text/50 font-medium">
                                        {formatRelativeTime(notification.dataNotificacao)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="px-6 py-3 border-t border-beuni-orange-100 bg-beuni-cream/30">
                            <button
                              onClick={() => {
                                router.push('/notificacoes');
                                setNotificationsOpen(false);
                              }}
                              className="w-full text-center text-sm font-semibold text-beuni-orange-600 hover:text-beuni-orange-700 transition-colors"
                            >
                              Ver todas as notificações
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => router.push('/configuracoes')}
                  className="p-2 text-beuni-text/60 hover:text-beuni-orange-500 hover:bg-beuni-orange-50 rounded-xl transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
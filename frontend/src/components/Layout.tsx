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
import type { User } from '@/types';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleLogout = () => {
    removeAuthToken();
    toast.success('Logout realizado com sucesso!');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Colaboradores', href: '/colaboradores', icon: Users },
    { name: 'Calendário', href: '/calendario', icon: Calendar },
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Gift className="h-6 w-6 text-white" />
              </div>
              {sidebarOpen && (
                <span className="text-xl font-bold text-beuni-text">beuni</span>
              )}
            </div>
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
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-beuni-text">beuni</span>
                </div>
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

              {/* Organization Name */}
              <div className="hidden lg:block">
                <p className="text-sm text-beuni-text/70">
                  <span className="font-semibold text-beuni-text">{user.organizacao.nome}</span>
                </p>
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-2">
                <button className="p-2 text-beuni-text/60 hover:text-beuni-orange-500 hover:bg-beuni-orange-50 rounded-xl transition-colors">
                  <Search className="h-5 w-5" />
                </button>
                <button className="p-2 text-beuni-text/60 hover:text-beuni-orange-500 hover:bg-beuni-orange-50 rounded-xl transition-colors relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-beuni-orange-500 rounded-full"></span>
                </button>
                <button className="p-2 text-beuni-text/60 hover:text-beuni-orange-500 hover:bg-beuni-orange-50 rounded-xl transition-colors">
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
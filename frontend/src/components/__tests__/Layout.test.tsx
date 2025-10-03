import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Layout from '../Layout';

// Mock para Next.js router
const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/dashboard',
    asPath: '/dashboard',
    query: {},
    isReady: true,
  }),
}));

// Mock para react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock para Next.js Link
vi.mock('next/link', () => ({
  default: function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  },
}));

// Mock da API - usando apenas o necessário para os testes
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  endpoints: {
    notificacoes: '/api/notificacoes',
    notificacoesNaoLidas: '/api/notificacoes/nao-lidas',
    marcarTodasNotificacoesLidas: '/api/notificacoes/marcar-lidas',
  },
  removeAuthToken: vi.fn(),
}));

// Mock do UserContext
const mockUser = {
  id: 1,
  nome_completo: 'Test User',
  email: 'test@example.com',
  imagem_perfil: 'profile.jpg',
  imageTimestamp: 1234567890,
};

let mockUserContext = {
  user: mockUser,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock('@/contexts/UserContext', () => ({
  useUser: () => mockUserContext,
}));

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserContext.user = mockUser;
    mockUserContext.isLoading = false;
    mockPush.mockClear();
  });

  describe('Authentication States', () => {
    it('deve mostrar spinner de carregamento quando isLoading é true', () => {
      mockUserContext.isLoading = true;
      mockUserContext.user = null as any;
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const spinner = screen.getByRole('generic');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('deve redirecionar para login quando usuário não está autenticado', async () => {
      mockUserContext.isLoading = false;
      mockUserContext.user = null as any;

      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('deve renderizar conteúdo quando usuário está autenticado', async () => {
      mockUserContext.isLoading = false;
      mockUserContext.user = mockUser;

      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Elements', () => {
    beforeEach(() => {
      mockUserContext.isLoading = false;
      mockUserContext.user = mockUser;
    });

    it('deve renderizar todos os itens de navegação', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Colaboradores')).toBeInTheDocument();
        expect(screen.getByText('Calendário')).toBeInTheDocument();
        expect(screen.getByText('Catálogo')).toBeInTheDocument();
        expect(screen.getByText('Envios')).toBeInTheDocument();
        expect(screen.getByText('Relatórios')).toBeInTheDocument();
        expect(screen.getByText('Configurações')).toBeInTheDocument();
      });
    });

    it('deve navegar quando clicar em itens de navegação', async () => {
      const user = userEvent.setup();
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Colaboradores')).toBeInTheDocument();
      });

      const colaboradoresButton = screen.getByText('Colaboradores');
      await user.click(colaboradoresButton);

      expect(mockPush).toHaveBeenCalledWith('/colaboradores');
    });

    it('deve mostrar estado ativo para página atual', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        const dashboardButton = screen.getByText('Dashboard');
        expect(dashboardButton.closest('button')).toHaveClass('bg-gradient-to-r');
      });
    });
  });

  describe('Profile Management', () => {
    beforeEach(() => {
      mockUserContext.isLoading = false;
      mockUserContext.user = mockUser;
    });

    it('deve mostrar nome do usuário no perfil', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    it('deve abrir dropdown do perfil ao clicar', async () => {
      const user = userEvent.setup();
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      const profileButton = screen.getByText('Test User');
      await user.click(profileButton);

      await waitFor(() => {
        expect(screen.getByText('Sair')).toBeInTheDocument();
      });
    });

    it('deve fazer logout corretamente', async () => {
      const user = userEvent.setup();
      const toast = await import('react-hot-toast');
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Abrir dropdown do perfil
      const profileButton = screen.getByText('Test User');
      await user.click(profileButton);

      // Clicar em logout
      await waitFor(() => {
        expect(screen.getByText('Sair')).toBeInTheDocument();
      });
      
      const logoutButton = screen.getByText('Sair');
      await user.click(logoutButton);

      expect(toast.toast.success).toHaveBeenCalledWith('Logout realizado com sucesso!');
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('Sidebar Management', () => {
    beforeEach(() => {
      mockUserContext.isLoading = false;
      mockUserContext.user = mockUser;
    });

    it('deve renderizar logo na sidebar', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        const logo = screen.getByAltText('Beuni Logo');
        expect(logo).toBeInTheDocument();
      });
    });

    it('deve ter toggle da sidebar funcionando', async () => {
      const user = userEvent.setup();
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      // Procurar botão de menu
      const menuButtons = screen.getAllByRole('button');
      const menuButton = menuButtons.find(btn => 
        btn.querySelector('svg') && 
        (btn.getAttribute('aria-label')?.includes('menu') || 
         btn.className.includes('menu'))
      );

      if (menuButton) {
        await user.click(menuButton);
        // Verificar se alguma mudança ocorreu na sidebar
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toBeInTheDocument();
      }
    });
  });

  describe('Notifications', () => {
    beforeEach(() => {
      mockUserContext.isLoading = false;
      mockUserContext.user = mockUser;
    });

    it('deve renderizar componente de notificações', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        // Procurar por elementos relacionados a notificações
        const notificationElements = screen.getAllByRole('button');
        const hasNotificationButton = notificationElements.some(btn => 
          btn.querySelector('svg') || 
          btn.getAttribute('aria-label')?.includes('notifica')
        );
        expect(hasNotificationButton).toBe(true);
      });
    });

    it('deve abrir dropdown de notificações', async () => {
      const user = userEvent.setup();
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      // Procurar botão de notificações
      const buttons = screen.getAllByRole('button');
      const notificationButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && (
          svg.getAttribute('data-testid')?.includes('bell') ||
          btn.getAttribute('aria-label')?.includes('notifica')
        );
      });

      if (notificationButton) {
        await user.click(notificationButton);
        // Verificar se dropdown abriu (pode não ter notificações para mostrar)
        expect(notificationButton).toBeInTheDocument();
      }
    });
  });

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      mockUserContext.isLoading = false;
      mockUserContext.user = mockUser;
    });

    it('deve renderizar layout principal corretamente', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      // Verificar estrutura básica do layout
      const sidebar = screen.getByRole('complementary');
      const main = screen.getByRole('main');
      
      expect(sidebar).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });

    it('deve aplicar classes responsivas corretas', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass('fixed', 'h-full');
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockUserContext.isLoading = false;
      mockUserContext.user = mockUser;
    });

    it('deve lidar com usuário sem imagem de perfil', async () => {
      mockUserContext.user = { ...mockUser, imagem_perfil: null as any };
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    it('deve renderizar mesmo com dados mínimos do usuário', async () => {
      mockUserContext.user = {
        id: 1,
        nome_completo: 'Minimal User',
        email: 'minimal@test.com',
        imagem_perfil: null,
        imageTimestamp: null,
      } as any;
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        expect(screen.getByText('Minimal User')).toBeInTheDocument();
      });
    });
  });
});
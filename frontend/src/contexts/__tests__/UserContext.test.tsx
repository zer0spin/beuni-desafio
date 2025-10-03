import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserProvider, useUser } from '@/contexts/UserContext';

// Mock da API
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock('@/lib/api', () => ({
  default: mockApi,
  endpoints: {
    auth: '/api/auth',
    authCheck: '/api/auth/check',
  },
  removeAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
}));

// Mock do router Next.js
const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    asPath: '/',
    query: {},
    isReady: true,
  }),
}));

// Mock do react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Componente de teste para usar o hook
function TestComponent() {
  const { user, isLoading, login, logout } = useUser();

  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button
        data-testid="login-btn"
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Estado Inicial', () => {
    it('deve ter estado inicial correto', () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('deve verificar autenticação no mount', async () => {
      const mockUser = {
        id: 1,
        nome_completo: 'Test User',
        email: 'test@example.com',
        imagem_perfil: 'profile.jpg',
      };

      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/auth/check');
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('deve lidar com usuário não autenticado no check inicial', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Unauthorized'));

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });
  });

  describe('Funcionalidade de Login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 1,
        nome_completo: 'Test User',
        email: 'test@example.com',
        imagem_perfil: 'profile.jpg',
      };

      mockApi.post.mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: 'fake-jwt-token',
        },
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const loginButton = screen.getByTestId('login-btn');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/api/auth', {
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });
    });

    it('deve tratar erro de login com credenciais inválidas', async () => {
      const user = userEvent.setup();
      const toast = await import('react-hot-toast');

      mockApi.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Credenciais inválidas' },
        },
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const loginButton = screen.getByTestId('login-btn');
      await user.click(loginButton);

      await waitFor(() => {
        expect(toast.toast.error).toHaveBeenCalledWith('Credenciais inválidas');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('deve tratar erro de rede durante login', async () => {
      const user = userEvent.setup();
      const toast = await import('react-hot-toast');

      mockApi.post.mockRejectedValueOnce(new Error('Network Error'));

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const loginButton = screen.getByTestId('login-btn');
      await user.click(loginButton);

      await waitFor(() => {
        expect(toast.toast.error).toHaveBeenCalledWith(
          'Erro ao fazer login. Tente novamente.'
        );
      });
    });

    it('deve mostrar loading durante processo de login', async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      mockApi.post.mockReturnValueOnce(loginPromise);

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const loginButton = screen.getByTestId('login-btn');
      await user.click(loginButton);

      // Durante o login, loading deve ser true
      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      // Resolver o login
      act(() => {
        resolveLogin!({
          data: {
            user: { id: 1, nome_completo: 'Test User', email: 'test@example.com' },
            token: 'fake-token',
          },
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });
  });

  describe('Funcionalidade de Logout', () => {
    it('deve fazer logout com sucesso', async () => {
      const user = userEvent.setup();
      const { removeAuthToken } = await import('@/lib/api');
      const toast = await import('react-hot-toast');

      // Setup inicial com usuário logado
      const mockUser = {
        id: 1,
        nome_completo: 'Test User',
        email: 'test@example.com',
      };

      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Aguardar usuário ser carregado
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      const logoutButton = screen.getByTestId('logout-btn');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(removeAuthToken).toHaveBeenCalled();
        expect(toast.toast.success).toHaveBeenCalledWith('Logout realizado com sucesso!');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });

      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('deve limpar localStorage no logout', async () => {
      const user = userEvent.setup();

      // Setup inicial com usuário logado
      mockApi.get.mockResolvedValueOnce({
        data: { id: 1, nome_completo: 'Test User', email: 'test@example.com' },
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const logoutButton = screen.getByTestId('logout-btn');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      });
    });
  });

  describe('Persistência de Sessão', () => {
    it('deve restaurar usuário do token salvo', async () => {
      window.localStorage.getItem = vi.fn().mockReturnValue('fake-saved-token');
      
      const mockUser = {
        id: 1,
        nome_completo: 'Saved User',
        email: 'saved@example.com',
      };

      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/api/auth/check');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });
    });

    it('deve lidar com token inválido salvo', async () => {
      window.localStorage.getItem = vi.fn().mockReturnValue('invalid-token');
      
      mockApi.get.mockRejectedValueOnce(new Error('Token invalid'));

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });
  });

  describe('Estados de Loading', () => {
    it('deve gerenciar estado de loading corretamente', async () => {
      let resolveCheck: (value: any) => void;
      const checkPromise = new Promise((resolve) => {
        resolveCheck = resolve;
      });

      mockApi.get.mockReturnValueOnce(checkPromise);

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Inicialmente loading deve ser true
      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      // Resolver o check
      act(() => {
        resolveCheck!({ data: null });
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('deve manter loading false após operações assíncronas', async () => {
      mockApi.get.mockResolvedValueOnce({ data: null });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Fazer múltiplas verificações para garantir que loading permanece false
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar erro 401 removendo token', async () => {
      const { removeAuthToken } = await import('@/lib/api');
      
      mockApi.get.mockRejectedValueOnce({
        response: { status: 401 },
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(removeAuthToken).toHaveBeenCalled();
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });

    it('deve tratar erro 403 removendo token', async () => {
      const { removeAuthToken } = await import('@/lib/api');
      
      mockApi.get.mockRejectedValueOnce({
        response: { status: 403 },
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(removeAuthToken).toHaveBeenCalled();
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });

    it('deve tratar erros de rede graciosamente', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockApi.get.mockRejectedValueOnce(new Error('Network Error'));

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Erro ao verificar autenticação:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
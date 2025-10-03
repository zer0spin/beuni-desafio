import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { getUser, setAuthToken } from '@/lib/api';

// Mock das funções da API sem variáveis externas
vi.mock('@/lib/api', () => ({
  getUser: vi.fn().mockReturnValue(null),
  setAuthToken: vi.fn(),
}));

const mockGetUser = vi.mocked(getUser);
const mockSetAuthToken = vi.mocked(setAuthToken);

// Componente de teste para usar o hook
function TestComponent() {
  const { user, isLoading, setUser, updateUser, refreshUser } = useUser();

  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button
        data-testid="set-user-btn"
        onClick={() => setUser({ 
          id: 1, 
          nome_completo: 'Test User', 
          email: 'test@example.com',
          imagemPerfil: 'profile.jpg' 
        })}
      >
        Set User
      </button>
      <button
        data-testid="update-user-btn"
        onClick={() => updateUser({ nome_completo: 'Updated User' })}
      >
        Update User
      </button>
      <button data-testid="refresh-btn" onClick={refreshUser}>
        Refresh
      </button>
      <button data-testid="clear-btn" onClick={() => setUser(null)}>
        Clear
      </button>
    </div>
  );
}

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockReturnValue(null);
    
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('Estado Inicial', () => {
    it('deve ter estado inicial correto', () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('deve carregar usuário do cookie no mount', () => {
      const mockUser = {
        id: 1,
        nome_completo: 'Test User',
        email: 'test@example.com',
        imagemPerfil: 'profile.jpg',
      };

      mockGetUser.mockReturnValue(mockUser);

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(mockGetUser).toHaveBeenCalled();
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('Funcionalidade de setUser', () => {
    it('deve permitir definir um usuário', async () => {
      const user = userEvent.setup();

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('null');

      const setUserButton = screen.getByTestId('set-user-btn');
      await user.click(setUserButton);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(
          JSON.stringify({
            id: 1,
            nome_completo: 'Test User',
            email: 'test@example.com',
            imagemPerfil: 'profile.jpg',
          })
        );
      });
    });

    it('deve permitir limpar o usuário', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 1,
        nome_completo: 'Test User',
        email: 'test@example.com',
      };

      mockGetUser.mockReturnValue(mockUser);

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));

      const clearButton = screen.getByTestId('clear-btn');
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });
  });

  describe('Funcionalidade de updateUser', () => {
    it('deve atualizar dados do usuário existente', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 1,
        nome_completo: 'Test User',
        email: 'test@example.com',
        imagemPerfil: 'profile.jpg',
      };

      mockGetUser.mockReturnValue(mockUser);

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));

      const updateButton = screen.getByTestId('update-user-btn');
      await user.click(updateButton);

      await waitFor(() => {
        const expectedUser = { ...mockUser, nome_completo: 'Updated User' };
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(expectedUser));
      });
    });

    it('não deve atualizar se não houver usuário', async () => {
      const user = userEvent.setup();

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('null');

      const updateButton = screen.getByTestId('update-user-btn');
      await user.click(updateButton);

      // O usuário deve permanecer null
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('Funcionalidade de refreshUser', () => {
    it('deve recarregar usuário do cookie', async () => {
      const user = userEvent.setup();
      const initialUser = {
        id: 1,
        nome_completo: 'Initial User',
        email: 'initial@example.com',
      };

      const refreshedUser = {
        id: 1,
        nome_completo: 'Refreshed User',
        email: 'refreshed@example.com',
      };

      mockGetUser.mockReturnValueOnce(initialUser);

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(initialUser));

      // Simular mudança no cookie
      mockGetUser.mockReturnValue(refreshedUser);

      const refreshButton = screen.getByTestId('refresh-btn');
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(refreshedUser));
      });
    });

    it('deve lidar com cookie inexistente no refresh', async () => {
      const user = userEvent.setup();
      const initialUser = {
        id: 1,
        nome_completo: 'Test User',
        email: 'test@example.com',
      };

      mockGetUser.mockReturnValueOnce(initialUser);

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(initialUser));

      // Simular remoção do cookie
      mockGetUser.mockReturnValue(null);

      const refreshButton = screen.getByTestId('refresh-btn');
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });
  });

  describe('Estados de Loading', () => {
    it('deve iniciar com loading false', () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Após o useEffect, loading deve ser false
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('deve manter loading false após operações', async () => {
      const user = userEvent.setup();

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('false');

      // Executar algumas operações
      const setUserButton = screen.getByTestId('set-user-btn');
      await user.click(setUserButton);

      const refreshButton = screen.getByTestId('refresh-btn');
      await user.click(refreshButton);

      // Loading deve permanecer false
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve lançar erro quando hook é usado fora do provider', () => {
      const TestComponentOutsideProvider = () => {
        try {
          useUser();
          return <div>Should not render</div>;
        } catch (error: any) {
          return <div data-testid="error">{error.message}</div>;
        }
      };

      render(<TestComponentOutsideProvider />);
      
      expect(screen.getByTestId('error')).toHaveTextContent(
        'useUser must be used within a UserProvider'
      );
    });
  });

  describe('Integração com Cookies', () => {
    it('deve funcionar corretamente com diferentes estados de cookie', () => {
      // Teste 1: Cookie vazio
      mockGetUser.mockReturnValue(null);
      
      const { unmount } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      unmount();

      // Teste 2: Cookie com usuário válido
      const validUser = {
        id: 2,
        nome_completo: 'Valid User',
        email: 'valid@example.com',
      };

      mockGetUser.mockReturnValue(validUser);

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(validUser));
    });
  });
});
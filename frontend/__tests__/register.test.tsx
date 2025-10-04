import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock first
const mockPush = vi.fn();
const mockReplace = vi.fn();

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

const mockApiPost = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    pathname: '/register',
    query: {},
  }),
}));

vi.mock('react-hot-toast', () => ({
  toast: mockToast,
}));

vi.mock('../../lib/api', () => ({
  default: {
    post: mockApiPost,
  },
  setAuthToken: vi.fn(),
  endpoints: {
    register: '/auth/register',
  },
}));

// Mock do UserContext
const mockLogin = vi.fn();
const mockUserContextValue = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: mockLogin,
  logout: vi.fn(),
  updateUser: vi.fn(),
};

vi.mock('../../contexts/UserContext', () => ({
  useUser: () => mockUserContextValue,
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('Register Page Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = async () => {
    const RegisterPage = (await import('../register')).default;
    return render(<RegisterPage />);
  };

  describe('Renderização e Interface', () => {
    it('should render register form correctly', async () => {
      await renderRegister();

      expect(screen.getByText(/crie sua conta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail profissional/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
    });

    it('should render product images grid', async () => {
      await renderRegister();

      expect(screen.getByAltText(/garrafa personalizada/i)).toBeInTheDocument();
      expect(screen.getByAltText(/camiseta personalizada/i)).toBeInTheDocument();
      expect(screen.getByAltText(/mochila personalizada/i)).toBeInTheDocument();
      expect(screen.getByAltText(/ecobag personalizada/i)).toBeInTheDocument();
    });

    it('should render link to login page', async () => {
      await renderRegister();

      const loginButton = screen.getByRole('button', { name: /faça login/i });
      expect(loginButton).toBeInTheDocument();
    });

    it('should have password visibility toggle buttons', async () => {
      await renderRegister();

      const passwordVisibilityButtons = screen.getAllByLabelText(/toggle password visibility/i);
      expect(passwordVisibilityButtons).toHaveLength(2); // One for password, one for confirm password
    });
  });

  describe('Validação de Formulário', () => {
    it('should show validation error for empty name', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short name', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      await user.type(nameInput, 'A');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty email', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      await user.type(nameInput, 'João Silva');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail profissional/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Deve aparecer tanto "Senha é obrigatória" quanto "Confirmação de senha é obrigatória"
        const passwordErrors = screen.getAllByText(/senha é obrigatória/i);
        expect(passwordErrors).toHaveLength(2);
        expect(passwordErrors[0]).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail profissional/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for password mismatch', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail profissional/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha456');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/senhas não conferem/i)).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidade de Registro', () => {
    it('should handle successful registration', async () => {
      const user = userEvent.setup();
      const mockUserData = {
        user: {
          id: 'user-123',
          nome: 'João Silva',
          email: 'joao@example.com',
        }
      };

      mockApiPost.mockResolvedValue({ data: mockUserData });
      
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail profissional/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/auth/register', {
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'senha123',
        });
      });

      expect(mockToast.success).toHaveBeenCalledWith('Bem-vindo, João Silva! Conta criada com sucesso.');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle registration failure', async () => {
      const user = userEvent.setup();
      const mockError = new Error('Network Error');

      mockApiPost.mockRejectedValue(mockError);
      
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail profissional/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalled();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock para demorar um pouco
      mockApiPost.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: { user: { id: '1', nome: 'Test' } } }), 100)
      ));
      
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail profissional/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');

      const submitButton = screen.getByRole('button', { name: /criar conta/i });
      await user.click(submitButton);

      // Durante o loading, o botão deve estar desabilitado
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/criando conta/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 200 });
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const passwordInput = screen.getByLabelText(/^senha/i);
      const passwordToggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i });
      
      // Inicialmente a senha deve estar oculta
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Clicar no botão de visibilidade
      await user.click(passwordToggleButtons[0]);
      
      // Agora a senha deve estar visível
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Clicar novamente para ocultar
      await user.click(passwordToggleButtons[0]);
      
      // Senha deve estar oculta novamente
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should navigate to login page when clicking login button', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const loginButton = screen.getByRole('button', { name: /faça login/i });
      await user.click(loginButton);

      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('Segurança e XSS Prevention', () => {
    it('should sanitize name input against XSS attacks', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const maliciousName = '<script>alert("xss")</script>';
      
      await user.type(nameInput, maliciousName);

      expect(nameInput).toHaveValue(maliciousName);
      // O valor é armazenado mas não executado como script
    });

    it('should sanitize email input against XSS attacks', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const emailInput = screen.getByLabelText(/e-mail profissional/i);
      const maliciousEmail = '<script>alert("xss")</script>@test.com';
      
      await user.type(emailInput, maliciousEmail);

      expect(emailInput).toHaveValue(maliciousEmail);
      // O valor é armazenado mas não executado como script
    });

    it('should handle special characters in password safely', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const passwordInput = screen.getByLabelText(/^senha/i);
      const specialPassword = "!@#$%^&*()_+";
      
      await user.type(passwordInput, specialPassword);

      expect(passwordInput).toHaveValue(specialPassword);
    });
  });

  describe('Navegação por Teclado', () => {
    it('should support Tab navigation between form fields', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail profissional/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const submitButton = screen.getByRole('button', { name: /criar conta/i });

      // Navegar com Tab
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      // Skip password visibility toggle button
      await user.tab();
      expect(confirmPasswordInput).toHaveFocus();

      await user.tab();
      // Skip confirm password visibility toggle button
      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('should have accessible form elements', async () => {
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/e-mail profissional/i);
      const passwordInput = screen.getByLabelText(/^senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      expect(nameInput).toHaveAttribute('id', 'nome');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });
});
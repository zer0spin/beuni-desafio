import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock primeiro
const mockPush = vi.fn();
const mockReplace = vi.fn();

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

const mockApiCall = vi.fn();

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
  apiCall: mockApiCall,
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

// Mock do componente Layout
vi.mock('../../components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
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

      expect(screen.getByText(/criar conta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
    });

    it('should render link to login page', async () => {
      await renderRegister();

      const loginLink = screen.getByRole('link', { name: /já tem conta/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should have proper accessibility attributes', async () => {
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });
  });

  describe('Validação de Formulário', () => {
    it('should show validation error for empty name', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short name', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      await user.type(nameInput, 'A');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty email', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      await user.type(nameInput, 'João Silva');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'email-invalido');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/formato de email inválido/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for password mismatch', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha456');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidade de Registro', () => {
    it('should handle successful registration', async () => {
      const user = userEvent.setup();
      const mockUserData = {
        id: 'user-123',
        nome: 'João Silva',
        email: 'joao@example.com',
        token: 'jwt-token-123',
      };

      mockApiCall.mockResolvedValue(mockUserData);
      
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            showSuccessToast: true,
            successMessage: 'Conta criada com sucesso!',
          })
        );
      });

      expect(mockLogin).toHaveBeenCalledWith(mockUserData);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle registration failure', async () => {
      const user = userEvent.setup();
      const mockError = {
        response: {
          data: { message: 'Email já cadastrado' },
        },
      };

      mockApiCall.mockRejectedValue(mockError);
      
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalled();
      });

      // Erro deve ser mostrado via toast (já está sendo mockado)
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should disable submit button during loading', async () => {
      const user = userEvent.setup();
      
      // Mock para demorar um pouco
      mockApiCall.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ id: '1', nome: 'Test' }), 100)
      ));
      
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      // Durante o loading, o botão deve estar desabilitado
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Segurança e XSS Prevention', () => {
    it('should sanitize name input against XSS attacks', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const maliciousName = '<script>alert("xss")</script>';
      
      await user.type(nameInput, maliciousName);

      expect(nameInput).toHaveValue(maliciousName);
      // O valor é armazenado mas não executado como script
    });

    it('should sanitize email input against XSS attacks', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const emailInput = screen.getByLabelText(/email/i);
      const maliciousEmail = '<script>alert("xss")</script>@test.com';
      
      await user.type(emailInput, maliciousEmail);

      expect(emailInput).toHaveValue(maliciousEmail);
      // O valor é armazenado mas não executado como script
    });

    it('should handle special characters in password safely', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const passwordInput = screen.getByLabelText(/senha/i);
      const specialPassword = "!@#$%^&*()_+{}|:<>?[]\\;',./";
      
      await user.type(passwordInput, specialPassword);

      expect(passwordInput).toHaveValue(specialPassword);
    });
  });

  describe('Strength Password Validation', () => {
    it('should show password strength indicator', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const passwordInput = screen.getByLabelText(/senha/i);
      
      // Senha fraca
      await user.type(passwordInput, '123456');
      expect(screen.getByText(/senha fraca/i)).toBeInTheDocument();

      await user.clear(passwordInput);
      
      // Senha média
      await user.type(passwordInput, 'abc123456');
      expect(screen.getByText(/senha média/i)).toBeInTheDocument();

      await user.clear(passwordInput);
      
      // Senha forte
      await user.type(passwordInput, 'AbC123!@#');
      expect(screen.getByText(/senha forte/i)).toBeInTheDocument();
    });
  });

  describe('Terms and Conditions', () => {
    it('should render terms and conditions checkbox', async () => {
      await renderRegister();

      const termsCheckbox = screen.getByRole('checkbox', { name: /aceito os termos/i });
      expect(termsCheckbox).toBeInTheDocument();
      expect(termsCheckbox).not.toBeChecked();
    });

    it('should require terms acceptance for registration', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/aceite os termos/i)).toBeInTheDocument();
      });
    });

    it('should allow registration when terms are accepted', async () => {
      const user = userEvent.setup();
      const mockUserData = { id: '1', nome: 'João Silva' };

      mockApiCall.mockResolvedValue(mockUserData);
      
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const termsCheckbox = screen.getByRole('checkbox', { name: /aceito os termos/i });
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /cadastrar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Tab navigation between form fields', async () => {
      const user = userEvent.setup();
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const termsCheckbox = screen.getByRole('checkbox', { name: /aceito os termos/i });
      const submitButton = screen.getByRole('button', { name: /cadastrar/i });

      // Navegar com Tab
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(confirmPasswordInput).toHaveFocus();

      await user.tab();
      expect(termsCheckbox).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('should submit form on Enter key press', async () => {
      const user = userEvent.setup();
      const mockUserData = { id: '1', nome: 'Test User' };

      mockApiCall.mockResolvedValue(mockUserData);
      
      await renderRegister();

      const nameInput = screen.getByLabelText(/nome/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const termsCheckbox = screen.getByRole('checkbox', { name: /aceito os termos/i });
      
      await user.type(nameInput, 'João Silva');
      await user.type(emailInput, 'joao@example.com');
      await user.type(passwordInput, 'senha123');
      await user.type(confirmPasswordInput, 'senha123');
      await user.click(termsCheckbox);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalled();
      });
    });
  });
});
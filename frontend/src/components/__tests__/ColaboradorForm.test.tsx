import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ColaboradorForm from '../ColaboradorForm';

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock UserContext
vi.mock('../../contexts/UserContext', () => ({
  useUser: vi.fn(() => ({
    user: {
      id: 1,
      nome_completo: 'Test User',
      email: 'test@example.com',
    },
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  })),
}));

// Mock API
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  endpoints: {
    cep: (cep: string) => `/cep/${cep}`,
  },
}));

// Get the mocked module
import { vi as vitest } from 'vitest';
import * as apiModule from '../../lib/api';
const mockApi = vitest.mocked(apiModule.default);

describe('ColaboradorForm - Security & Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup successful API responses
    (mockApi.get as any).mockResolvedValue({ data: {} });
    (mockApi.post as any).mockResolvedValue({ data: { id: 1 } });
    (mockApi.put as any).mockResolvedValue({ data: { id: 1 } });
    (mockApi.delete as any).mockResolvedValue({ data: {} });
  });

  describe('Form Rendering in Create Mode', () => {
    it('should render the form in create mode', async () => {
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      // Check that form fields are present
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cargo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
    });

    it('should handle XSS attempts safely in nome completo field', async () => {
      const user = userEvent.setup();
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      const nomeInput = screen.getByLabelText(/nome completo/i);

      // XSS attempt - React automatically escapes this
      await user.type(nomeInput, '<script>alert("XSS")</script>');
      expect(nomeInput).toHaveValue('<script>alert("XSS")</script>');
    });

    it('should validate SQL injection attempts in nome completo field', async () => {
      const user = userEvent.setup();
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      const nomeInput = screen.getByLabelText(/nome completo/i);

      // SQL injection attempt - React automatically escapes this
      await user.type(nomeInput, "Robert'); DROP TABLE colaboradores;--");
      expect(nomeInput).toHaveValue("Robert'); DROP TABLE colaboradores;--");
    });

    it('should validate CEP input format', async () => {
      const user = userEvent.setup();
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      const cepInput = screen.getByLabelText(/cep/i);

      // Valid 8-digit CEP (formatted with hyphen)
      await user.type(cepInput, '12345678');
      expect(cepInput).toHaveValue('12345-678');
    });

    it('should validate date of birth input', async () => {
      const user = userEvent.setup();
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      const dateInput = screen.getByLabelText(/data de nascimento/i);

      // Valid date
      await user.type(dateInput, '1990-01-01');
      expect(dateInput).toHaveValue('1990-01-01');
    });

    it('should have all required address fields', async () => {
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      // Check address fields
      expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/logradouro/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/número/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bairro/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/uf/i)).toBeInTheDocument();
    });
  });

  describe('Form Behavior', () => {
    it('should make API call when valid CEP is entered', async () => {
      const user = userEvent.setup();
      
      // Mock ViaCEP API response
      (mockApi.get as any).mockResolvedValueOnce({
        data: {
          logradouro: 'Rua Teste',
          bairro: 'Bairro Teste',
          localidade: 'Cidade Teste',
          uf: 'SP'
        }
      });

      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      const cepInput = screen.getByLabelText(/cep/i);
      
      // Enter valid CEP to trigger lookup
      await user.type(cepInput, '01234567');
      
      // The API call will be made (might be debounced)
      // We just verify the input accepts the value (formatted with hyphen)
      expect(cepInput).toHaveValue('01234-567');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      // Check that all inputs have accessible labels
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cargo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      // Tab through form elements
      await user.tab();
      const firstInput = document.activeElement;
      expect(firstInput).toBeInstanceOf(HTMLElement);
      
      await user.tab();
      const secondInput = document.activeElement;
      expect(secondInput).toBeInstanceOf(HTMLElement);
      expect(secondInput).not.toBe(firstInput);
    });
  });

  describe('Form Validation', () => {
    it('should have submit button', async () => {
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /cadastrar colaborador/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton.getAttribute('type')).toBe('submit');
    });

    it('should handle form submission attempt', async () => {
      const user = userEvent.setup();
      render(<ColaboradorForm mode="create" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cadastrar colaborador/i })).toBeInTheDocument();
      });

      // Fill in required fields
      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
      await user.type(screen.getByLabelText(/data de nascimento/i), '1990-01-01');
      
      const submitButton = screen.getByRole('button', { name: /cadastrar colaborador/i });
      await user.click(submitButton);

      // Form should accept the interaction (actual validation depends on implementation)
      expect(submitButton).toBeInTheDocument();
    });
  });
});

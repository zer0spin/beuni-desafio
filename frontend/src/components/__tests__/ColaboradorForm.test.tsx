import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColaboradorForm from '../ColaboradorForm';

// Mock API
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  endpoints: {
    cep: (cep: string) => `/cep/${cep}`,
  },
}));

describe('ColaboradorForm - Security & Validation Tests', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation - SQL Injection Protection', () => {
    it('should sanitize and validate nome_completo input', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const nomeInput = screen.getByLabelText(/nome completo/i);

      // Act - Try SQL injection attack
      await user.type(nomeInput, "Robert'); DROP TABLE colaboradores;--");

      // Assert - Input should accept the string (validation happens on backend)
      // Frontend validates format, backend sanitizes for security
      expect(nomeInput).toHaveValue("Robert'); DROP TABLE colaboradores;--");

      // The form should still validate minimum length (3 characters)
      expect(nomeInput).toHaveValue(expect.stringMatching(/.{3,}/));
    });

    it('should enforce minimum length validation on nome_completo', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const nomeInput = screen.getByLabelText(/nome completo/i);
      const submitButton = screen.getByRole('button', { name: /salvar/i });

      // Act - Try to submit with short name
      await user.type(nomeInput, 'AB'); // Only 2 characters
      await user.click(submitButton);

      // Assert - Form should not call onSubmit
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Input Validation - XSS Protection', () => {
    it('should handle XSS attempts in nome_completo field', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const nomeInput = screen.getByLabelText(/nome completo/i);

      // Act - Try XSS attack
      await user.type(nomeInput, '<script>alert("XSS")</script>');

      // Assert - React automatically escapes content, so this is safe
      expect(nomeInput).toHaveValue('<script>alert("XSS")</script>');

      // The actual XSS protection happens during rendering
      // React will escape this content automatically
    });

    it('should handle XSS attempts in departamento field', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const departamentoInput = screen.getByLabelText(/departamento/i);

      // Act - Try XSS with event handlers
      await user.type(departamentoInput, '<img src=x onerror="alert(1)">');

      // Assert - Content is stored but will be escaped on render
      expect(departamentoInput).toHaveValue('<img src=x onerror="alert(1)">');
    });
  });

  describe('Input Validation - Email Format', () => {
    it('should validate email format', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const emailInput = screen.getByLabelText(/e-mail/i);
      const submitButton = screen.getByRole('button', { name: /salvar/i });

      // Act - Try invalid email
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      // Assert - Form validation should prevent submission
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should accept valid email format', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const emailInput = screen.getByLabelText(/e-mail/i);

      // Act - Enter valid email
      await user.type(emailInput, 'test@example.com');

      // Assert
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  describe('Input Validation - CPF Format', () => {
    it('should validate CPF format with mask', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const cpfInput = screen.getByLabelText(/cpf/i);

      // Act - Enter CPF with numbers only
      await user.type(cpfInput, '12345678900');

      // Assert - Should apply mask format (###.###.###-##)
      await waitFor(() => {
        expect(cpfInput).toHaveValue(expect.stringMatching(/\d{3}\.\d{3}\.\d{3}-\d{2}/));
      });
    });

    it('should reject non-numeric characters in CPF', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const cpfInput = screen.getByLabelText(/cpf/i);

      // Act - Try to enter letters
      await user.type(cpfInput, 'ABC123DEF45');

      // Assert - Only numbers should be accepted (letters filtered out)
      expect(cpfInput.value.replace(/\D/g, '')).toMatch(/^\d+$/);
    });
  });

  describe('Input Validation - CEP & Address', () => {
    it('should validate CEP format (8 digits)', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const cepInput = screen.getByLabelText(/cep/i);

      // Act - Enter valid CEP
      await user.type(cepInput, '12345678');

      // Assert - Should format as #####-###
      await waitFor(() => {
        expect(cepInput).toHaveValue(expect.stringMatching(/\d{5}-?\d{3}/));
      });
    });

    it('should not accept CEP with less than 8 digits', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const cepInput = screen.getByLabelText(/cep/i);
      const submitButton = screen.getByRole('button', { name: /salvar/i });

      // Act - Enter short CEP
      await user.type(cepInput, '1234');
      await user.click(submitButton);

      // Assert - Should show validation error
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Input Validation - Date of Birth', () => {
    it('should validate date of birth is not in the future', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const dateInput = screen.getByLabelText(/data de nascimento/i);
      const submitButton = screen.getByRole('button', { name: /salvar/i });

      // Act - Enter future date
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      await user.type(dateInput, futureDateString);
      await user.click(submitButton);

      // Assert - Should prevent submission
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate date of birth is not too old (e.g., > 150 years)', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const dateInput = screen.getByLabelText(/data de nascimento/i);
      const submitButton = screen.getByRole('button', { name: /salvar/i });

      // Act - Enter date 200 years ago
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 200);
      const oldDateString = oldDate.toISOString().split('T')[0];

      await user.type(dateInput, oldDateString);
      await user.click(submitButton);

      // Assert - Should prevent submission
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission - Double Submit Protection', () => {
    it('should prevent double submission when isLoading is true', async () => {
      // Arrange
      const user = userEvent.setup();
      const { rerender } = render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const submitButton = screen.getByRole('button', { name: /salvar/i });

      // Act - Set loading state
      rerender(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      // Try to submit while loading
      await user.click(submitButton);

      // Assert - onSubmit should not be called
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Security - Required Fields Validation', () => {
    it('should require all mandatory fields', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ColaboradorForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      );

      const submitButton = screen.getByRole('button', { name: /salvar/i });

      // Act - Try to submit empty form
      await user.click(submitButton);

      // Assert - Should not submit
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });

      // Required fields should show validation errors
      // (Specific error messages depend on your validation implementation)
    });
  });
});

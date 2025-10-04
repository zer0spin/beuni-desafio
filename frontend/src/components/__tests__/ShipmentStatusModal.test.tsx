import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ShipmentStatusModal from '../ShipmentStatusModal';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock API
vi.mock('@/lib/api', () => ({
  default: {
    patch: vi.fn(),
  },
}));

describe('ShipmentStatusModal', () => {
  const mockEnvio = {
    id: 'envio-123',
    colaboradorId: 'col-123',
    anoAniversario: 2025,
    status: 'PENDENTE' as const,
    createdAt: '2025-01-01T00:00:00.000Z',
    colaborador: {
      id: 'col-123',
      nomeCompleto: 'João da Silva',
      dataNascimento: '1990-05-15',
      cargo: 'Desenvolvedor',
      departamento: 'TI',
      endereco: {
        cidade: 'São Paulo',
        uf: 'SP',
        logradouro: 'Rua Teste',
        numero: '123',
        bairro: 'Centro',
        cep: '01234-567',
      },
    },
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Gerenciar Status de Envio')).toBeInTheDocument();
    expect(screen.getByText('João da Silva • Desenvolvedor')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    const { container } = render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={false}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display colaborador information correctly', () => {
    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText(/João da Silva/)).toBeInTheDocument();
    expect(screen.getByText(/Desenvolvedor/)).toBeInTheDocument();
    expect(screen.getByText(/São Paulo\/SP/)).toBeInTheDocument();
  });

  it('should display all status options', () => {
    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Pronto para Envio')).toBeInTheDocument();
    expect(screen.getByText('Enviado')).toBeInTheDocument();
    expect(screen.getByText('Entregue')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('should have current status selected by default', () => {
    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const pendenteRadio = screen.getByRole('radio', { name: /Pendente/i });
    expect(pendenteRadio).toBeChecked();
  });

  it('should allow changing status selection', async () => {
    const user = userEvent.setup();

    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const enviadoLabel = screen.getByText('Enviado').closest('label');
    if (enviadoLabel) {
      await user.click(enviadoLabel);
    }

    const enviadoRadio = screen.getByRole('radio', { name: /Enviado/i });
    expect(enviadoRadio).toBeChecked();
  });

  it('should update observacoes field', async () => {
    const user = userEvent.setup();

    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const textarea = screen.getByPlaceholderText(/Adicione observações/i);
    await user.type(textarea, 'Enviado via Correios - BR123456789');

    expect(textarea).toHaveValue('Enviado via Correios - BR123456789');
  });

  it('should close modal when clicking cancel button', async () => {
    const user = userEvent.setup();

    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when clicking X button', async () => {
    const user = userEvent.setup();

    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(btn => btn.querySelector('svg'));

    if (xButton) {
      await user.click(xButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should show error when no changes are made', async () => {
    const user = userEvent.setup();

    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Atualizar Status/i });
    await user.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith('Nenhuma alteração foi feita');
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('should submit form with status change', async () => {
    const user = userEvent.setup();
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Change status to ENVIADO
    const enviadoLabel = screen.getByText('Enviado').closest('label');
    if (enviadoLabel) {
      await user.click(enviadoLabel);
    }

    const submitButton = screen.getByRole('button', { name: /Atualizar Status/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        `/envio-brindes/${mockEnvio.id}/status`,
        {
          status: 'ENVIADO',
          observacoes: undefined,
        }
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Status atualizado com sucesso!');
    expect(mockOnUpdate).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should submit form with status and observacoes', async () => {
    const user = userEvent.setup();
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Change status
    const enviadoLabel = screen.getByText('Enviado').closest('label');
    if (enviadoLabel) {
      await user.click(enviadoLabel);
    }

    // Add observacoes
    const textarea = screen.getByPlaceholderText(/Adicione observações/i);
    await user.type(textarea, 'Código de rastreamento: BR123456789');

    const submitButton = screen.getByRole('button', { name: /Atualizar Status/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        `/envio-brindes/${mockEnvio.id}/status`,
        {
          status: 'ENVIADO',
          observacoes: 'Código de rastreamento: BR123456789',
        }
      );
    });
  });

  it('should handle API error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Erro ao atualizar status';
    vi.mocked(api.patch).mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Change status
    const enviadoLabel = screen.getByText('Enviado').closest('label');
    if (enviadoLabel) {
      await user.click(enviadoLabel);
    }

    const submitButton = screen.getByRole('button', { name: /Atualizar Status/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();

    // Mock a delayed response
    vi.mocked(api.patch).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );

    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Change status
    const enviadoLabel = screen.getByText('Enviado').closest('label');
    if (enviadoLabel) {
      await user.click(enviadoLabel);
    }

    const submitButton = screen.getByRole('button', { name: /Atualizar Status/i });
    await user.click(submitButton);

    // Check for loading text
    expect(screen.getByText(/Atualizando.../i)).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText(/Atualizando.../i)).not.toBeInTheDocument();
    });
  });

  it('should format dates correctly', () => {
    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Check if birthday is displayed (format may vary by locale)
    expect(screen.getByText(/1990-05-15|15\/05\/1990/i)).toBeInTheDocument();
  });

  it('should display address correctly', () => {
    render(
      <ShipmentStatusModal
        envio={mockEnvio}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText(/Rua Teste, 123/i)).toBeInTheDocument();
    expect(screen.getByText(/São Paulo\/SP/i)).toBeInTheDocument();
  });

  it('should display complemento when present', () => {
    const envioComComplemento = {
      ...mockEnvio,
      colaborador: {
        ...mockEnvio.colaborador,
        endereco: {
          ...mockEnvio.colaborador.endereco,
          complemento: 'Apto 101',
        },
      },
    };

    render(
      <ShipmentStatusModal
        envio={envioComComplemento}
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText(/Apto 101/i)).toBeInTheDocument();
  });
});

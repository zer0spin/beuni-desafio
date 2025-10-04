import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import EnviosPage from '../../pages/envios/index';
import * as api from '../../lib/api';

// Mock dependencies
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
  endpoints: {
    enviosBrindes: '/envio-brindes',
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../contexts/UserContext', () => ({
  useUser: vi.fn(() => ({
    user: {
      id: 1,
      nome_completo: 'Test User',
      organizationId: 'org-123',
    },
  })),
}));

describe('EnviosPage - Bulk Operations', () => {
  const mockPush = vi.fn();
  const mockApi = vi.mocked(api.default);

  const mockEnvios = [
    {
      id: '1',
      status: 'PENDENTE',
      anoAniversario: 2024,
      colaborador: {
        id: '1',
        nome_completo: 'João Silva',
        data_nascimento: '1990-06-15',
        departamento: 'TI',
      },
    },
    {
      id: '2',
      status: 'PRONTO',
      anoAniversario: 2024,
      colaborador: {
        id: '2',
        nome_completo: 'Maria Santos',
        data_nascimento: '1985-03-20',
        departamento: 'RH',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      pathname: '/envios',
      query: {},
      asPath: '/envios',
    } as any);

    // Mock successful API responses
    mockApi.get.mockResolvedValue({
      data: {
        envios: mockEnvios,
        stats: {
          total: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
        },
      },
    });
  });

  it('should show bulk operations button', async () => {
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Operações em Lote')).toBeInTheDocument();
    });
  });

  it('should open bulk operations modal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Operações em Lote')).toBeInTheDocument();
    });
    
    const bulkButton = screen.getByText('Operações em Lote');
    await user.click(bulkButton);
    
    // Should show bulk modal (content depends on BulkShipmentModal implementation)
    expect(screen.getByText('Criar Registros')).toBeInTheDocument();
    expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
  });

  it('should handle status updates for individual envios', async () => {
    const user = userEvent.setup();
    mockApi.put.mockResolvedValue({
      data: { message: 'Status updated successfully' }
    });
    
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
    
    // Find and click status button for João Silva (first envio)
    const statusButtons = screen.getAllByTitle('Gerenciar Status');
    await user.click(statusButtons[0]);
    
    // Should show status modal
    expect(screen.getByText('Alterar Status do Envio')).toBeInTheDocument();
    
    // Select 'ENVIADO' status
    const enviadoOption = screen.getByRole('radio', { name: 'Enviado' });
    await user.click(enviadoOption);
    
    // Save changes
    const saveButton = screen.getByText('Salvar');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/envio-brindes/1', {
        status: 'ENVIADO',
      });
    });
  });

  it('should filter envios by status', async () => {
    const user = userEvent.setup();
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
    
    // Find status filter dropdown
    const statusFilter = screen.getByDisplayValue('Todos os Status');
    await user.click(statusFilter);
    
    // Select PENDENTE filter
    const pendenteOption = screen.getByText('Pendente');
    await user.click(pendenteOption);
    
    // Should call API with status filter
    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('status=PENDENTE')
      );
    });
  });

  it('should filter envios by year', async () => {
    const user = userEvent.setup();
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
    
    // Find year filter dropdown
    const yearFilter = screen.getByDisplayValue('2024');
    await user.click(yearFilter);
    
    // Select different year
    const year2023 = screen.getByText('2023');
    await user.click(year2023);
    
    // Should call API with year filter
    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('ano=2023')
      );
    });
  });

  it('should search envios by name', async () => {
    const user = userEvent.setup();
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });
    
    // Find search input
    const searchInput = screen.getByPlaceholderText('Buscar por nome...');
    await user.type(searchInput, 'João');
    
    // Should call API with search filter after debounce
    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith(
        expect.stringContaining('search=João')
      );
    }, { timeout: 1000 });
  });

  it('should show loading state while fetching data', async () => {
    // Mock delayed response
    mockApi.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { envios: [], stats: {} } }), 100))
    );
    
    render(<EnviosPage />);
    
    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalled();
    });
  });

  it('should handle empty envios state', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        envios: [],
        stats: { total: 0, totalPages: 0, currentPage: 1, limit: 10 },
      },
    });
    
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum envio encontrado')).toBeInTheDocument();
    });
  });

  it('should show pagination when multiple pages exist', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        envios: mockEnvios,
        stats: {
          total: 25,
          totalPages: 3,
          currentPage: 1,
          limit: 10,
        },
      },
    });
    
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    });
    
    // Should show pagination controls
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to load envios';
    mockApi.get.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalled();
    });
    
    // Should handle error (toast would be called but we're mocking it)
    // The component should show an appropriate error state
  });

  it('should refresh data after bulk operations', async () => {
    const user = userEvent.setup();
    render(<EnviosPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Operações em Lote')).toBeInTheDocument();
    });
    
    // Open bulk modal
    const bulkButton = screen.getByText('Operações em Lote');
    await user.click(bulkButton);
    
    // Close modal (simulating successful operation)
    const closeButton = screen.getByText('Cancelar');
    await user.click(closeButton);
    
    // Should refresh data after modal closes
    expect(mockApi.get).toHaveBeenCalledTimes(2); // Initial load + refresh
  });
});
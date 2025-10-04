import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import ColaboradoresPage from '../../pages/colaboradores/index';
import * as api from '../../lib/api';

// Mock dependencies
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
  endpoints: {
    colaboradores: '/colaboradores',
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

describe('ColaboradoresPage - Delete All Functionality', () => {
  const mockPush = vi.fn();
  const mockApi = vi.mocked(api.default);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      pathname: '/colaboradores',
      query: {},
      asPath: '/colaboradores',
    } as any);

    // Mock successful API responses
    mockApi.get.mockResolvedValue({
      data: {
        colaboradores: [
          {
            id: '1',
            nome_completo: 'João Silva',
            email: 'joao@test.com',
            departamento: 'TI',
          },
          {
            id: '2',
            nome_completo: 'Maria Santos',
            email: 'maria@test.com',
            departamento: 'RH',
          },
        ],
        stats: {
          total: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
        },
      },
    });
  });

  it('should show delete all button', async () => {
    render(<ColaboradoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
    });
  });

  it('should open confirmation modal when delete all is clicked', async () => {
    const user = userEvent.setup();
    render(<ColaboradoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByText('Deletar Todos');
    await user.click(deleteButton);
    
    // Should show confirmation modal
    expect(screen.getByText('⚠️ DELETAR TODOS OS COLABORADORES')).toBeInTheDocument();
    expect(screen.getByText(/Esta ação deletará TODOS os colaboradores/)).toBeInTheDocument();
  });

  it('should cancel deletion when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<ColaboradoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
    });
    
    // Open modal
    const deleteButton = screen.getByText('Deletar Todos');
    await user.click(deleteButton);
    
    // Click cancel
    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);
    
    // Modal should close
    expect(screen.queryByText('⚠️ DELETAR TODOS OS COLABORADORES')).not.toBeInTheDocument();
  });

  it('should delete all colaboradores when confirmed', async () => {
    const user = userEvent.setup();
    mockApi.delete.mockResolvedValue({
      data: { message: 'Success', deletedCount: 2 }
    });
    
    render(<ColaboradoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
    });
    
    // Open modal
    const deleteButton = screen.getByText('Deletar Todos');
    await user.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByText('DELETAR TODOS');
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalledWith('/colaboradores');
    });
  });

  it('should show loading state during deletion', async () => {
    const user = userEvent.setup();
    // Mock delayed response
    mockApi.delete.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );
    
    render(<ColaboradoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
    });
    
    // Open modal and confirm
    const deleteButton = screen.getByText('Deletar Todos');
    await user.click(deleteButton);
    
    const confirmButton = screen.getByText('DELETAR TODOS');
    await user.click(confirmButton);
    
    // Should show loading state
    expect(screen.getByText('Deletando...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalled();
    });
  });

  it('should handle deletion errors gracefully', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to delete colaboradores';
    mockApi.delete.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    render(<ColaboradoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
    });
    
    // Open modal and confirm
    const deleteButton = screen.getByText('Deletar Todos');
    await user.click(deleteButton);
    
    const confirmButton = screen.getByText('DELETAR TODOS');
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalled();
    });
    
    // Should handle error (toast would be called but we're mocking it)
    // The component should recover from the error state
  });

  it('should disable delete button during loading', async () => {
    const user = userEvent.setup();
    mockApi.delete.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );
    
    render(<ColaboradoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
    });
    
    // Open modal and confirm
    const deleteButton = screen.getByText('Deletar Todos');
    await user.click(deleteButton);
    
    const confirmButton = screen.getByText('DELETAR TODOS');
    await user.click(confirmButton);
    
    // Button should be disabled during loading
    const loadingButton = screen.getByText('Deletando...');
    expect(loadingButton).toBeDisabled();
  });

  it('should refresh data after successful deletion', async () => {
    const user = userEvent.setup();
    mockApi.delete.mockResolvedValue({
      data: { message: 'Success', deletedCount: 2 }
    });
    
    // Mock empty response after deletion
    mockApi.get.mockResolvedValueOnce({
      data: {
        colaboradores: [],
        stats: { total: 0, totalPages: 0, currentPage: 1, limit: 10 },
      },
    });
    
    render(<ColaboradoresPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
    });
    
    // Perform deletion
    const deleteButton = screen.getByText('Deletar Todos');
    await user.click(deleteButton);
    
    const confirmButton = screen.getByText('DELETAR TODOS');
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalled();
    });
    
    // Should call API again to refresh data
    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledTimes(2); // Initial load + refresh after delete
    });
  });
});
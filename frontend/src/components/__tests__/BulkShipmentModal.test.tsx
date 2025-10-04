import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BulkShipmentModal from '../BulkShipmentModal';
import * as api from '../../lib/api';

// Mock API
vi.mock('../../lib/api', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('BulkShipmentModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockApi = vi.mocked(api.default);

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<BulkShipmentModal {...defaultProps} />);
    
    expect(screen.getByText('Operações em Lote')).toBeInTheDocument();
    expect(screen.getByText('Criar Registros')).toBeInTheDocument();
    expect(screen.getByText('Deletar Todos')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(<BulkShipmentModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Operações em Lote')).not.toBeInTheDocument();
  });

  it('should handle year selection for create records', async () => {
    const user = userEvent.setup();
    render(<BulkShipmentModal {...defaultProps} />);
    
    // Click create records button
    const createButton = screen.getByText('Criar Registros');
    await user.click(createButton);
    
    // Should show year selector
    expect(screen.getByText('Selecionar Ano')).toBeInTheDocument();
    
    // Select a year (assuming current year + 1)
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearOption = screen.getByText(nextYear.toString());
    await user.click(yearOption);
    
    // Should show confirmation step
    expect(screen.getByText(`Confirmar Criação para ${nextYear}`)).toBeInTheDocument();
  });

  it('should create records successfully', async () => {
    const user = userEvent.setup();
    mockApi.post.mockResolvedValue({ data: { message: 'Success' } });
    
    render(<BulkShipmentModal {...defaultProps} />);
    
    // Navigate to create confirmation
    const createButton = screen.getByText('Criar Registros');
    await user.click(createButton);
    
    const currentYear = new Date().getFullYear() + 1;
    const yearOption = screen.getByText(currentYear.toString());
    await user.click(yearOption);
    
    // Confirm creation
    const confirmButton = screen.getByText('Criar Registros');
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/envio-brindes/bulk-create', {
        ano: currentYear,
      });
    });
    
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should show delete confirmation with warning', async () => {
    const user = userEvent.setup();
    render(<BulkShipmentModal {...defaultProps} />);
    
    // Click delete all button
    const deleteButton = screen.getByText('Deletar Todos');
    await user.click(deleteButton);
    
    // Should show delete confirmation with warning
    expect(screen.getByText('⚠️ PERIGO: Deletar TODOS os Envios')).toBeInTheDocument();
    expect(screen.getByText(/Esta ação deletará TODOS os registros de envio/)).toBeInTheDocument();
    expect(screen.getByText('DELETAR TODOS OS REGISTROS')).toBeInTheDocument();
  });

  it('should delete all records successfully', async () => {
    const user = userEvent.setup();
    mockApi.delete.mockResolvedValue({ 
      data: { message: 'Success', deletedCount: 15 } 
    });
    
    render(<BulkShipmentModal {...defaultProps} />);
    
    // Navigate to delete confirmation
    const deleteButton = screen.getByText('Deletar Todos');
    await user.click(deleteButton);
    
    // Confirm deletion
    const confirmDeleteButton = screen.getByText('DELETAR TODOS OS REGISTROS');
    await user.click(confirmDeleteButton);
    
    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalledWith('/envio-brindes/delete-all');
    });
    
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Server error';
    mockApi.post.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    render(<BulkShipmentModal {...defaultProps} />);
    
    // Navigate to create and trigger error
    const createButton = screen.getByText('Criar Registros');
    await user.click(createButton);
    
    const currentYear = new Date().getFullYear() + 1;
    const yearOption = screen.getByText(currentYear.toString());
    await user.click(yearOption);
    
    const confirmButton = screen.getByText('Criar Registros');
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
    });
    
    // Should not call onSuccess on error
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should close modal when clicking cancel', async () => {
    const user = userEvent.setup();
    render(<BulkShipmentModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show loading state during operations', async () => {
    const user = userEvent.setup();
    // Mock a delayed response
    mockApi.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );
    
    render(<BulkShipmentModal {...defaultProps} />);
    
    // Navigate to create confirmation
    const createButton = screen.getByText('Criar Registros');
    await user.click(createButton);
    
    const currentYear = new Date().getFullYear() + 1;
    const yearOption = screen.getByText(currentYear.toString());
    await user.click(yearOption);
    
    // Click confirm and check loading state
    const confirmButton = screen.getByText('Criar Registros');
    await user.click(confirmButton);
    
    // Should show loading text
    expect(screen.getByText('Criando...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
    });
  });

  it('should allow navigation back from confirmation screens', async () => {
    const user = userEvent.setup();
    render(<BulkShipmentModal {...defaultProps} />);
    
    // Navigate to create confirmation
    const createButton = screen.getByText('Criar Registros');
    await user.click(createButton);
    
    const currentYear = new Date().getFullYear() + 1;
    const yearOption = screen.getByText(currentYear.toString());
    await user.click(yearOption);
    
    // Should be in confirmation step
    expect(screen.getByText(`Confirmar Criação para ${currentYear}`)).toBeInTheDocument();
    
    // Click back button
    const backButton = screen.getByText('Voltar');
    await user.click(backButton);
    
    // Should be back to year selection
    expect(screen.getByText('Selecionar Ano')).toBeInTheDocument();
  });

  it('should disable buttons during loading', async () => {
    const user = userEvent.setup();
    mockApi.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );
    
    render(<BulkShipmentModal {...defaultProps} />);
    
    // Navigate to create confirmation
    const createButton = screen.getByText('Criar Registros');
    await user.click(createButton);
    
    const currentYear = new Date().getFullYear() + 1;
    const yearOption = screen.getByText(currentYear.toString());
    await user.click(yearOption);
    
    const confirmButton = screen.getByText('Criar Registros');
    await user.click(confirmButton);
    
    // Button should be disabled during loading
    const loadingButton = screen.getByText('Criando...');
    expect(loadingButton).toBeDisabled();
  });
});
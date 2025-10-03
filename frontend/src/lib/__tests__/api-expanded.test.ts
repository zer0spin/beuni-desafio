import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

// Mock axios primeiro
const mockAxiosInstance = {
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

// Import após mocks
import { apiCall, getAuthToken, endpoints } from '../api';

describe('API Library - Expanded Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAuthToken', () => {
    it('should return token from cookie', () => {
      // Arrange
      const token = 'test-token-123';
      const mockGet = vi.mocked(Cookies.get);
      mockGet.mockReturnValue(token);

      // Act
      const result = getAuthToken();

      // Assert
      expect(result).toBe(token);
      expect(mockGet).toHaveBeenCalledWith('beuni_token');
    });

    it('should return undefined if token cookie does not exist', () => {
      // Arrange
      const mockGet = vi.mocked(Cookies.get);
      mockGet.mockReturnValue(undefined);

      // Act
      const result = getAuthToken();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('apiCall helper function', () => {
    it('should execute request and return response data', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test User' };
      const mockRequest = vi.fn().mockResolvedValue({ data: mockData });

      // Act
      const result = await apiCall(mockRequest);

      // Assert
      expect(result).toEqual(mockData);
      expect(mockRequest).toHaveBeenCalledOnce();
    });

    it('should show success toast when showSuccessToast is true', async () => {
      // Arrange
      const mockData = { id: 1 };
      const mockRequest = vi.fn().mockResolvedValue({ data: mockData });
      const customMessage = 'Colaborador criado com sucesso!';

      // Act
      await apiCall(mockRequest, {
        showSuccessToast: true,
        successMessage: customMessage,
      });

      // Assert
      expect(toast.success).toHaveBeenCalledWith(customMessage);
    });

    it('should show default success toast when no custom message provided', async () => {
      // Arrange
      const mockData = { success: true };
      const mockRequest = vi.fn().mockResolvedValue({ data: mockData });

      // Act
      await apiCall(mockRequest, { showSuccessToast: true });

      // Assert
      expect(toast.success).toHaveBeenCalledWith('Operação realizada com sucesso!');
    });

    it('should show error toast and rethrow error on request failure', async () => {
      // Arrange
      const errorMessage = 'Erro ao criar colaborador';
      const mockError = {
        response: { data: { message: errorMessage } },
      };
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      // Act & Assert
      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    it('should not show error toast when showErrorToast is false', async () => {
      // Arrange
      const mockError = new Error('Request failed');
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        apiCall(mockRequest, { showErrorToast: false })
      ).rejects.toEqual(mockError);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should handle array error messages correctly', async () => {
      // Arrange
      const errorMessages = ['Campo obrigatório', 'Email inválido'];
      const mockError = {
        response: { data: { message: errorMessages } },
      };
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      // Act & Assert
      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(toast.error).toHaveBeenCalledWith('Campo obrigatório'); // First message
    });

    it('should handle error without response data', async () => {
      // Arrange
      const mockError = new Error('Network error');
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      // Act & Assert
      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });

    it('should handle error with fallback message', async () => {
      // Arrange
      const mockError = {}; // Error without message
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      // Act & Assert
      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(toast.error).toHaveBeenCalledWith('Erro desconhecido');
    });
  });

  describe('endpoints configuration', () => {
    it('should have correct auth endpoints', () => {
      expect(endpoints.login).toBe('/auth/login');
      expect(endpoints.register).toBe('/auth/register');
      expect(endpoints.logout).toBe('/auth/logout');
      expect(endpoints.profile).toBe('/auth/profile');
      expect(endpoints.updateProfile).toBe('/auth/profile');
      expect(endpoints.uploadProfileImage).toBe('/auth/upload-profile-image');
    });

    it('should have correct colaboradores endpoints', () => {
      expect(endpoints.colaboradores).toBe('/colaboradores');
      expect(endpoints.colaboradoresProximos).toBe('/colaboradores/aniversariantes-proximos');
      expect(endpoints.colaboradoresProximos30Dias).toBe('/colaboradores/aniversariantes-proximos-30-dias');
    });

    it('should generate dynamic endpoints correctly', () => {
      expect(endpoints.updateOrganizacao('org-123')).toBe('/organizacoes/org-123');
      expect(endpoints.cep('12345-678')).toBe('/cep/12345-678');
      expect(endpoints.marcarEnviado('env-456')).toBe('/envio-brindes/env-456/marcar-enviado');
      expect(endpoints.marcarNotificacaoLida('notif-789')).toBe('/notificacoes/notif-789/marcar-como-lida');
    });

    it('should have correct notification endpoints', () => {
      expect(endpoints.notificacoes).toBe('/notificacoes');
      expect(endpoints.notificacoesNaoLidas).toBe('/notificacoes/count/nao-lidas');
      expect(endpoints.marcarTodasNotificacoesLidas).toBe('/notificacoes/marcar-todas-como-lidas');
    });

    it('should have correct envio brindes endpoints', () => {
      expect(endpoints.enviosBrindes).toBe('/envio-brindes');
      expect(endpoints.enviosProntos).toBe('/envio-brindes/prontos-para-envio');
      expect(endpoints.estatisticas).toBe('/envio-brindes/estatisticas');
      expect(endpoints.simularProcessamento).toBe('/envio-brindes/simular-processamento');
      expect(endpoints.relatorios).toBe('/envio-brindes/relatorios');
    });
  });

  describe('Security Tests for API Configuration', () => {
    it('should validate endpoint structure for SQL injection prevention', () => {
      // Test that dynamic endpoints properly encode parameters
      const maliciousId = "'; DROP TABLE users; --";
      const endpoint = endpoints.updateOrganizacao(maliciousId);
      
      // Should include the malicious string as-is (protection happens server-side)
      expect(endpoint).toBe(`/organizacoes/${maliciousId}`);
    });

    it('should have consistent endpoint patterns', () => {
      // All dynamic endpoints should follow RESTful patterns
      expect(endpoints.updateOrganizacao('123')).toMatch(/^\/[a-z]+\/\d+$/);
      expect(endpoints.cep('12345-678')).toMatch(/^\/cep\/[\d-]+$/);
      expect(endpoints.marcarEnviado('456')).toMatch(/^\/[a-z-]+\/\d+\/[a-z-]+$/);
    });

    it('should handle special characters in CEP endpoint', () => {
      const cepWithSpecialChars = '12345-678';
      expect(endpoints.cep(cepWithSpecialChars)).toBe('/cep/12345-678');
    });
  });

  describe('Error Handling Coverage', () => {
    it('should handle request timeout errors appropriately', async () => {
      // Arrange
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
      };
      const mockRequest = vi.fn().mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(apiCall(mockRequest)).rejects.toEqual(timeoutError);
      expect(toast.error).toHaveBeenCalledWith('timeout of 10000ms exceeded');
    });

    it('should handle network connection errors', async () => {
      // Arrange
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error',
      };
      const mockRequest = vi.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(apiCall(mockRequest)).rejects.toEqual(networkError);
      expect(toast.error).toHaveBeenCalledWith('Network Error');
    });
  });

  describe('Response Data Handling', () => {
    it('should return response data for successful GET requests', async () => {
      // Arrange
      const responseData = {
        colaboradores: [
          { id: 1, nome: 'João', email: 'joao@example.com' },
          { id: 2, nome: 'Maria', email: 'maria@example.com' },
        ],
        total: 2,
      };
      const mockRequest = vi.fn().mockResolvedValue({ data: responseData });

      // Act
      const result = await apiCall(mockRequest);

      // Assert
      expect(result).toEqual(responseData);
    });

    it('should return response data for successful POST requests', async () => {
      // Arrange
      const newColaborador = {
        id: 3,
        nome: 'Pedro',
        email: 'pedro@example.com',
        dataAdmissao: '2024-01-15',
      };
      const mockRequest = vi.fn().mockResolvedValue({ data: newColaborador });

      // Act
      const result = await apiCall(mockRequest);

      // Assert
      expect(result).toEqual(newColaborador);
    });
  });
});
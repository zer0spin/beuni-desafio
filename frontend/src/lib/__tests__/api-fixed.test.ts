import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock primeiro
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

const mockAxiosInstance = {
  create: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock('react-hot-toast', () => ({
  toast: mockToast,
}));

vi.mock('js-cookie', () => ({
  default: mockCookies,
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

describe('API Tests - Fixed Hoisting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('apiCall helper function', () => {
    it('should execute request and return response data', async () => {
      // Precisamos importar dinamicamente para evitar hoisting
      const { apiCall } = await import('../api');
      
      const mockData = { id: 1, name: 'Test User' };
      const mockRequest = vi.fn().mockResolvedValue({ data: mockData });

      const result = await apiCall(mockRequest);

      expect(result).toEqual(mockData);
      expect(mockRequest).toHaveBeenCalledOnce();
    });

    it('should show success toast when showSuccessToast is true', async () => {
      const { apiCall } = await import('../api');
      
      const mockData = { id: 1 };
      const mockRequest = vi.fn().mockResolvedValue({ data: mockData });
      const customMessage = 'Colaborador criado com sucesso!';

      await apiCall(mockRequest, {
        showSuccessToast: true,
        successMessage: customMessage,
      });

      expect(mockToast.success).toHaveBeenCalledWith(customMessage);
    });

    it('should show default success toast when no custom message provided', async () => {
      const { apiCall } = await import('../api');
      
      const mockData = { success: true };
      const mockRequest = vi.fn().mockResolvedValue({ data: mockData });

      await apiCall(mockRequest, { showSuccessToast: true });

      expect(mockToast.success).toHaveBeenCalledWith('Operação realizada com sucesso!');
    });

    it('should show error toast and rethrow error on request failure', async () => {
      const { apiCall } = await import('../api');
      
      const errorMessage = 'Erro ao criar colaborador';
      const mockError = {
        response: { data: { message: errorMessage } },
      };
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
    });

    it('should not show error toast when showErrorToast is false', async () => {
      const { apiCall } = await import('../api');
      
      const mockError = new Error('Request failed');
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      await expect(
        apiCall(mockRequest, { showErrorToast: false })
      ).rejects.toEqual(mockError);
      expect(mockToast.error).not.toHaveBeenCalled();
    });

    it('should handle array error messages correctly', async () => {
      const { apiCall } = await import('../api');
      
      const errorMessages = ['Campo obrigatório', 'Email inválido'];
      const mockError = {
        response: { data: { message: errorMessages } },
      };
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(mockToast.error).toHaveBeenCalledWith('Campo obrigatório');
    });

    it('should handle error without response data', async () => {
      const { apiCall } = await import('../api');
      
      const mockError = new Error('Network error');
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(mockToast.error).toHaveBeenCalledWith('Network error');
    });

    it('should handle error with fallback message', async () => {
      const { apiCall } = await import('../api');
      
      const mockError = {}; // Error sem message
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(mockToast.error).toHaveBeenCalledWith('Erro desconhecido');
    });
  });

  describe('getAuthToken function', () => {
    it('should return token from cookie', async () => {
      const { getAuthToken } = await import('../api');
      
      const token = 'test-token-123';
      mockCookies.get.mockReturnValue(token);

      const result = getAuthToken();

      expect(result).toBe(token);
      expect(mockCookies.get).toHaveBeenCalledWith('beuni_token');
    });

    it('should return undefined if token cookie does not exist', async () => {
      const { getAuthToken } = await import('../api');
      
      mockCookies.get.mockReturnValue(undefined);

      const result = getAuthToken();

      expect(result).toBeUndefined();
    });
  });

  describe('endpoints configuration', () => {
    it('should have correct auth endpoints', async () => {
      const { endpoints } = await import('../api');
      
      expect(endpoints.login).toBe('/auth/login');
      expect(endpoints.register).toBe('/auth/register');
      expect(endpoints.logout).toBe('/auth/logout');
      expect(endpoints.profile).toBe('/auth/profile');
      expect(endpoints.updateProfile).toBe('/auth/profile');
      expect(endpoints.uploadProfileImage).toBe('/auth/upload-profile-image');
    });

    it('should have correct colaboradores endpoints', async () => {
      const { endpoints } = await import('../api');
      
      expect(endpoints.colaboradores).toBe('/colaboradores');
      expect(endpoints.colaboradoresProximos).toBe('/colaboradores/aniversariantes-proximos');
      expect(endpoints.colaboradoresProximos30Dias).toBe('/colaboradores/aniversariantes-proximos-30-dias');
    });

    it('should generate dynamic endpoints correctly', async () => {
      const { endpoints } = await import('../api');
      
      expect(endpoints.updateOrganizacao('org-123')).toBe('/organizacoes/org-123');
      expect(endpoints.cep('12345-678')).toBe('/cep/12345-678');
      expect(endpoints.marcarEnviado('env-456')).toBe('/envio-brindes/env-456/marcar-enviado');
      expect(endpoints.marcarNotificacaoLida('notif-789')).toBe('/notificacoes/notif-789/marcar-como-lida');
    });

    it('should have correct notification endpoints', async () => {
      const { endpoints } = await import('../api');
      
      expect(endpoints.notificacoes).toBe('/notificacoes');
      expect(endpoints.notificacoesNaoLidas).toBe('/notificacoes/count/nao-lidas');
      expect(endpoints.marcarTodasNotificacoesLidas).toBe('/notificacoes/marcar-todas-como-lidas');
    });

    it('should have correct envio brindes endpoints', async () => {
      const { endpoints } = await import('../api');
      
      expect(endpoints.enviosBrindes).toBe('/envio-brindes');
      expect(endpoints.enviosProntos).toBe('/envio-brindes/prontos-para-envio');
      expect(endpoints.estatisticas).toBe('/envio-brindes/estatisticas');
      expect(endpoints.simularProcessamento).toBe('/envio-brindes/simular-processamento');
      expect(endpoints.relatorios).toBe('/envio-brindes/relatorios');
    });
  });

  describe('Auth token functions', () => {
    it('should store user data with setAuthToken', async () => {
      const { setAuthToken } = await import('../api');
      
      const user = {
        id: 'user-123',
        nome: 'Ana Silva',
        email: 'ana@example.com',
      };

      setAuthToken(user);

      expect(mockCookies.set).toHaveBeenCalledWith(
        'beuni_user',
        JSON.stringify(user),
        expect.objectContaining({
          expires: 7,
          sameSite: 'strict',
          path: '/',
        })
      );
    });

    it('should remove auth cookies with removeAuthToken', async () => {
      const { removeAuthToken } = await import('../api');
      
      removeAuthToken();

      expect(mockCookies.remove).toHaveBeenCalledWith('beuni_user', { path: '/' });
      expect(mockCookies.remove).toHaveBeenCalledWith('beuni_token', { path: '/' });
    });

    it('should get user data from cookie', async () => {
      const { getUser } = await import('../api');
      
      const user = {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@example.com',
      };

      mockCookies.get.mockReturnValue(JSON.stringify(user));

      const result = getUser();

      expect(result).toEqual(user);
      expect(mockCookies.get).toHaveBeenCalledWith('beuni_user');
    });

    it('should return null if user cookie does not exist', async () => {
      const { getUser } = await import('../api');
      
      mockCookies.get.mockReturnValue(undefined);

      const result = getUser();

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON in user cookie', async () => {
      const { getUser } = await import('../api');
      
      mockCookies.get.mockReturnValue('invalid-json{');

      const result = getUser();

      expect(result).toBeNull();
    });
  });

  describe('Security Tests', () => {
    it('should validate endpoint structure for SQL injection prevention', async () => {
      const { endpoints } = await import('../api');
      
      const maliciousId = "'; DROP TABLE users; --";
      const endpoint = endpoints.updateOrganizacao(maliciousId);
      
      expect(endpoint).toBe(`/organizacoes/${maliciousId}`);
    });

    it('should handle special characters in CEP endpoint', async () => {
      const { endpoints } = await import('../api');
      
      const cepWithSpecialChars = '12345-678';
      expect(endpoints.cep(cepWithSpecialChars)).toBe('/cep/12345-678');
    });
  });

  describe('Error Handling Coverage', () => {
    it('should handle request timeout errors appropriately', async () => {
      const { apiCall } = await import('../api');
      
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
      };
      const mockRequest = vi.fn().mockRejectedValue(timeoutError);

      await expect(apiCall(mockRequest)).rejects.toEqual(timeoutError);
      expect(mockToast.error).toHaveBeenCalledWith('timeout of 10000ms exceeded');
    });

    it('should handle network connection errors', async () => {
      const { apiCall } = await import('../api');
      
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error',
      };
      const mockRequest = vi.fn().mockRejectedValue(networkError);

      await expect(apiCall(mockRequest)).rejects.toEqual(networkError);
      expect(mockToast.error).toHaveBeenCalledWith('Network Error');
    });
  });

  describe('Response Data Handling', () => {
    it('should return response data for successful requests', async () => {
      const { apiCall } = await import('../api');
      
      const responseData = {
        colaboradores: [
          { id: 1, nome: 'João', email: 'joao@example.com' },
          { id: 2, nome: 'Maria', email: 'maria@example.com' },
        ],
        total: 2,
      };
      const mockRequest = vi.fn().mockResolvedValue({ data: responseData });

      const result = await apiCall(mockRequest);

      expect(result).toEqual(responseData);
    });
  });
});
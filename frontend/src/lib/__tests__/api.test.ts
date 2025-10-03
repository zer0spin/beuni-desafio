import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

// Mock axios BEFORE importing api
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
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Import AFTER mocking
import api, { setAuthToken, removeAuthToken, getUser, getAuthToken, apiCall, endpoints } from '../api';

describe('API Library - Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setAuthToken', () => {
    it('should store only user data (not token) with secure options', () => {
      // Arrange
      const user = {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@example.com',
        organizationId: 'org-123',
      };

      const mockSet = vi.fn();
      vi.mocked(Cookies.set).mockImplementation(mockSet);

      // Act
      setAuthToken(user);

      // Assert
      expect(mockSet).toHaveBeenCalledWith(
        'beuni_user',
        JSON.stringify(user),
        expect.objectContaining({
          expires: 7,
          sameSite: 'strict',
          path: '/',
          secure: false, // false in test environment (NODE_ENV !== 'production')
        })
      );

      // SECURITY: Ensure token is NOT stored client-side (httpOnly from backend)
      expect(mockSet).toHaveBeenCalledTimes(1); // Only user cookie
    });

    it('should use secure flag in production environment', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const user = { id: '1', nome: 'User' };

      const mockSet = vi.fn();
      vi.mocked(Cookies.set).mockImplementation(mockSet);

      // Act
      setAuthToken(user);

      // Assert
      expect(mockSet).toHaveBeenCalledWith(
        'beuni_user',
        expect.any(String),
        expect.objectContaining({
          secure: true, // true in production
        })
      );

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('removeAuthToken', () => {
    it('should remove user cookie', () => {
      // Arrange
      const mockRemove = vi.fn();
      vi.mocked(Cookies.remove).mockImplementation(mockRemove);

      // Act
      removeAuthToken();

      // Assert
      expect(mockRemove).toHaveBeenCalledWith('beuni_user', { path: '/' });
    });

    it('should also try to remove token cookie for backward compatibility', () => {
      // Arrange
      const mockRemove = vi.fn();
      vi.mocked(Cookies.remove).mockImplementation(mockRemove);

      // Act
      removeAuthToken();

      // Assert
      expect(mockRemove).toHaveBeenCalledWith('beuni_token', { path: '/' });
      expect(mockRemove).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUser', () => {
    it('should parse and return user data from cookie', () => {
      // Arrange
      const user = {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@example.com',
      };

      vi.mocked(Cookies.get).mockReturnValue(JSON.stringify(user));

      // Act
      const result = getUser();

      // Assert
      expect(result).toEqual(user);
      expect(Cookies.get).toHaveBeenCalledWith('beuni_user');
    });

    it('should return null if user cookie does not exist', () => {
      // Arrange
      vi.mocked(Cookies.get).mockReturnValue(undefined);

      // Act
      const result = getUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null and not throw error if cookie has invalid JSON', () => {
      // Arrange
      vi.mocked(Cookies.get).mockReturnValue('invalid-json{');

      // Act
      const result = getUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Security - Input Validation', () => {
    it('should handle XSS attempts in user data', () => {
      // Arrange
      const maliciousUser = {
        id: '1',
        nome: '<script>alert("XSS")</script>',
        email: 'test@example.com',
      };

      const mockSet = vi.fn();
      vi.mocked(Cookies.set).mockImplementation(mockSet);

      // Act
      setAuthToken(maliciousUser);

      // Assert - Data is stored as-is (sanitization should happen on render)
      const storedData = mockSet.mock.calls[0][1];
      expect(storedData).toContain('<script>');

      // This is OK because React automatically escapes content
      // The actual protection happens at render time, not storage time
    });
  });

  describe('Security - CSRF Protection', () => {
    it('should use strict sameSite cookie attribute', () => {
      // Arrange
      const user = { id: '1', nome: 'User' };
      const mockSet = vi.fn();
      vi.mocked(Cookies.set).mockImplementation(mockSet);

      // Act
      setAuthToken(user);

      // Assert
      expect(mockSet).toHaveBeenCalledWith(
        'beuni_user',
        expect.any(String),
        expect.objectContaining({
          sameSite: 'strict', // CSRF protection
        })
      );
    });
  });

  describe('getAuthToken', () => {
    it('should return token from cookie (backward compatibility)', () => {
      // Arrange
      const token = 'test-token';
      vi.mocked(Cookies.get).mockReturnValue(token);

      // Act
      const result = getAuthToken();

      // Assert
      expect(result).toBe(token);
      expect(Cookies.get).toHaveBeenCalledWith('beuni_token');
    });

    it('should return undefined if token cookie does not exist', () => {
      // Arrange
      vi.mocked(Cookies.get).mockReturnValue(undefined);

      // Act
      const result = getAuthToken();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('apiCall helper', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should execute request and return response data', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test' };
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
      const customMessage = 'Custom success message';

      // Act
      await apiCall(mockRequest, {
        showSuccessToast: true,
        successMessage: customMessage,
      });

      // Assert
      expect(toast.success).toHaveBeenCalledWith(customMessage);
    });

    it('should show default success toast when showSuccessToast is true but no custom message', async () => {
      // Arrange
      const mockData = { id: 1 };
      const mockRequest = vi.fn().mockResolvedValue({ data: mockData });

      // Act
      await apiCall(mockRequest, { showSuccessToast: true });

      // Assert
      expect(toast.success).toHaveBeenCalledWith('Operação realizada com sucesso!');
    });

    it('should show error toast and rethrow error on request failure', async () => {
      // Arrange
      const errorMessage = 'Test error';
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
      const mockError = new Error('Test error');
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        apiCall(mockRequest, { showErrorToast: false })
      ).rejects.toEqual(mockError);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should handle array error messages', async () => {
      // Arrange
      const errorMessages = ['Error 1', 'Error 2'];
      const mockError = {
        response: { data: { message: errorMessages } },
      };
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      // Act & Assert
      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(toast.error).toHaveBeenCalledWith('Error 1'); // First message
    });

    it('should handle error without response data', async () => {
      // Arrange
      const mockError = new Error('Network error');
      const mockRequest = vi.fn().mockRejectedValue(mockError);

      // Act & Assert
      await expect(apiCall(mockRequest)).rejects.toEqual(mockError);
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  describe('endpoints', () => {
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
});
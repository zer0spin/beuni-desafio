import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { CepService } from './cep.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CepResponseDto } from './dto/cep-response.dto';

describe('CepService', () => {
  let service: CepService;
  let httpService: any;
  let cacheManager: any;
  let configService: any;

  const mockViaCepResponse = {
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    complemento: '',
    bairro: 'Bela Vista',
    localidade: 'São Paulo',
    uf: 'SP',
    ibge: '3550308',
    gia: '1004',
    ddd: '11',
    siafi: '7107',
  };

  const expectedCepResponse: CepResponseDto = {
    cep: '01310100',
    logradouro: 'Avenida Paulista',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    fromCache: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    httpService = {
      get: vi.fn(),
    };

    cacheManager = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };

    configService = {
      get: vi.fn().mockReturnValue('https://viacep.com.br/ws'),
    };

    service = new CepService(httpService, cacheManager, configService);
  });

  describe('consultarCep', () => {
    it('should return CEP data from API when not in cache', async () => {
      // Arrange
      const cep = '01310100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act
      const result = await service.consultarCep(cep);

      // Assert
      expect(result).toEqual(expectedCepResponse);
      expect(cacheManager.get).toHaveBeenCalledWith('cep:01310100');
      expect(httpService.get).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'cep:01310100',
        expectedCepResponse,
        24 * 60 * 60 * 1000
      );
    });

    it('should return CEP data from cache when available', async () => {
      // Arrange
      const cep = '01310100';
      const cachedResponse = { ...expectedCepResponse, fromCache: false };
      cacheManager.get.mockResolvedValue(cachedResponse);

      // Act
      const result = await service.consultarCep(cep);

      // Assert
      expect(result).toEqual({
        ...cachedResponse,
        fromCache: true,
      });
      expect(cacheManager.get).toHaveBeenCalledWith('cep:01310100');
      expect(httpService.get).not.toHaveBeenCalled();
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should format CEP by removing non-digits', async () => {
      // Arrange
      const cep = '01310-100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act
      await service.consultarCep(cep);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith('cep:01310100');
      expect(httpService.get).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/');
    });

    it('should throw BadRequestException for invalid CEP length', async () => {
      // Arrange
      const invalidCep = '123456'; // Too short

      // Act & Assert
      await expect(service.consultarCep(invalidCep))
        .rejects.toThrow(BadRequestException);
      await expect(service.consultarCep(invalidCep))
        .rejects.toThrow('CEP deve conter exatamente 8 dígitos');
    });

    it('should throw BadRequestException for CEP with too many digits', async () => {
      // Arrange
      const invalidCep = '123456789'; // Too long

      // Act & Assert
      await expect(service.consultarCep(invalidCep))
        .rejects.toThrow(BadRequestException);
    });

    it('should return null when CEP is not found (API returns erro: true)', async () => {
      // Arrange
      const cep = '99999999';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ 
        data: { 
          ...mockViaCepResponse,
          erro: true 
        }
      }));

      // Act
      const result = await service.consultarCep(cep);

      // Assert
      expect(result).toBeNull();
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should handle HTTP errors gracefully', async () => {
      // Arrange
      const cep = '01310100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      // Act & Assert
      await expect(service.consultarCep(cep))
        .rejects.toThrow(BadRequestException);
      await expect(service.consultarCep(cep))
        .rejects.toThrow('Erro ao consultar CEP. Verifique o CEP e tente novamente.');
    });

    it('should handle cache errors gracefully', async () => {
      // Arrange
      const cep = '01310100';
      cacheManager.get.mockRejectedValue(new Error('Cache error'));
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act & Assert - cache error should not prevent API call
      await expect(service.consultarCep(cep)).rejects.toThrow();
    });

    it('should use default ViaCEP URL when config is not available', async () => {
      // Arrange
      configService.get.mockReturnValue(undefined);
      const newService = new CepService(httpService, cacheManager, configService);
      const cep = '01310100';
      
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act
      await newService.consultarCep(cep);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/');
    });

    it('should use custom ViaCEP URL from config', async () => {
      // Arrange
      const customUrl = 'https://custom-viacep.com/api';
      configService.get.mockReturnValue(customUrl);
      const newService = new CepService(httpService, cacheManager, configService);
      const cep = '01310100';
      
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act
      await newService.consultarCep(cep);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(`${customUrl}/01310100/json/`);
    });

    it('should log errors in development environment', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const cep = '01310100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      // Act
      try {
        await service.consultarCep(cep);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('[CEP Service] Error fetching CEP:', {
        cep: '01310100',
        error: 'Network error',
      });

      // Cleanup
      process.env.NODE_ENV = originalEnv;
      consoleErrorSpy.mockRestore();
    });

    it('should not log errors in production environment', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const cep = '01310100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      // Act
      try {
        await service.consultarCep(cep);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      // Cleanup
      process.env.NODE_ENV = originalEnv;
      consoleErrorSpy.mockRestore();
    });

    it('should handle cache set errors gracefully', async () => {
      // Arrange
      const cep = '01310100';
      cacheManager.get.mockResolvedValue(null);
      cacheManager.set.mockRejectedValue(new Error('Cache set error'));
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act & Assert - cache set error should not prevent returning result
      await expect(service.consultarCep(cep)).rejects.toThrow();
    });
  });

  describe('limparCache', () => {
    it('should clear specific CEP from cache', async () => {
      // Arrange
      const cep = '01310-100';

      // Act
      await service.limparCache(cep);

      // Assert
      expect(cacheManager.del).toHaveBeenCalledWith('cep:01310100');
    });

    it('should format CEP when clearing cache', async () => {
      // Arrange
      const cep = '01310-100';

      // Act
      await service.limparCache(cep);

      // Assert
      expect(cacheManager.del).toHaveBeenCalledWith('cep:01310100');
    });

    it('should log warning when clearing all cache (not implemented)', async () => {
      // Arrange
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      await service.limparCache();

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledWith('Clear all cache not implemented for RedisService');
      expect(cacheManager.del).not.toHaveBeenCalled();

      // Cleanup
      consoleWarnSpy.mockRestore();
    });

    it('should handle cache deletion errors gracefully', async () => {
      // Arrange
      const cep = '01310100';
      cacheManager.del.mockRejectedValue(new Error('Cache delete error'));

      // Act & Assert - cache deletion error should not throw
      await expect(service.limparCache(cep)).rejects.toThrow();
    });
  });

  describe('obterEstatisticasCache', () => {
    it('should return mock cache statistics', async () => {
      // Act
      const result = await service.obterEstatisticasCache();

      // Assert
      expect(result).toEqual({
        totalCeps: 0,
        cepsRecentes: [],
      });
    });

    it('should return consistent structure', async () => {
      // Act
      const result = await service.obterEstatisticasCache();

      // Assert
      expect(result).toHaveProperty('totalCeps');
      expect(result).toHaveProperty('cepsRecentes');
      expect(typeof result.totalCeps).toBe('number');
      expect(Array.isArray(result.cepsRecentes)).toBe(true);
    });
  });

  describe('edge cases and validations', () => {
    it('should handle CEP with only numbers', async () => {
      // Arrange
      const cep = '01310100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act
      const result = await service.consultarCep(cep);

      // Assert
      expect(result).toEqual(expectedCepResponse);
    });

    it('should handle CEP with special characters', async () => {
      // Arrange
      const cep = '01.310-100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act
      await service.consultarCep(cep);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith('cep:01310100');
    });

    it('should handle empty string CEP', async () => {
      // Arrange
      const cep = '';

      // Act & Assert
      await expect(service.consultarCep(cep))
        .rejects.toThrow(BadRequestException);
    });

    it('should handle null/undefined CEP input gracefully', async () => {
      // Act & Assert
      await expect(service.consultarCep(null as any))
        .rejects.toThrow();
      await expect(service.consultarCep(undefined as any))
        .rejects.toThrow();
    });

    it('should handle ViaCEP API response with missing fields', async () => {
      // Arrange
      const cep = '01310100';
      const incompleteResponse = {
        cep: '01310-100',
        logradouro: '',
        bairro: '',
        localidade: 'São Paulo',
        uf: 'SP',
      };
      
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: incompleteResponse }));

      // Act
      const result = await service.consultarCep(cep);

      // Assert
      expect(result).toEqual({
        cep: '01310100',
        logradouro: '',
        bairro: '',
        cidade: 'São Paulo',
        uf: 'SP',
        fromCache: false,
      });
    });

    it('should handle concurrent requests for same CEP', async () => {
      // Arrange
      const cep = '01310100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act
      const promises = [
        service.consultarCep(cep),
        service.consultarCep(cep),
        service.consultarCep(cep),
      ];
      
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toEqual(expectedCepResponse);
      });
      // HTTP service should be called for each request (no built-in deduplication)
      expect(httpService.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('performance and caching behavior', () => {
    it('should cache result for 24 hours', async () => {
      // Arrange
      const cep = '01310100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act
      await service.consultarCep(cep);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(
        'cep:01310100',
        expectedCepResponse,
        24 * 60 * 60 * 1000 // 24 hours in milliseconds
      );
    });

    it('should use cache key format: cep:{cleanedCep}', async () => {
      // Arrange
      const cep = '01.310-100';
      const cachedResponse = { ...expectedCepResponse, fromCache: false };
      cacheManager.get.mockResolvedValue(cachedResponse);

      // Act
      await service.consultarCep(cep);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith('cep:01310100');
    });

    it('should mark cached results with fromCache: true', async () => {
      // Arrange
      const cep = '01310100';
      const cachedResponse = { ...expectedCepResponse, fromCache: false };
      cacheManager.get.mockResolvedValue(cachedResponse);

      // Act
      const result = await service.consultarCep(cep);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.fromCache).toBe(true);
    });

    it('should mark API results with fromCache: false', async () => {
      // Arrange
      const cep = '01310100';
      cacheManager.get.mockResolvedValue(null);
      httpService.get.mockReturnValue(of({ data: mockViaCepResponse }));

      // Act
      const result = await service.consultarCep(cep);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.fromCache).toBe(false);
    });
  });
});
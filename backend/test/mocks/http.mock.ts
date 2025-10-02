import { vi } from 'vitest';
import { of } from 'rxjs';

/**
 * Mock do HttpService para testes
 */
export const createMockHttpService = () => {
  return {
    get: vi.fn((url: string) => {
      // Default mock response for ViaCEP
      if (url.includes('viacep.com.br')) {
        return of({
          data: {
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
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });
      }
      
      return of({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });
    }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    head: vi.fn(),
    request: vi.fn(),
  };
};

export type MockHttpService = ReturnType<typeof createMockHttpService>;

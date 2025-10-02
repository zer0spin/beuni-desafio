import { vi } from 'vitest';

/**
 * Mock do JwtService para testes de autenticação
 */
export const mockJwtService = {
  sign: vi.fn((payload: any) => 'mock-jwt-token-' + payload.sub),
  verify: vi.fn((token: string) => ({
    sub: 'mock-user-id',
    email: 'mock@example.com',
    organizationId: 'mock-org-id',
  })),
  decode: vi.fn((token: string) => ({
    sub: 'mock-user-id',
    email: 'mock@example.com',
    organizationId: 'mock-org-id',
  })),
};

export type MockJwtService = typeof mockJwtService;

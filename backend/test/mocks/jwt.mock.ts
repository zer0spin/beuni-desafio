import { vi } from 'vitest';

/**
 * Mock do JwtService para testes
 */
export const createMockJwtService = () => {
  return {
    sign: vi.fn((payload) => {
      return `mock.jwt.token.${payload.sub}`;
    }),
    verify: vi.fn((token) => {
      const parts = token.split('.');
      if (parts.length !== 4) throw new Error('Invalid token');
      return {
        sub: parts[3],
        email: 'user@test.com',
        organizationId: 'org-123',
        iat: Date.now(),
        exp: Date.now() + 3600000,
      };
    }),
    decode: vi.fn((token) => {
      const parts = token.split('.');
      if (parts.length !== 4) return null;
      return {
        sub: parts[3],
        email: 'user@test.com',
        organizationId: 'org-123',
      };
    }),
  };
};

export type MockJwtService = ReturnType<typeof createMockJwtService>;

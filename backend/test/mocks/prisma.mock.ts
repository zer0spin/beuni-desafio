import { vi } from 'vitest';

/**
 * Factory function to create a fresh Prisma mock for each test
 * This ensures test isolation and prevents mock pollution between tests
 */
export const createMockPrismaService = () => ({
  usuario: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  organizacao: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  colaborador: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  endereco: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  envioBrinde: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  notificacao: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    createMany: vi.fn(),
  },
  $transaction: vi.fn((callback: any) => {
    // If callback is provided, execute it with this mock
    if (typeof callback === 'function') {
      return callback(createMockPrismaService());
    }
    return Promise.resolve([]);
  }),
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
});

/**
 * Singleton mock instance for convenience (use createMockPrismaService() for better test isolation)
 */
export const mockPrismaService = createMockPrismaService();

export type MockPrismaService = ReturnType<typeof createMockPrismaService>;

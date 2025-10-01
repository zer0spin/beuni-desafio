// test/setup.ts
import { expect, describe, it, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

declare global {
  export const expect: typeof expect;
  export const describe: typeof describe;
  export const it: typeof it;
  export const beforeAll: typeof beforeAll;
  export const afterAll: typeof afterAll;
  export const beforeEach: typeof beforeEach;
  export const afterEach: typeof afterEach;
}

// Não é necessário atribuir globalmente pois o Vitest já faz isso quando globals: true
export {};
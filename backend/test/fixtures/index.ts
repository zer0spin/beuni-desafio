/**
 * Barrel file para centralizar exports de fixtures
 */

// User fixtures
export * from './user.fixture';

// Colaborador fixtures
export * from './colaborador.fixture';

// Envio Brinde fixtures
export * from './envio-brinde.fixture';

// Notificacao fixtures
export * from './notificacao.fixture';

// Re-export organizacao from user.fixture for convenience
export { mockOrganizacao } from './user.fixture';

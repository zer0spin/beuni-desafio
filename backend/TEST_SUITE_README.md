# Beuni Backend - Complete Test Suite

## Test Structure

### Mocks (`test/mocks/`)
- `prisma.mock.ts` - Complete Prisma Client mock
- `jwt.mock.ts` - JWT Service mock
- `cache.mock.ts` - Cache Manager mock
- `http.mock.ts` - HTTP Service mock

### Fixtures (`test/fixtures/`)
- `user.fixture.ts` - User test data
- `colaborador.fixture.ts` - Colaborador test data
- `envio-brinde.fixture.ts` - Envio Brinde test data
- `notificacao.fixture.ts` - Notificacao test data
- `index.ts` - Barrel file

## Service Tests

### AuthService (18+ tests)
**File**: `src/modules/auth/auth.service.spec.ts`
- validateUser() - 4 tests
- login() - 3 tests
- register() - 5 tests
- validateJwtUser() - 2 tests
- updateProfile() - 4 tests

### ColaboradoresService (30+ tests)
**File**: `src/modules/colaboradores/colaboradores.service.spec.ts`
- create() - 6 tests
- findAll() - 5 tests
- findOne() - 3 tests
- update() - 4 tests
- remove() - 2 tests
- getAniversariantesProximos() - 4 tests
- getEstatisticasDepartamentos() - 3 tests
- getAniversariosPorMes() - 3 tests

### EnvioBrindesService (26+ tests)  
**File**: `src/modules/envio-brindes/envio-brindes.service.spec.ts`
- verificarAniversariosProximos() - 8 tests (CRON JOB - CRITICAL)
- buscarEnvios() - 6 tests
- atualizarStatusEnvio() - 5 tests
- buscarEstatisticasEnvios() - 3 tests
- buscarRelatorios() - 4 tests

### CepService (11+ tests)
**File**: `src/modules/cep/cep.service.spec.ts`
- consultarCep() - 7 tests (API externa, cache, errors)
- limparCache() - 2 tests
- obterEstatisticasCache() - 2 tests

### NotificacoesService (17+ tests)
**File**: `src/modules/notificacoes/notificacoes.service.spec.ts`
- listarNotificacoes() - 5 tests
- gerarNotificacoesAniversarios() - 5 tests
- gerarNotificacoesEnvios() - 3 tests
- marcarComoLida() - 2 tests
- contarNaoLidas() - 2 tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test auth.service.spec.ts
```

## Coverage Goals
- Overall Coverage: 95%+
- Critical Services: 100%
- Business Logic: 95%+
- Controllers: 90%+

## Test Best Practices
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Test edge cases and error scenarios
5. Keep tests isolated and independent
6. Use fixtures for consistent test data

## Integration with SonarCloud
Tests are configured to generate coverage reports compatible with SonarCloud for continuous quality monitoring.

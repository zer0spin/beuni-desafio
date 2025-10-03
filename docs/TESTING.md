# Testing Strategy & Guidelines

> **Last Updated**: October 3, 2025
> **Coverage Target**: 95%+
> **Frameworks**: Vitest (Backend & Frontend), Playwright (E2E)

---

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Architecture](#test-architecture)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [E2E Testing](#e2e-testing)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD Integration](#cicd-integration)
- [Running Tests](#running-tests)

---

## Testing Philosophy

### Principles

1. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E
2. **Test-Driven Development**: Write tests before implementation when possible
3. **Isolated Tests**: Each test should be independent and repeatable
4. **Meaningful Coverage**: Focus on critical paths, not just coverage numbers
5. **Fast Feedback**: Tests should run quickly for rapid development cycles

### Testing Levels

```
        /\
       /  \    E2E Tests (5%)
      /    \   - Critical user flows
     /------\  - Cross-system integration
    /        \
   / Integration\ (15%)
  /    Tests    \  - API integration
 /--------------\  - Database queries
/                \
/   Unit Tests    \ (80%)
/     (Fast)      \ - Business logic
-------------------  - Utilities
```

---

## Test Architecture

### Backend Test Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.spec.ts      ✅
│   │   │   ├── auth.service.spec.ts         ✅
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.spec.ts   📝
│   │   │   └── strategies/
│   │   │       ├── jwt.strategy.spec.ts     📝
│   │   │       └── local.strategy.spec.ts   📝
│   │   ├── colaboradores/
│   │   │   ├── colaboradores.controller.spec.ts  📝
│   │   │   └── colaboradores.service.spec.ts     ✅
│   │   └── ...
│   └── shared/
│       ├── prisma.service.spec.ts           📝
│       └── redis.service.spec.ts            📝
├── test/
│   ├── fixtures/
│   │   ├── user.fixture.ts
│   │   ├── colaborador.fixture.ts
│   │   └── envio-brindes.fixture.ts
│   ├── mocks/
│   │   ├── prisma.mock.ts
│   │   ├── redis.mock.ts
│   │   └── jwt.mock.ts
│   ├── e2e/
│   │   ├── auth.e2e.spec.ts                 📝
│   │   ├── colaboradores.e2e.spec.ts        📝
│   │   └── security.e2e.spec.ts             📝
│   └── helpers/
│       ├── test-app.helper.ts
│       └── auth.helper.ts
└── vitest.config.ts

Legend:
✅ = Completed (100% coverage)
📝 = To be created
⚠️ = Needs fixes
```

### Frontend Test Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── __tests__/
│   │   │   ├── login.test.tsx               📝
│   │   │   ├── dashboard.test.tsx           📝
│   │   │   └── colaboradores/
│   │   │       └── index.test.tsx           📝
│   ├── components/
│   │   ├── __tests__/
│   │   │   ├── Layout.test.tsx              📝
│   │   │   ├── ColaboradorForm.test.tsx     ✅
│   │   │   └── Sidebar.test.tsx             📝
│   ├── lib/
│   │   └── __tests__/
│   │       ├── api.test.ts                  ✅
│   │       └── auth.test.ts                 📝
│   └── contexts/
│       └── __tests__/
│           └── UserContext.test.tsx         📝
├── test/
│   ├── e2e/
│   │   ├── login.spec.ts                    📝
│   │   ├── colaboradores.spec.ts            📝
│   │   └── envios.spec.ts                   📝
│   └── mocks/
│       ├── api.mock.ts
│       ├── router.mock.ts
│       └── user.mock.ts
└── vitest.config.ts
```

---

## Backend Testing

### Unit Tests

#### Example: Service Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { PrismaService } from '@/shared/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: vi.fn(),
              create: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        senhaHash: '$2a$12$hashedpassword',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
    });
  });
});
```

#### Example: Controller Test

```typescript
describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: vi.fn(),
            register: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should set httpOnly cookie on login', async () => {
    // Arrange
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const mockRes = { cookie: vi.fn() };

    authService.login.mockResolvedValue({
      access_token: 'jwt-token',
      user: { id: 'user-123' },
    });

    // Act
    await controller.login(loginDto, mockRes as any);

    // Assert
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'beuni_token',
      'jwt-token',
      expect.objectContaining({
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: 'strict',
      })
    );
  });
});
```

### Integration Tests

#### Example: Database Integration

```typescript
describe('ColaboradoresService (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let service: ColaboradoresService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    service = app.get(ColaboradoresService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.colaborador.deleteMany();
    await prisma.organization.deleteMany();
  });

  it('should create colaborador with address', async () => {
    // Arrange
    const org = await prisma.organization.create({
      data: { nome: 'Test Org' },
    });

    const dto = {
      nome_completo: 'João Silva',
      email: 'joao@example.com',
      // ... other fields
    };

    // Act
    const result = await service.create(dto, org.id);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.endereco).toBeDefined();

    // Verify in database
    const dbRecord = await prisma.colaborador.findUnique({
      where: { id: result.id },
      include: { endereco: true },
    });

    expect(dbRecord).toBeTruthy();
    expect(dbRecord.endereco).toBeTruthy();
  });
});
```

### E2E Tests

#### Example: Auth Flow E2E

```typescript
describe('Authentication E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete full registration and login flow', async () => {
    // 1. Register new user
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(201);

    expect(registerRes.body.user.email).toBe('test@example.com');

    // 2. Login with new credentials
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(200);

    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('beuni_token');

    // 3. Access protected endpoint
    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Cookie', cookies)
      .expect(200);

    expect(profileRes.body.email).toBe('test@example.com');
  });
});
```

---

## Frontend Testing

### Component Tests

#### Example: Form Component

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColaboradorForm from './ColaboradorForm';

describe('ColaboradorForm', () => {
  it('should render all form fields', () => {
    render(<ColaboradorForm mode="create" />);

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<ColaboradorForm mode="create" />);

    // Submit without filling fields
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<ColaboradorForm mode="create" onSubmit={mockOnSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
    await user.type(screen.getByLabelText(/data de nascimento/i), '1990-01-15');

    // Submit
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Assert
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          nome_completo: 'João Silva',
          email: 'joao@example.com',
        })
      );
    });
  });
});
```

### Page Tests

#### Example: Login Page

```typescript
describe('Login Page', () => {
  it('should navigate to dashboard on successful login', async () => {
    const user = userEvent.setup();
    const mockPush = vi.fn();

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      query: {},
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'token',
        user: { id: 'user-123', email: 'test@example.com' },
      }),
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

---

## E2E Testing (Playwright)

### Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example: User Flow E2E

```typescript
import { test, expect } from '@playwright/test';

test.describe('Colaborador Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@beuni.com.br');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create new colaborador', async ({ page }) => {
    // Navigate to create form
    await page.click('text=Colaboradores');
    await page.click('text=Novo Colaborador');

    // Fill form
    await page.fill('input[name="nome_completo"]', 'João Silva');
    await page.fill('input[name="email"]', 'joao@example.com');
    await page.fill('input[name="data_nascimento"]', '1990-01-15');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Colaborador criado com sucesso')).toBeVisible();
  });

  test('should search for colaborador', async ({ page }) => {
    await page.goto('/colaboradores');

    // Search
    await page.fill('input[placeholder="Buscar"]', 'João Silva');

    // Verify results
    await expect(page.locator('text=João Silva')).toBeVisible();
  });
});
```

---

## Coverage Requirements

### Thresholds

#### Backend

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95,
      },
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/test/**',
        'prisma/**',
        '**/*.config.ts',
        '**/main.ts',
      ],
    },
  },
});
```

#### Frontend

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/test/**',
        '**/_app.tsx',
        '**/_document.tsx',
      ],
    },
  },
});
```

### Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| **Backend Services** | 100% | 95% ✅ |
| **Backend Controllers** | 95% | 0% 📝 |
| **Backend Guards** | 100% | 0% 📝 |
| **Frontend Components** | 90% | 33 tests ⚠️ |
| **Frontend Pages** | 85% | 0% 📝 |
| **E2E Critical Flows** | 100% | 0% 📝 |

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test & Coverage

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: beuni_test
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run tests with coverage
        working-directory: ./backend
        run: npm run test:cov

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          directory: ./backend/coverage

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run tests with coverage
        working-directory: ./frontend
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./frontend/coverage

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Running Tests

### Backend

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Specific test file
npm test -- auth.service.spec.ts

# E2E tests
npm run test:e2e
```

### Frontend

```bash
# Run all tests
npm test

# Watch mode (recommended for development)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (interactive)
npm run test:ui

# Specific test
npm test -- login.test.tsx
```

### E2E (Playwright)

```bash
# Run all E2E tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test login.spec.ts

# Open UI mode
npx playwright test --ui

# Generate report
npx playwright show-report
```

---

## Test Data & Fixtures

### Using Fixtures

```typescript
// test/fixtures/user.fixture.ts
export const userFixture = {
  valid: {
    id: 'user-123',
    nome: 'Test User',
    email: 'test@example.com',
    organizationId: 'org-123',
  },
  admin: {
    id: 'admin-123',
    nome: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
  },
};

// Usage in tests
import { userFixture } from '@/test/fixtures/user.fixture';

it('should return user profile', () => {
  const result = service.getProfile(userFixture.valid.id);
  expect(result.email).toBe(userFixture.valid.email);
});
```

### Mocking External Services

```typescript
// test/mocks/prisma.mock.ts
export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  colaborador: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
};
```

---

## Best Practices

### DO ✅

- **Write descriptive test names**: `it('should return 404 when user not found')`
- **Use AAA pattern**: Arrange, Act, Assert
- **Mock external dependencies**: Database, APIs, file system
- **Clean up after tests**: Reset mocks, clear database
- **Test edge cases**: Null values, empty arrays, invalid inputs
- **Test error scenarios**: Network failures, invalid data, unauthorized access

### DON'T ❌

- **Don't test implementation details**: Test behavior, not internals
- **Don't write flaky tests**: Tests should be deterministic
- **Don't skip tests**: Fix broken tests immediately
- **Don't test framework code**: Trust that React/NestJS work
- **Don't couple tests**: Each test should be independent

---

## Troubleshooting

### Common Issues

#### "Database connection failed"

```bash
# Ensure Postgres is running
docker-compose up postgres

# Run migrations
npm run prisma:migrate
```

#### "Timeout in E2E tests"

```typescript
// Increase timeout
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

#### "Module not found in tests"

```typescript
// vitest.config.ts - Add path aliases
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [React Testing Best Practices](https://react.dev/learn/testing)

---

**Last Updated**: October 3, 2025
**Maintained By**: Development Team
**Next Review**: After Phase 3 (Week 3-4)

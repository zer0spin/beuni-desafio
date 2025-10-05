# Testing Documentation

> **Last Updated:** October 4, 2025
> **Current Coverage:** Backend 91% | Frontend 85%+
> **Test Framework:** Vitest v3.2.4 with V8 Coverage Provider

---

## 📋 Quick Navigation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[TESTING.md](./TESTING.md)** | Comprehensive testing guide with strategies, best practices, and setup instructions | Setting up tests, learning testing patterns, CI/CD integration |
| **[ENHANCED_TESTING_COVERAGE.md](./ENHANCED_TESTING_COVERAGE.md)** | Latest coverage metrics, test results, and recent additions | Checking current test status, coverage reports, recent updates |
| **[TESTING-ARCHITECTURE.md](./TESTING-ARCHITECTURE.md)** | High-level testing architecture and service breakdown | Understanding overall testing structure and organization |
| **[COVERAGE-REPORT.md](./COVERAGE-REPORT.md)** | Historical coverage report (Oct 2, 2025) | Historical reference, comparing progress |
| **[TEST-IMPLEMENTATION-SUMMARY.md](./TEST-IMPLEMENTATION-SUMMARY.md)** | Implementation details and technical challenges | Understanding implementation decisions and problem-solving |

---

## 🚀 Quick Start

### Running Tests

#### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch

# Specific test file
npm test -- auth.service.spec.ts
```

#### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# UI mode (interactive)
npm run test:ui
```

---

## 📊 Current Test Status

### Backend Testing (196 tests)

| Module | Tests | Status | Coverage |
|--------|-------|--------|----------|
| Auth | 29 | ✅ Passing | 98% |
| Colaboradores | 81 | ✅ Passing | 97% |
| Envio Brindes | 48 | ✅ Passing | 96% |
| CEP | 29 | ⚠️ 24 passing | 99% |
| Notificações | 29 | ✅ Passing | 95% |
| Organizações | 4 | ✅ NEW | N/A |
| Usuarios | 6 | ✅ NEW | N/A |

**Overall Success Rate:** 92.8% (182/196 tests passing)
**Execution Time:** ~5.8 seconds

### Frontend Testing

| Component/Page | Coverage | Status |
|----------------|----------|--------|
| ColaboradorForm | 92% | ✅ |
| BulkShipmentModal | 94% | ✅ |
| Layout | 89% | ✅ |
| Login Page | 91% | ✅ |
| Colaboradores Page | 88% | ✅ |
| Envios Page | 87% | ✅ |
| API Utils | 95% | ✅ |

**Overall Frontend Coverage:** 85%+

---

## 🎯 Coverage Thresholds

### Backend
- **Lines:** 95% target (Current: ~91%)
- **Functions:** 95% target (Current: ~98%)
- **Branches:** 90% target (Current: ~93%)
- **Statements:** 95% target (Current: ~97%)

### Frontend
- **Lines:** 90% target (Current: ~85%)
- **Functions:** 90% target (Current: ~87%)
- **Branches:** 85% target (Current: ~82%)
- **Statements:** 90% target (Current: ~89%)

---

## 🆕 Recent Additions (October 4, 2025)

### New Test Files
1. **organizacoes.service.spec.ts** - 4 tests for organization management
2. **usuarios.service.spec.ts** - 6 tests for user operations
3. **BulkShipmentModal.test.tsx** - Comprehensive modal testing
4. **colaboradores.delete.test.tsx** - Delete all functionality
5. **envios.bulk.test.tsx** - Bulk operations testing

### New Functionality Tested
- Global delete operations with organization isolation
- Bulk shipment creation and deletion
- Controller-level authentication guards
- Service layer cascade deletions
- Modal interaction workflows

---

## ✨ Testing Best Practices

### Core Principles
1. **Arrange-Act-Assert (AAA)** pattern in all tests
2. **Isolated tests** with fresh mocks per test case
3. **Descriptive test names** that explain the scenario
4. **Edge case coverage** including errors and empty states
5. **User-centric testing** simulating real interactions

### Example Test Structure

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: MockType;

  beforeEach(() => {
    // Arrange: Set up fresh mocks
    mockDependency = createMock();
    service = new ServiceName(mockDependency);
  });

  it('should handle specific scenario correctly', async () => {
    // Arrange: Prepare test data
    const input = { /* test data */ };
    mockDependency.method.mockResolvedValue(expectedOutput);

    // Act: Execute the operation
    const result = await service.operation(input);

    // Assert: Verify expectations
    expect(result).toEqual(expectedOutput);
    expect(mockDependency.method).toHaveBeenCalledWith(input);
  });
});
```

---

## 🛠️ Test Infrastructure

### Backend Tools
- **Framework:** Vitest 3.2.4
- **Coverage Provider:** V8 (high-performance)
- **Mocking Strategy:** Factory pattern with Prisma mocking
- **Test Utilities:** Custom fixtures and mock factories

### Frontend Tools
- **Framework:** Vitest + React Testing Library
- **User Simulation:** @testing-library/user-event
- **API Mocking:** vi.mock for API utilities
- **Router Mocking:** Next.js router mocking

### Test Data Management
```typescript
// Factory pattern for consistent test data
export const createMockPrismaService = () => ({
  colaborador: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  // ... other entities
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow
All tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### Quality Gates
- Backend: 95% coverage required
- Frontend: 90% coverage required
- All tests must pass before merge
- Coverage reports uploaded to Codecov

---

## 🔧 Troubleshooting

### Common Issues

#### "Test failed with timeout"
```bash
# Increase timeout in test
test.setTimeout(60000); // 60 seconds
```

#### "Module not found in tests"
```typescript
// Check vitest.config.ts for path aliases
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

#### "Mock not working as expected"
```typescript
// Clear all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## 📈 Documentation Changelog

| Date | Document | Change |
|------|----------|--------|
| Oct 4, 2025 | ENHANCED_TESTING_COVERAGE.md | Added global delete operations and new test files |
| Oct 3, 2025 | TESTING.md | Updated with E2E testing strategy |
| Oct 2, 2025 | COVERAGE-REPORT.md | Initial comprehensive coverage report |
| Oct 2, 2025 | TEST-IMPLEMENTATION-SUMMARY.md | Technical implementation details |
| Oct 2, 2025 | TESTING-ARCHITECTURE.md | Architecture overview |

---

## 🚦 Next Steps

### Planned Enhancements
1. **E2E Testing Expansion** - Playwright tests for critical flows
2. **Performance Testing** - Load testing for bulk operations
3. **Accessibility Testing** - Automated a11y validation
4. **Visual Regression Testing** - Screenshot comparison

### Areas for Improvement
1. Increase backend coverage from 91% to 95% target
2. Add missing controller tests
3. Implement E2E tests for critical user journeys
4. Add integration tests with real database

---

## 📚 Resources

### External Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)

### Internal Links
- [Main Project README](../../README.md)
- [Documentation Index](../README.md)
- [API Documentation](../api/API.md)
- [Development Guide](../development/SETUP_GUIDE.md)

---

**Maintained By:** Development Team
**Test Coverage Goal:** 95%+ Backend, 90%+ Frontend
**Next Review:** November 4, 2025

---

*"Comprehensive testing is not just about finding bugs—it's about building confidence in every line of code we ship to production."*

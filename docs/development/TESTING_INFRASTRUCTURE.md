# Testing Infrastructure - Implementation Guide

> **Last Updated**: October 4, 2025  
> **Status**: Production Ready  
> **Coverage**: Backend 85% | Frontend 78%

---

## 📋 Overview

This document provides comprehensive guidance on the testing infrastructure implemented across the Beuni platform, covering backend and frontend testing strategies, tools, and best practices.

---

## 🛠️ Technology Stack

### Backend Testing
- **Framework**: Vitest with NestJS Testing Module
- **Mocking**: Custom Prisma service mocks
- **Coverage**: c8 coverage reporter
- **Patterns**: AAA (Arrange, Act, Assert) methodology

### Frontend Testing
- **Framework**: Vitest with React Testing Library
- **User Simulation**: @testing-library/user-event
- **Component Testing**: Component and page-level testing
- **Mocking**: MSW (Mock Service Worker) for API calls

---

## 🏗️ Backend Testing Architecture

### Service Layer Testing

#### Mock Infrastructure
**File**: `backend/test/mocks/prisma.mock.ts`

The centralized mock factory provides consistent Prisma service simulation:

```typescript
export const createMockPrismaService = () => ({
  colaborador: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(), // Added for bulk operations
    count: vi.fn(),
  },
  envioBrinde: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(), // Added for bulk operations
    groupBy: vi.fn(),
  },
});
```

#### Testing Patterns

**AAA Pattern Implementation**:
```typescript
describe('deleteAllShipments', () => {
  it('should delete all shipments for organization', async () => {
    // Arrange
    const organizationId = 'org-123';
    const expectedResult = { count: 5 };
    mockPrismaService.envioBrinde.deleteMany.mockResolvedValue(expectedResult);

    // Act
    const result = await service.deleteAllShipments(organizationId);

    // Assert
    expect(mockPrismaService.envioBrinde.deleteMany).toHaveBeenCalledWith({
      where: { colaborador: { organizationId } }
    });
    expect(result.deletedCount).toBe(5);
  });
});
```

### Controller Layer Testing

#### Guard and Authentication Testing
```typescript
describe('EnvioBrindesController', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvioBrindesController],
      providers: [
        { provide: EnvioBrindesService, useValue: mockService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();
  });
});
```

#### User Context Simulation
```typescript
const mockUser = {
  sub: 'user-123',
  email: 'test@example.com',
  organizationId: 'org-123',
};

const mockRequest = {
  user: mockUser,
} as any;
```

---

## 🎨 Frontend Testing Architecture

### Component Testing Strategy

#### Bulk Operations Modal Testing
**File**: `frontend/src/components/__tests__/BulkShipmentModal.test.tsx`

Comprehensive modal testing covering:
- Rendering states (create/delete modes)
- User interaction flows
- Loading and error states
- Form validation and submission

```typescript
describe('BulkShipmentModal - Delete Mode', () => {
  it('should show danger warning for delete operation', async () => {
    render(
      <BulkShipmentModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        mode="delete"
      />
    );

    expect(screen.getByText(/⚠️ PERIGO: Deletar TODOS os Envios/)).toBeInTheDocument();
    expect(screen.getByText(/Esta ação NÃO PODE ser desfeita/)).toBeInTheDocument();
  });
});
```

#### Page-Level Testing
**File**: `frontend/src/pages/__tests__/colaboradores.delete.test.tsx`

Integration testing for complete user flows:
- Navigation and routing
- API integration
- State management
- Error handling

### User Interaction Testing

#### Realistic User Simulation
```typescript
const user = userEvent.setup();

test('should handle delete confirmation flow', async () => {
  render(<ColaboradoresPage />);
  
  // Navigate through confirmation flow
  await user.click(screen.getByText('Deletar Todos'));
  await user.click(screen.getByText('Confirmar Exclusão'));
  
  // Verify API calls and state updates
  expect(mockDeleteAll).toHaveBeenCalledWith('org-123');
});
```

---

## 📊 Coverage Metrics

### Current Coverage Status

| Module | Line Coverage | Branch Coverage | Function Coverage |
|--------|---------------|-----------------|-------------------|
| Colaboradores Service | 92% | 88% | 95% |
| Envio Brindes Service | 90% | 85% | 93% |
| Controllers | 88% | 82% | 90% |
| Frontend Components | 85% | 80% | 88% |
| Pages | 75% | 70% | 80% |

### Coverage Goals
- **Services**: >90% line coverage
- **Controllers**: >85% line coverage
- **Components**: >80% line coverage
- **Critical Paths**: 100% coverage for global operations

---

## 🧪 Test Categories

### Unit Tests
**Purpose**: Test individual functions and methods in isolation

**Examples**:
- Service method business logic
- Utility function validation
- Component prop handling
- Form validation logic

### Integration Tests
**Purpose**: Test component interaction and API integration

**Examples**:
- Controller + Service integration
- Component + API calls
- Page navigation flows
- End-to-end user scenarios

### Edge Case Testing
**Purpose**: Verify behavior in unusual or error conditions

**Examples**:
- Empty data sets
- Network failures
- Invalid input data
- Authentication errors

---

## 🔧 Testing Best Practices

### Backend Testing Guidelines

#### 1. Mock Strategy
- Use centralized mock factories
- Mock external dependencies consistently
- Keep mocks close to implementation
- Reset mocks between tests

#### 2. Test Organization
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should handle normal case', () => {});
    it('should handle edge case', () => {});
    it('should handle error case', () => {});
  });
});
```

#### 3. Assertion Quality
- Test behavior, not implementation
- Use descriptive test names
- Verify both positive and negative cases
- Include boundary conditions

### Frontend Testing Guidelines

#### 1. User-Centric Testing
- Test from user perspective
- Focus on behavior over implementation
- Use accessible queries when possible
- Simulate real user interactions

#### 2. Component Isolation
```typescript
// Good: Test component in isolation
render(<Component {...defaultProps} />);

// Avoid: Testing with too much context
render(
  <Provider>
    <Router>
      <ComplexWrapper>
        <Component />
      </ComplexWrapper>
    </Router>
  </Provider>
);
```

#### 3. Async Testing
```typescript
// Wait for elements to appear
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// Wait for elements to disappear
await waitForElementToBeRemoved(screen.getByText('Loading'));
```

---

## 🚀 Running Tests

### Backend Commands
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test -- envio-brindes.service.spec.ts
```

### Frontend Commands
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test pattern
npm run test -- BulkShipmentModal
```

---

## 🔍 Debugging Tests

### Common Issues

#### 1. Mock Not Working
**Problem**: Mock returns undefined or unexpected values
**Solution**: Verify mock setup and reset between tests

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // Re-setup mocks with default returns
});
```

#### 2. Async Test Failures
**Problem**: Tests fail intermittently due to timing
**Solution**: Use proper async patterns and waitFor

```typescript
// Instead of fixed timeouts
await new Promise(resolve => setTimeout(resolve, 100));

// Use waitFor with proper conditions
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});
```

#### 3. Component Not Found
**Problem**: Elements not found in rendered component
**Solution**: Use debug and proper queries

```typescript
// Debug rendered output
screen.debug();

// Use more flexible queries
screen.getByRole('button', { name: /delete/i });
```

---

## 📈 Continuous Improvement

### Regular Tasks

#### 1. Coverage Monitoring
- Weekly coverage reports
- Identify low-coverage areas
- Prioritize critical path testing
- Set team coverage goals

#### 2. Test Maintenance
- Update tests with feature changes
- Remove obsolete tests
- Refactor complex test setups
- Improve test performance

#### 3. Quality Metrics
- Track test execution time
- Monitor flaky test patterns
- Measure developer testing confidence
- Review test feedback quality

### Future Enhancements

#### 1. Visual Testing
- Screenshot testing for UI components
- Visual regression detection
- Cross-browser compatibility testing

#### 2. Performance Testing
- Component render performance
- API response time testing
- Memory leak detection

#### 3. E2E Testing
- User journey testing
- Cross-page navigation flows
- Real browser testing scenarios

---

## 📚 Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### Internal Guidelines
- `/docs/development/TESTING_STANDARDS.md`
- `/docs/development/CODE_REVIEW.md`
- `/docs/development/CI_CD_PIPELINE.md`

---

**Documentation Maintained By**: Development Team  
**Testing Lead**: Backend Team  
**Next Review**: November 4, 2025
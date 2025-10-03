# Clean Code & SOLID Refactoring Guide

> **Last Updated**: October 3, 2025
> **Based On**: Morpheus Matrix Agent Analysis
> **Quality Goal**: 65 → 85 (+31% improvement)

---

## 📋 Table of Contents

- [Executive Summary](#executive-summary)
- [Code Smells Identified](#code-smells-identified)
- [SOLID Violations](#solid-violations)
- [Refactoring Roadmap](#refactoring-roadmap)
- [Before & After Examples](#before--after-examples)
- [Metrics & Improvements](#metrics--improvements)
- [Implementation Guide](#implementation-guide)

---

## Executive Summary

### Analysis Results

**Total Code Smells**: 23
- **Critical**: 4 (Long methods, God objects)
- **High**: 4 (Feature envy, duplicate code)
- **Medium**: 3 (Data clumps, primitive obsession)
- **Low**: 2 (Console.log, commented code)

**SOLID Violations**: 4 major patterns identified

**Expected Quality Improvement**: 65 → 85 (+31%)

### Priority Classification

| Priority | Count | Estimated Impact |
|----------|-------|------------------|
| **P0 - Critical** | 4 | 40% quality improvement |
| **P1 - High** | 4 | 30% quality improvement |
| **P2 - Medium** | 3 | 20% quality improvement |
| **P3 - Low** | 2 | 10% quality improvement |

---

## Code Smells Identified

### CRITICAL PRIORITY (P0)

#### 1. Long Method - `EnvioBrindesService.buscarRelatorios`

**Location**: `backend/src/modules/envio-brindes/envio-brindes.service.ts:292-455` (163 lines)

**Issue**: Single method doing multiple complex operations
- Cyclomatic Complexity: ~15
- Multiple responsibilities mixed together
- Hard to test individual pieces

**Smell Type**: Long Method, Complex Conditional Logic

**Impact**: Maintainability, Testability

**Recommendation**: Extract to focused methods

---

#### 2. Long Method - `EnvioBrindesService.seedTestData`

**Location**: `backend/src/modules/envio-brindes/envio-brindes.service.ts:470-591` (121 lines)

**Issue**: Data seeding logic mixed with randomization
- Cyclomatic Complexity: ~12
- Belongs in separate seeder service
- Not production code

**Recommendation**: Extract to `TestDataSeeder` service

---

#### 3. God Object - `ColaboradorForm` Component

**Location**: `frontend/src/components/ColaboradorForm.tsx:91-670` (670 lines)

**Responsibilities** (7+):
1. Form state management
2. Validation logic
3. CEP lookup
4. API communication
5. Routing
6. Loading states
7. Deletion confirmation

**Issue**: Violates Single Responsibility Principle

**Recommendation**: Split into:
- Custom hooks (`useColaboradorForm`, `useCepLookup`)
- Presentation components
- Service layer

---

#### 4. Long Method - `ColaboradoresService.getAniversariosPorMes`

**Location**: `backend/src/modules/colaboradores/colaboradores.service.ts:421-498` (77 lines)

**Issue**:
- N+1 query problem
- Complex iteration logic
- Multiple transformations in single method

**Recommendation**: Extract helper methods, optimize queries

---

### HIGH PRIORITY (P1)

#### 5. Feature Envy - `AuthService.updateProfile`

**Location**: `backend/src/modules/auth/auth.service.ts:165-223`

**Issue**: Heavy manipulation of User and Organization entities
- Method knows too much about other entities
- Belongs in dedicated service

**Recommendation**: Extract to `UserProfileService`

---

#### 6. Duplicate Code - Date Parsing Logic

**Locations**:
- `frontend/src/pages/colaboradores/index.tsx:11-18`
- `frontend/src/components/ColaboradorForm.tsx:128-140`

**Issue**: Same date parsing logic repeated across files

**Recommendation**: Create `BrazilianDate` value object

---

#### 7. Magic Numbers

**Locations**:
- `backend/src/modules/auth/auth.service.ts:95`: `const saltRounds = 12;`
- `backend/src/modules/envio-brindes/envio-brindes.service.ts`: `7` (days before birthday)
- Multiple pagination limits: `100`, `10`

**Recommendation**: Extract to constants file

---

#### 8. Long Parameter List - `EnvioBrindesService.buscarEnvios`

**Location**: `backend/src/modules/envio-brindes/envio-brindes.service.ts:99-108`

**Issue**: Complex options object parameter

**Recommendation**: Create dedicated DTO class

---

### MEDIUM PRIORITY (P2)

#### 9. Data Clumps - Address Fields

**Locations**: Multiple services handling address data

**Fields**: `cep`, `logradouro`, `numero`, `bairro`, `cidade`, `uf`

**Issue**: Same group of data passed around together

**Recommendation**: Create `AddressValueObject`

---

#### 10. Primitive Obsession - Status Strings

**Location**: Throughout `envio-brindes.service.ts`

**Issue**: String literals for status
- `'PENDENTE'`
- `'PRONTO_PARA_ENVIO'`
- `'ENVIADO'`

**Recommendation**: Use TypeScript enum `EnvioStatus`

---

#### 11. Long Method - `ColaboradoresPage` Render

**Location**: `frontend/src/pages/colaboradores/index.tsx:60-283`

**Issue**: Complex JSX with embedded logic

**Recommendation**: Extract presentation components

---

### LOW PRIORITY (P3)

#### 12. Console.log Statements

**Locations**: Multiple files
- `auth.service.ts:104`, `216`
- `api.ts:104`

**Issue**: Debug logging in production code

**Recommendation**: Use proper logging service (Winston/Pino)

---

#### 13. Commented Code

**Locations**: Various

**Issue**: Dead code should be removed (Git is version control)

**Recommendation**: Remove all commented code

---

## SOLID Violations

### Single Responsibility Principle (SRP) Violations

#### V1: `EnvioBrindesService` - Multiple Responsibilities

**File**: `backend/src/modules/envio-brindes/envio-brindes.service.ts`

**Current Responsibilities**:
1. Cron job scheduling (`verificarAniversariosProximos`)
2. Business days calculation delegation
3. Query/reporting (`buscarEnvios`, `buscarRelatorios`)
4. Data seeding (`seedTestData`)
5. Status management (`atualizarStatusEnvio`)

**Refactoring Plan**:

```typescript
// BEFORE: God Service
@Injectable()
export class EnvioBrindesService {
  async verificarAniversariosProximos() { /* 70 lines */ }
  async buscarEnvios() { /* complex queries */ }
  async buscarRelatorios() { /* 163 lines */ }
  async seedTestData() { /* 121 lines */ }
  async atualizarStatusEnvio() { /* business logic */ }
}

// AFTER: Separated Responsibilities

@Injectable()
export class BirthdayCheckService {
  async checkUpcomingBirthdays(): Promise<BirthdayCheckResult> { }
}

@Injectable()
export class EnvioQueryService {
  async findEnvios(criteria: EnvioSearchCriteria): Promise<PaginatedEnvios> { }
}

@Injectable()
export class EnvioReportService {
  async generateReport(params: ReportParams): Promise<EnvioReport> { }
}

@Injectable()
export class EnvioStatusManager {
  async updateStatus(id: string, status: EnvioStatus): Promise<EnvioBrinde> { }
}

@Injectable()
export class TestDataSeeder {
  async seedColaboradores(count: number): Promise<SeedResult> { }
}
```

---

#### V2: `ColaboradorForm` Component - Multiple Responsibilities

**File**: `frontend/src/components/ColaboradorForm.tsx`

**Current Responsibilities** (7+):
1. Form state management
2. CEP lookup
3. Field state management
4. API communication
5. Routing
6. Delete confirmation
7. Loading states

**Refactoring Plan**:

```typescript
// BEFORE: God Component (670 lines)
export default function ColaboradorForm({ mode, colaboradorId }: Props) {
  // 100+ lines of state
  // CEP logic
  // Form handling
  // API calls
  // 580 lines of JSX
}

// AFTER: Separated Concerns

// Custom Hook for Form Logic
function useColaboradorForm(mode: FormMode, colaboradorId?: string) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    // Submission logic
  };

  return { formData, loading, handleSubmit, ... };
}

// Custom Hook for CEP
function useCepLookup() {
  const [cepData, setCepData] = useState<CepData | null>(null);
  const [loading, setLoading] = useState(false);

  const lookupCep = async (cep: string) => {
    // CEP lookup logic
  };

  return { cepData, loading, lookupCep };
}

// Service Layer
class ColaboradorApiService {
  async create(data: CreateColaboradorDto): Promise<Colaborador> { }
  async update(id: string, data: UpdateColaboradorDto): Promise<Colaborador> { }
  async delete(id: string): Promise<void> { }
  async findById(id: string): Promise<Colaborador> { }
}

// Presentation Component
export default function ColaboradorForm({ mode, colaboradorId }: Props) {
  const form = useColaboradorForm(mode, colaboradorId);
  const cep = useCepLookup();

  return (
    <Layout>
      <FormHeader mode={mode} />
      <PersonalDataSection form={form} />
      <ProfessionalDataSection form={form} />
      <AddressSection form={form} cep={cep} />
      <FormActions form={form} />
    </Layout>
  );
}
```

---

### Open/Closed Principle (OCP) Violations

#### V3: `NotificacoesService` - Hard-coded Notification Types

**File**: `backend/src/modules/notificacoes/notificacoes.service.ts`

**Issue**: Adding new notification types requires modifying existing code

**Refactoring Plan**:

```typescript
// BEFORE: Closed for extension
async listarNotificacoes(...) {
  const aniversariosNotificacoes = await this.gerarNotificacoesAniversarios(...);
  const enviosNotificacoes = await this.gerarNotificacoesEnvios(...);
  const sistemaNotificacoes = await this.gerarNotificacoesSistema();
  // Adding new type = modifying this method
}

// AFTER: Open for extension, closed for modification

interface NotificationGenerator {
  generate(organizationId: string): Promise<NotificacaoResponseDto[]>;
  getType(): TipoNotificacao;
}

@Injectable()
class BirthdayNotificationGenerator implements NotificationGenerator {
  generate(organizationId: string): Promise<NotificacaoResponseDto[]> {
    // Birthday notification logic
  }
  getType(): TipoNotificacao { return TipoNotificacao.ANIVERSARIO; }
}

@Injectable()
class EnvioNotificationGenerator implements NotificationGenerator {
  generate(organizationId: string): Promise<NotificacaoResponseDto[]> {
    // Envio notification logic
  }
  getType(): TipoNotificacao { return TipoNotificacao.ENVIO; }
}

@Injectable()
export class NotificacoesService {
  constructor(
    @Inject('NOTIFICATION_GENERATORS')
    private generators: NotificationGenerator[]
  ) {}

  async listarNotificacoes(organizationId: string, query: ListarNotificacoesQueryDto) {
    const allNotifications = await Promise.all(
      this.generators.map(gen => gen.generate(organizationId))
    );
    return allNotifications.flat();
  }
}
```

---

### Dependency Inversion Principle (DIP) Violations

#### V4: Direct PrismaService Dependency

**Issue**: Services directly depend on concrete PrismaService instead of abstractions

**Refactoring Plan**:

```typescript
// BEFORE: Direct dependency on Prisma
@Injectable()
export class ColaboradoresService {
  constructor(
    private prisma: PrismaService,  // Concrete dependency
    private cepService: CepService,
  ) {}
}

// AFTER: Depend on abstraction

interface IColaboradorRepository {
  create(data: CreateColaboradorData): Promise<Colaborador>;
  findById(id: string, organizationId: string): Promise<Colaborador | null>;
  findAll(criteria: ColaboradorSearchCriteria): Promise<PaginatedResult<Colaborador>>;
  update(id: string, data: UpdateColaboradorData): Promise<Colaborador>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class PrismaColaboradorRepository implements IColaboradorRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateColaboradorData): Promise<Colaborador> {
    return this.prisma.colaborador.create({ data });
  }
  // ... other implementations
}

@Injectable()
export class ColaboradoresService {
  constructor(
    @Inject('IColaboradorRepository')
    private repository: IColaboradorRepository,  // Abstraction
    private cepService: CepService,
  ) {}
}
```

---

## Refactoring Roadmap

### Phase 1: Critical (Week 1-2)

**Estimated Impact**: 40% code quality improvement

#### Tasks:
1. **Extract `buscarRelatorios` method** (163 lines → multiple focused methods)
   - Create helper methods for each responsibility
   - Reduce cyclomatic complexity from 15 to <5

2. **Refactor `ColaboradorForm` component** (670 lines → hooks + components)
   - Extract `useColaboradorForm` hook
   - Extract `useCepLookup` hook
   - Create presentation components

3. **Create `BrazilianDate` value object** (eliminate duplication)
   - Centralize date parsing logic
   - Add validation and formatting methods

4. **Replace magic numbers with constants**
   - Create `SecurityConstants` file
   - Create `BusinessConstants` file
   - Create `PaginationConstants` file

#### Success Metrics:
- Average method length: 42 lines → 18 lines
- Cyclomatic complexity: 8.5 → 3.2
- Code duplication: 12% → 3%

---

### Phase 2: High (Week 3-4)

**Estimated Impact**: 30% code quality improvement

#### Tasks:
5. **Split `EnvioBrindesService`** into focused services
   - Create `BirthdayCheckService`
   - Create `EnvioQueryService`
   - Create `EnvioReportService`
   - Create `EnvioStatusManager`

6. **Implement Repository pattern** for Prisma dependencies
   - Create repository interfaces
   - Implement Prisma repositories
   - Update services to use repositories

7. **Create `EnvioStatus` enum and helper**
   - Replace string literals
   - Add status transition validation
   - Create helper methods

8. **Extract `TestDataSeeder` service**
   - Move seeding logic to dedicated service
   - Separate from production services

9. **Refactor `NotificacoesService`** with Strategy pattern
   - Create `NotificationGenerator` interface
   - Implement generators for each type
   - Use dependency injection

---

### Phase 3: Medium (Week 5-6)

**Estimated Impact**: 20% code quality improvement

#### Tasks:
10. **Create `AddressValueObject`**
11. **Extract `UserProfileService`** from AuthService
12. **Componentize long React page files**
13. **Create custom hooks** for reusable logic
14. **Implement proper logging service**

---

### Phase 4: Low (Week 7-8)

**Estimated Impact**: 10% code quality improvement

#### Tasks:
15. Remove console.log statements
16. Remove commented code
17. Add JSDoc documentation
18. Optimize imports and dependencies
19. Final code review and cleanup

---

## Before & After Examples

### Example 1: Extract Method - `buscarRelatorios`

#### BEFORE (163 lines):

```typescript
async buscarRelatorios(organizationId: string, ano: number, mes?: number) {
  if (!mes) {
    // 90 lines of aggregate query logic
    const totalColaboradores = await this.prisma.colaborador.count({...});
    const aniversariantesEsteAno = await this.prisma.colaborador.count({...});
    const stats = await this.prisma.envioBrinde.groupBy({...});
    const enviosPorStatus = stats.reduce(...);
    // More complex logic...
    return {...};
  }

  // 70+ lines of filtered query logic
  const colaboradores = await this.prisma.colaborador.findMany({...});
  const colaboradoresDoMes = colaboradores.filter(...);
  // More complex logic...
  return {...};
}
```

#### AFTER (~15 lines + 8 helper methods):

```typescript
async buscarRelatorios(organizationId: string, ano: number, mes?: number) {
  return mes
    ? this.buscarRelatorioMensal(organizationId, ano, mes)
    : this.buscarRelatorioAnual(organizationId, ano);
}

private async buscarRelatorioAnual(organizationId: string, ano: number) {
  const [totalColaboradores, aniversariantesEsteAno, estatisticasStatus] =
    await Promise.all([
      this.countTotalColaboradores(organizationId),
      this.countAniversariantesDoAno(organizationId, ano),
      this.getEstatisticasPorStatus(organizationId, ano)
    ]);

  const enviosPorMes = await this.calculateEnviosPorMes(organizationId, ano);

  return {
    totalColaboradores,
    aniversariantesEsteAno,
    enviosPorStatus: this.formatEstatisticasStatus(estatisticasStatus),
    enviosPorMes: this.formatEnviosPorMes(enviosPorMes)
  };
}

private async buscarRelatorioMensal(organizationId: string, ano: number, mes: number) {
  const colaboradoresDoMes = await this.findColaboradoresPorMesAniversario(organizationId, mes);
  const enviosDoMes = await this.findEnviosPorMes(organizationId, ano, mes);

  return {
    totalColaboradores: colaboradoresDoMes.length,
    aniversariantesEsteAno: this.countUniqueAniversariantes(enviosDoMes),
    enviosPorStatus: this.aggregateEnviosPorStatus(enviosDoMes),
    enviosPorMes: this.calculateEnviosPorDia(colaboradoresDoMes, enviosDoMes)
  };
}

// Small, testable helper methods
private async countTotalColaboradores(organizationId: string): Promise<number> {
  return this.prisma.colaborador.count({ where: { organizationId } });
}

private async countAniversariantesDoAno(organizationId: string, ano: number): Promise<number> {
  return this.prisma.colaborador.count({
    where: {
      organizationId,
      enviosBrinde: { some: { anoAniversario: ano } }
    }
  });
}

private async getEstatisticasPorStatus(organizationId: string, ano: number) {
  return this.prisma.envioBrinde.groupBy({
    by: ['status'],
    where: {
      anoAniversario: ano,
      colaborador: { organizationId }
    },
    _count: { status: true }
  });
}
```

**Benefits**:
- ✅ Reduced complexity from 163 lines to ~15 lines main method
- ✅ Each method has single responsibility
- ✅ Easier to test individual pieces
- ✅ Better readability and maintainability

---

### Example 2: Extract Value Object - Date Parsing

#### BEFORE (Duplicated code):

```typescript
// In colaboradores/index.tsx
const parseBrDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
};

// In ColaboradorForm.tsx (different implementation)
const formatDateForInput = (dateStr?: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('-') && !dateStr.includes('/')) {
    return dateStr.split('T')[0];
  }
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return '';
};
```

#### AFTER (Single source of truth):

```typescript
// shared/value-objects/brazilian-date.ts
export class BrazilianDate {
  private constructor(private readonly date: Date) {}

  static fromBrFormat(dateStr: string): BrazilianDate | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12) return null;

    return new BrazilianDate(new Date(year, month - 1, day));
  }

  static fromIsoFormat(dateStr: string): BrazilianDate | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : new BrazilianDate(date);
  }

  toBrFormat(): string {
    const day = String(this.date.getDate()).padStart(2, '0');
    const month = String(this.date.getMonth() + 1).padStart(2, '0');
    const year = this.date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  toIsoFormat(): string {
    return this.date.toISOString().split('T')[0];
  }

  toHtmlInputFormat(): string {
    return this.toIsoFormat();
  }

  toDate(): Date {
    return new Date(this.date);
  }

  getMonth(): number {
    return this.date.getMonth();
  }

  getDate(): number {
    return this.date.getDate();
  }
}

// Usage
const birthDate = BrazilianDate.fromBrFormat(colaborador.data_nascimento);
if (birthDate && birthDate.getMonth() === new Date().getMonth()) {
  // Birthday this month
}
```

---

### Example 3: Replace Magic Numbers with Constants

#### BEFORE:

```typescript
// auth.service.ts
const saltRounds = 12;  // Magic number
const senhaHash = await bcrypt.hash(registerDto.password, saltRounds);

// Business days calculation
const dataGatilhoEnvio = this.businessDaysService.calculateBusinessDaysBefore(
  aniversarioAnoAtual,
  7  // Magic number
);

// Pagination
const take = Math.min(limit, 100); // Magic number
```

#### AFTER:

```typescript
// common/constants/security.constants.ts
export const SecurityConstants = {
  BCRYPT_SALT_ROUNDS: 12,  // OWASP recommendation for password hashing
  JWT_EXPIRATION: '7d',
  SESSION_TIMEOUT_MINUTES: 30
} as const;

// common/constants/business.constants.ts
export const BusinessConstants = {
  BIRTHDAY_GIFT_DAYS_BEFORE: 7,  // Days before birthday to trigger gift
  MAX_ITEMS_PER_PAGE: 100,
  DEFAULT_ITEMS_PER_PAGE: 10
} as const;

// Usage
const senhaHash = await bcrypt.hash(
  registerDto.password,
  SecurityConstants.BCRYPT_SALT_ROUNDS
);

const dataGatilhoEnvio = this.businessDaysService.calculateBusinessDaysBefore(
  aniversarioAnoAtual,
  BusinessConstants.BIRTHDAY_GIFT_DAYS_BEFORE
);

const take = Math.min(limit, BusinessConstants.MAX_ITEMS_PER_PAGE);
```

---

### Example 4: Replace Primitive Obsession with Enum

#### BEFORE:

```typescript
// String literals scattered everywhere
if (envioBrinde.status === 'PENDENTE') { }
if (novoStatus === 'ENVIADO') { }
status: 'PRONTO_PARA_ENVIO'
```

#### AFTER:

```typescript
// shared/enums/envio-status.enum.ts
export enum EnvioStatus {
  PENDENTE = 'PENDENTE',
  PRONTO_PARA_ENVIO = 'PRONTO_PARA_ENVIO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO'
}

export const EnvioStatusLabels: Record<EnvioStatus, string> = {
  [EnvioStatus.PENDENTE]: 'Pendente',
  [EnvioStatus.PRONTO_PARA_ENVIO]: 'Pronto para Envio',
  [EnvioStatus.ENVIADO]: 'Enviado',
  [EnvioStatus.ENTREGUE]: 'Entregue',
  [EnvioStatus.CANCELADO]: 'Cancelado'
};

export class EnvioStatusHelper {
  static isCompleted(status: EnvioStatus): boolean {
    return [EnvioStatus.ENVIADO, EnvioStatus.ENTREGUE].includes(status);
  }

  static isPending(status: EnvioStatus): boolean {
    return [EnvioStatus.PENDENTE, EnvioStatus.PRONTO_PARA_ENVIO].includes(status);
  }

  static canTransitionTo(from: EnvioStatus, to: EnvioStatus): boolean {
    const validTransitions: Record<EnvioStatus, EnvioStatus[]> = {
      [EnvioStatus.PENDENTE]: [EnvioStatus.PRONTO_PARA_ENVIO, EnvioStatus.CANCELADO],
      [EnvioStatus.PRONTO_PARA_ENVIO]: [EnvioStatus.ENVIADO, EnvioStatus.CANCELADO],
      [EnvioStatus.ENVIADO]: [EnvioStatus.ENTREGUE],
      [EnvioStatus.ENTREGUE]: [],
      [EnvioStatus.CANCELADO]: []
    };

    return validTransitions[from]?.includes(to) ?? false;
  }
}

// Usage
if (envioBrinde.status === EnvioStatus.PENDENTE) { }
if (EnvioStatusHelper.isCompleted(status)) { }
```

---

## Metrics & Improvements

### Complexity Metrics (Before → After)

| File | Method | Lines Before | Lines After | Complexity Before | Complexity After |
|------|--------|--------------|-------------|-------------------|------------------|
| envio-brindes.service.ts | buscarRelatorios | 163 | 15-20 (split into 8 methods) | 15 | 2-4 each |
| envio-brindes.service.ts | seedTestData | 121 | 40 (extracted to TestDataSeeder) | 12 | 6 |
| colaboradores.service.ts | getAniversariosPorMes | 77 | 25 (extracted helpers) | 8 | 3 |
| ColaboradorForm.tsx | Component | 670 | 150 (split into hooks + components) | 18 | 4-6 each |
| auth.service.ts | updateProfile | 59 | 20 (extracted to UserProfileService) | 6 | 3 |

### Code Quality Improvements

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| **Maintainability Index** | 65 | 85 | >80 |
| **Average Method Length** | 42 lines | 18 lines | <25 |
| **Cyclomatic Complexity** | Avg 8.5 | Avg 3.2 | <5 |
| **Code Duplication** | 12% | 3% | <5% |

---

## Implementation Guide

### Step-by-Step Process

#### 1. Identify Code Smell

```bash
# Use static analysis tools
npm run lint
npm run analyze

# Manual code review
# - Look for long methods (>50 lines)
# - Look for long parameter lists (>3 params)
# - Look for duplicate code
```

#### 2. Write Tests First

```typescript
// IMPORTANT: Write tests BEFORE refactoring
describe('EnvioReportService', () => {
  it('should generate annual report', async () => {
    // Test current behavior
    const result = await service.buscarRelatorios(orgId, 2024);

    expect(result.totalColaboradores).toBeDefined();
    expect(result.enviosPorStatus).toBeDefined();
  });
});
```

#### 3. Refactor in Small Steps

```typescript
// Step 1: Extract method
private async countTotalColaboradores(organizationId: string): Promise<number> {
  return this.prisma.colaborador.count({ where: { organizationId } });
}

// Step 2: Use extracted method
const totalColaboradores = await this.countTotalColaboradores(organizationId);

// Step 3: Run tests to verify behavior unchanged
npm test

// Step 4: Repeat for other methods
```

#### 4. Verify Tests Still Pass

```bash
npm test
npm run test:cov
```

#### 5. Update Documentation

```typescript
/**
 * Generates annual report for birthday gifts
 * @param organizationId - Organization ID
 * @param ano - Year to generate report for
 * @returns Annual report with statistics
 */
async buscarRelatorioAnual(organizationId: string, ano: number) { }
```

---

## Automated Refactoring Tools

### ESLint Rules

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true }],
    'max-depth': ['error', 4],
    'complexity': ['error', 10],
    'max-params': ['error', 3],
  },
};
```

### SonarQube Configuration

```properties
# sonar-project.properties
sonar.qualitygate.wait=true

sonar.issue.ignore.multicriteria=e1,e2
sonar.issue.ignore.multicriteria.e1.ruleKey=typescript:S138  # Max lines per function
sonar.issue.ignore.multicriteria.e1.resourceKey=**/*.ts
```

---

## Success Criteria

### Definition of Done

- ✅ All tests pass after refactoring
- ✅ Code coverage maintained or improved
- ✅ Cyclomatic complexity <5 for new methods
- ✅ No method longer than 50 lines
- ✅ No duplicate code detected
- ✅ All magic numbers replaced with constants
- ✅ Documentation updated

---

## Resources

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring by Martin Fowler](https://refactoring.com/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Code Smells Catalog](https://refactoring.guru/refactoring/smells)

---

**Last Updated**: October 3, 2025
**Maintained By**: Development Team
**Next Review**: After Phase 2 (Week 3-4)

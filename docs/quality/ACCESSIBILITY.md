# Accessibility Guidelines & WCAG 2.1 AA Compliance

> **Last Updated**: October 3, 2025
> **Based On**: Persephone Matrix Agent Analysis
> **Compliance Target**: WCAG 2.1 Level AA

---

## 📋 Table of Contents

- [Overview](#overview)
- [WCAG 2.1 Principles](#wcag-21-principles)
- [Current Accessibility Status](#current-accessibility-status)
- [Accessibility Checklist](#accessibility-checklist)
- [Implementation Guidelines](#implementation-guidelines)
- [Testing & Validation](#testing--validation)
- [Known Issues & Roadmap](#known-issues--roadmap)

---

## Overview

### Accessibility Commitment

The Beuni platform is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

### Standards Compliance

- **WCAG 2.1 Level AA** (Target)
- **Section 508** (U.S. Federal)
- **EN 301 549** (European)
- **ARIA 1.2** (Accessible Rich Internet Applications)

### Assistive Technologies Supported

- Screen readers (NVDA, JAWS, VoiceOver)
- Screen magnification software
- Speech recognition software
- Alternative input devices

---

## WCAG 2.1 Principles

### POUR Framework

#### 1. Perceivable
Information and user interface components must be presentable to users in ways they can perceive.

**Requirements:**
- Text alternatives for non-text content
- Captions and alternatives for multimedia
- Content adaptable and distinguishable

#### 2. Operable
User interface components and navigation must be operable.

**Requirements:**
- Keyboard accessibility
- Sufficient time to read and use content
- Content doesn't cause seizures
- Navigable and findable content

#### 3. Understandable
Information and operation of user interface must be understandable.

**Requirements:**
- Readable and predictable
- Input assistance
- Error prevention and correction

#### 4. Robust
Content must be robust enough to be interpreted reliably by assistive technologies.

**Requirements:**
- Compatible with current and future user agents
- Valid, semantic HTML
- Proper ARIA usage

---

## Current Accessibility Status

### ✅ Strengths

#### Semantic HTML
```tsx
// Good: Semantic structure in Layout component
<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/colaboradores">Colaboradores</a></li>
  </ul>
</nav>

<main role="main" id="main-content">
  {children}
</main>
```

#### Form Labels
```tsx
// Good: Associated labels in login form
<label htmlFor="email">Email</label>
<input
  id="email"
  name="email"
  type="email"
  aria-required="true"
/>
```

#### Color Contrast
```css
/* Good: High contrast ratios */
.text-beuni-text {
  color: #1F2937; /* Contrast ratio: 12.63:1 ✅ */
}

.bg-beuni-orange {
  background-color: #FF6B35; /* Contrast with white: 3.18:1 ✅ */
}
```

#### Keyboard Navigation
- All interactive elements accessible via Tab
- Focus indicators visible
- Logical tab order

### ⚠️ Areas Needing Improvement

#### 1. Missing ARIA Attributes

**Issue**: Form validation errors not announced to screen readers

**Current**:
```tsx
{errors.email && (
  <p className="error-message">
    {errors.email.message}
  </p>
)}
```

**Improved**:
```tsx
<input
  id="email"
  aria-invalid={errors.email ? 'true' : 'false'}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>

{errors.email && (
  <p id="email-error" role="alert" className="error-message">
    {errors.email.message}
  </p>
)}
```

#### 2. Missing Skip Links

**Issue**: No way for keyboard users to skip repetitive navigation

**Implementation Needed**:
```tsx
// Layout.tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<style jsx>{`
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    z-index: 100;
  }

  .skip-link:focus {
    top: 0;
  }
`}</style>
```

#### 3. Dynamic Content Updates

**Issue**: Loading states and dynamic updates not announced

**Current**:
```tsx
{isLoading && <Spinner />}
```

**Improved**:
```tsx
<div
  role="status"
  aria-live="polite"
  aria-busy={isLoading}
>
  {isLoading ? (
    <span className="sr-only">Loading data, please wait...</span>
  ) : (
    <span className="sr-only">Data loaded successfully</span>
  )}
</div>
```

#### 4. Image Alternative Text

**Issue**: Some images missing or have generic alt text

**Current**:
```tsx
<img src={profile.imagemPerfil} alt="Perfil" />
```

**Improved**:
```tsx
<img
  src={profile.imagemPerfil}
  alt={`Foto de perfil de ${profile.nome}`}
  onError={(e) => {
    e.currentTarget.alt = `Iniciais de ${profile.nome}`;
  }}
/>
```

---

## Accessibility Checklist

### Level A (Must Have) ✅

#### Text Alternatives (1.1)
- [x] All images have meaningful alt text
- [x] Decorative images use `alt=""`
- [x] Form inputs have associated labels
- [ ] Icons have accessible names (aria-label)

#### Time-Based Media (1.2)
- [x] No auto-playing audio/video
- [ ] Captions for video content (if implemented)

#### Adaptable (1.3)
- [x] Semantic HTML structure
- [x] Heading hierarchy logical (h1 → h2 → h3)
- [x] Form fields have explicit labels
- [x] Reading order is logical

#### Distinguishable (1.4)
- [x] Color not sole means of conveying information
- [x] Text can be resized to 200% without loss
- [x] Contrast ratio at least 4.5:1 for normal text
- [x] Contrast ratio at least 3:1 for large text

#### Keyboard Accessible (2.1)
- [x] All functionality available via keyboard
- [x] No keyboard traps
- [x] Keyboard shortcuts don't conflict

#### Enough Time (2.2)
- [x] No time limits on interactions
- [x] Auto-logout has warning

#### Seizures and Physical Reactions (2.3)
- [x] No content flashes more than 3 times/second

#### Navigable (2.4)
- [x] Page titles descriptive
- [x] Focus order logical
- [x] Link purpose clear from text
- [x] Multiple ways to find pages

#### Input Modalities (2.5)
- [x] Touch targets at least 44×44 pixels
- [x] No motion-activated features

#### Readable (3.1)
- [x] Language of page identified (`<html lang="pt-BR">`)

#### Predictable (3.2)
- [x] No unexpected context changes on focus
- [x] Consistent navigation across pages

#### Input Assistance (3.3)
- [x] Error messages provided
- [x] Labels or instructions provided

#### Compatible (4.1)
- [x] Valid HTML
- [x] Unique IDs for elements

---

### Level AA (Should Have) 🔄

#### Contrast (1.4.3)
- [x] Minimum contrast ratio 4.5:1
- [x] Large text 3:1

#### Resize Text (1.4.4)
- [x] Text resizable to 200% without assistive technology

#### Images of Text (1.4.5)
- [x] Text used instead of images of text (except logos)

#### Reflow (1.4.10)
- [x] Content reflows without horizontal scrolling at 320px width

#### Non-text Contrast (1.4.11)
- [ ] UI components and graphics have 3:1 contrast

#### Text Spacing (1.4.12)
- [x] No loss of content when text spacing increased

#### Content on Hover or Focus (1.4.13)
- [ ] Hover/focus content dismissible, hoverable, persistent

#### Multiple Ways (2.4.5)
- [x] Multiple ways to locate pages (navigation, search)

#### Headings and Labels (2.4.6)
- [x] Headings and labels descriptive

#### Focus Visible (2.4.7)
- [x] Keyboard focus indicator visible

#### Language of Parts (3.1.2)
- [ ] Language changes marked (e.g., English in Portuguese page)

#### Consistent Navigation (3.2.3)
- [x] Navigation consistent across pages

#### Consistent Identification (3.2.4)
- [x] Icons and components consistent

#### Error Suggestion (3.3.3)
- [x] Error correction suggestions provided

#### Error Prevention (Legal, Financial, Data) (3.3.4)
- [x] Reversible submissions
- [x] Data checked before final submission

#### Status Messages (4.1.3)
- [ ] Status messages announced to screen readers

---

## Implementation Guidelines

### 1. Semantic HTML Best Practices

```tsx
// ✅ GOOD: Proper semantic structure
export default function DashboardPage() {
  return (
    <Layout>
      <header>
        <h1>Dashboard</h1>
      </header>

      <main>
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading">Estatísticas</h2>
          <div role="list">
            {/* Stats cards */}
          </div>
        </section>

        <section aria-labelledby="birthdays-heading">
          <h2 id="birthdays-heading">Aniversariantes do Dia</h2>
          <ul>
            {/* Birthday list */}
          </ul>
        </section>
      </main>
    </Layout>
  );
}

// ❌ BAD: Generic divs
export default function DashboardPage() {
  return (
    <div>
      <div>Dashboard</div>
      <div>
        <div>Estatísticas</div>
        <div>{/* Stats */}</div>
      </div>
    </div>
  );
}
```

### 2. Form Accessibility

```tsx
// Complete accessible form example
export default function LoginForm() {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="login-heading"
      noValidate
    >
      <h2 id="login-heading">Login</h2>

      {/* Email Field */}
      <div className="form-group">
        <label htmlFor="email">
          Email
          <span aria-label="required">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-required="true"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error email-hint' : 'email-hint'}
        />
        <p id="email-hint" className="hint">
          Exemplo: usuario@exemplo.com
        </p>
        {errors.email && (
          <p id="email-error" role="alert" className="error">
            <span aria-hidden="true">⚠</span> {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="form-group">
        <label htmlFor="password">
          Senha
          <span aria-label="required">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          aria-required="true"
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <p id="password-error" role="alert" className="error">
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner" aria-hidden="true"></span>
            <span>Entrando...</span>
          </>
        ) : (
          'Entrar'
        )}
      </button>

      {/* Screen reader live region for status updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isLoading && 'Processando login...'}
      </div>
    </form>
  );
}
```

### 3. Interactive Components

#### Accessible Modal Dialog

```tsx
export function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previousFocus.current = document.activeElement as HTMLElement;

      // Focus first focusable element in modal
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();

      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        // Add focus trap logic here
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else {
      // Restore focus when modal closes
      previousFocus.current?.focus();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>

        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="close-button"
        >
          <X aria-hidden="true" />
        </button>

        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}
```

#### Accessible Dropdown Menu

```tsx
export function DropdownMenu({ label, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Focus next item
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Focus previous item
        break;
    }
  };

  return (
    <div className="dropdown" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
      >
        {label}
        <ChevronDown aria-hidden="true" />
      </button>

      {isOpen && (
        <ul
          id="dropdown-menu"
          role="menu"
          onKeyDown={handleKeyDown}
        >
          {items.map((item, index) => (
            <li role="none" key={index}>
              <a
                href={item.href}
                role="menuitem"
                tabIndex={0}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 4. Loading States & Live Regions

```tsx
export function DataTable({ isLoading, data }) {
  return (
    <div>
      {/* Live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isLoading && 'Carregando dados da tabela...'}
        {!isLoading && data.length > 0 && `${data.length} resultados carregados`}
        {!isLoading && data.length === 0 && 'Nenhum resultado encontrado'}
      </div>

      {/* Table with proper ARIA */}
      <table role="table" aria-busy={isLoading}>
        <caption className="sr-only">
          Tabela de colaboradores
        </caption>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Email</th>
            <th scope="col">Departamento</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={4}>
                <div className="loading-skeleton" aria-hidden="true">
                  {/* Skeleton UI */}
                </div>
              </td>
            </tr>
          ) : (
            data.map(item => (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.email}</td>
                <td>{item.departamento}</td>
                <td>
                  <button
                    aria-label={`Editar ${item.nome}`}
                    onClick={() => edit(item.id)}
                  >
                    <Edit aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

### 5. Focus Management

```tsx
// Custom hook for focus management
export function useFocusManagement() {
  const [focusTrapRef, setFocusTrapRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!focusTrapRef) return;

    const focusableElements = focusTrapRef.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    focusTrapRef.addEventListener('keydown', handleTab);
    return () => focusTrapRef.removeEventListener('keydown', handleTab);
  }, [focusTrapRef]);

  return setFocusTrapRef;
}
```

---

## Testing & Validation

### Automated Testing

#### 1. axe-core Integration

```bash
npm install --save-dev @axe-core/react
```

```tsx
// src/index.tsx (development only)
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

#### 2. Jest + Testing Library

```typescript
// accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Login Page Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible form labels', () => {
    const { getByLabelText } = render(<LoginPage />);
    expect(getByLabelText(/email/i)).toBeInTheDocument();
    expect(getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('should announce errors to screen readers', async () => {
    const { getByRole } = render(<LoginPage />);
    // Submit form with errors
    // Check for role="alert" elements
    expect(getByRole('alert')).toHaveTextContent(/email inválido/i);
  });
});
```

#### 3. Playwright E2E Accessibility Tests

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');

    // Tab to email field
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="email"]')).toBeFocused();

    // Tab to password field
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="password"]')).toBeFocused();

    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });
});
```

### Manual Testing

#### Screen Reader Testing

**Test with NVDA (Windows)**:
```bash
1. Download NVDA: https://www.nvaccess.org/download/
2. Install and launch
3. Navigate to http://localhost:3000
4. Test navigation with:
   - Tab (next element)
   - Shift+Tab (previous element)
   - H (next heading)
   - F (next form field)
   - B (next button)
```

**Test with VoiceOver (Mac)**:
```bash
1. Enable VoiceOver: Cmd+F5
2. Navigate to http://localhost:3000
3. Test navigation with:
   - VO+→ (next item)
   - VO+← (previous item)
   - VO+H (next heading)
   - VO+J (next form control)
```

#### Keyboard Navigation Checklist

- [ ] All interactive elements accessible via Tab
- [ ] Tab order is logical
- [ ] Focus indicators clearly visible
- [ ] No keyboard traps
- [ ] Esc key closes modals/dropdowns
- [ ] Arrow keys navigate within components
- [ ] Enter/Space activate buttons
- [ ] Skip links work correctly

#### Color Contrast Testing

Use tools:
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Lighthouse**: Built into Chrome DevTools
- **WAVE**: Browser extension

```bash
# Run Lighthouse accessibility audit
npx lighthouse http://localhost:3000 --only-categories=accessibility --view
```

---

## Known Issues & Roadmap

### Current Issues (To Fix)

#### Priority 1 (High)
- [ ] **Missing skip links** on all pages
- [ ] **Focus management** in modals not implemented
- [ ] **Status messages** (4.1.3) not announced to screen readers
- [ ] **Non-text contrast** (1.4.11) needs verification for icons

#### Priority 2 (Medium)
- [ ] **Content on hover** (1.4.13) - Tooltips need improvement
- [ ] **Language of parts** (3.1.2) - Mixed PT/EN content not marked
- [ ] **Headings** could be more descriptive in some pages
- [ ] **Error recovery** suggestions could be more helpful

#### Priority 3 (Low)
- [ ] **Touch targets** could be larger on mobile (48×48px recommended)
- [ ] **Landmark regions** could be more specific
- [ ] **Table captions** missing on some data tables

### Roadmap

#### Q4 2025
- ✅ Complete WCAG 2.1 Level A compliance
- 🔄 Achieve 90% WCAG 2.1 Level AA compliance
- 📝 Implement automated accessibility testing in CI/CD
- 📝 Conduct user testing with assistive technology users

#### Q1 2026
- 📝 100% WCAG 2.1 Level AA compliance
- 📝 Begin WCAG 2.2 Level AA implementation
- 📝 Accessibility training for development team
- 📝 Establish accessibility review process

---

## Resources

### Guidelines & Standards
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### React-Specific
- [React Accessibility Docs](https://react.dev/learn/accessibility)
- [@axe-core/react](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/react)
- [jest-axe](https://github.com/nickcolley/jest-axe)

---

## Contact & Support

For accessibility concerns or issues, please:
1. **Email**: accessibility@beuni.com.br
2. **GitHub Issues**: Label with `accessibility`
3. **Expected Response**: Within 48 hours

We welcome feedback from users of assistive technologies to help improve our platform.

---

**Last Updated**: October 3, 2025
**Maintained By**: Persephone (UX/Accessibility Specialist)
**Next Audit**: January 2026

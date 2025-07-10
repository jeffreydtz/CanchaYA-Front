# CanchaYA Testing Documentation

## Overview

This document outlines the comprehensive testing setup for the CanchaYA frontend application, including unit tests with Jest and React Testing Library, and end-to-end tests with Playwright.

## Testing Stack

### Unit Testing
- **Jest**: Testing framework with configuration for Next.js 15
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation

### E2E Testing
- **Playwright**: End-to-end testing framework
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing
- Visual regression testing
- Accessibility testing

### Test Structure

```
__tests__/
├── utils/
│   └── test-utils.tsx          # Custom render functions and helpers
├── README.md                   # This documentation
│
components/
├── auth/
│   └── __tests__/
│       └── login-form.test.tsx # Login form unit tests
├── error/
│   └── __tests__/
│       └── error-boundary.test.tsx # Error boundary tests
│
lib/
└── __tests__/
    └── error-utils.test.ts     # Utility function tests

e2e/
├── auth.e2e.ts                 # Authentication flow E2E tests
├── global-setup.ts             # Global test environment setup
├── global-teardown.ts          # Global test cleanup
└── test-data.json              # Test data for E2E tests

Configuration Files:
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest global setup
├── playwright.config.ts        # Playwright configuration
└── __mocks__/
    └── fileMock.js            # Mock for static file imports
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# View E2E test report
npm run test:e2e:report
```

### All Tests

```bash
# Run all tests (unit + E2E)
npm run test:all
```

## Writing Unit Tests

### Basic Component Test

```typescript
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/__tests__/utils/test-utils'
import { MyComponent } from '../my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    await user.click(screen.getByRole('button'))
    
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Testing Forms

```typescript
import { fillForm, submitForm, expectValidationError } from '@/__tests__/utils/test-utils'

it('validates form input', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await fillForm(user, {
    email: 'invalid-email',
    password: 'password123'
  })

  await submitForm(user)

  await expectValidationError('email', 'formato de email inválido')
})
```

### Testing with Mocks

```typescript
import { mockFetchSuccess, mockFetchError } from '@/__tests__/utils/test-utils'

it('handles API success', async () => {
  mockFetchSuccess({ data: 'success' })
  
  // Test component that makes API call
  render(<ApiComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('success')).toBeInTheDocument()
  })
})
```

## Writing E2E Tests

### Basic E2E Test

```typescript
import { test, expect } from '@playwright/test'

test('user can login successfully', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await page.waitForURL('**/dashboard')
  await expect(page.getByTestId('user-menu')).toBeVisible()
})
```

### Testing Different Browsers

```typescript
test.describe('Cross-browser tests', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`works in ${browserName}`, async ({ page, browserName: browser }) => {
      test.skip(browser !== browserName, `Only run in ${browserName}`)
      
      // Test logic here
    })
  })
})
```

## Test Utilities

### Custom Render Function

The custom `render` function from `test-utils.tsx` provides:

- Mock providers for authentication and notifications
- Simplified component wrapping
- Access to all React Testing Library utilities

```typescript
import { render } from '@/__tests__/utils/test-utils'

// Renders with default mocks
render(<Component />)

// Renders without providers
render(<Component />, { withProviders: false })

// Renders with custom auth state
render(<Component />, { 
  authValue: mockUnauthenticatedContextValue 
})
```

### Test Data Factories

Create test data easily:

```typescript
import { createTestUser, createTestCourt, createTestReservation } from '@/__tests__/utils/test-utils'

const user = createTestUser({ nombre: 'Custom Name' })
const court = createTestCourt({ precio: 10000 })
const reservation = createTestReservation({ estado: 'PENDIENTE' })
```

### Mock Helpers

```typescript
import { 
  mockFetchSuccess, 
  mockFetchError, 
  expectToastMessage,
  expectNavigation,
  loginUser,
  logoutUser 
} from '@/__tests__/utils/test-utils'

// Mock API responses
mockFetchSuccess({ success: true })
mockFetchError(404, 'Not found')

// Test toast messages
expectToastMessage('Success message', 'success')

// Test navigation
const mockRouter = createMockRouter()
expectNavigation(mockRouter, '/dashboard')

// Simulate authentication
loginUser(customUser)
logoutUser()
```

## Global Test Setup

### Jest Setup (`jest.setup.js`)

Provides global mocks for:

- Next.js components (Image, Link, Router)
- Lucide React icons
- External libraries (date-fns, react-hook-form, sonner)
- Browser APIs (localStorage, fetch, IntersectionObserver)
- Global test data objects

### Playwright Setup

- **Global Setup**: Creates authentication states, prepares test data
- **Global Teardown**: Cleans up test artifacts and data
- **Authentication States**: Pre-authenticated user and admin sessions
- **Test Projects**: Different configurations for various testing scenarios

## Best Practices

### Unit Testing

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Descriptive Test Names**: Clearly describe what is being tested
3. **Arrange-Act-Assert Pattern**: Structure tests consistently
4. **Mock External Dependencies**: Isolate components from external services
5. **Test Edge Cases**: Include error states, loading states, and boundary conditions

### E2E Testing

1. **Test User Journeys**: Focus on complete workflows users perform
2. **Use Page Object Model**: Abstract page interactions into reusable methods
3. **Stable Selectors**: Use `data-testid` attributes for reliable element selection
4. **Independent Tests**: Each test should be able to run in isolation
5. **Minimize Test Data Dependencies**: Use factories and cleanup properly

### General Guidelines

1. **Fast Feedback Loop**: Unit tests should run quickly
2. **Maintainable Tests**: Write tests that are easy to update when requirements change
3. **Clear Error Messages**: Use descriptive assertions that help identify failures
4. **Test Documentation**: Include comments for complex test scenarios
5. **Regular Maintenance**: Update tests when functionality changes

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm test login-form.test.tsx

# Run tests matching pattern
npm test --testNamePattern="validation"

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests

```bash
# Run specific test file
npm run test:e2e auth.e2e.ts

# Debug specific test
npm run test:e2e:debug --grep="login successfully"

# Run with browser UI
npm run test:e2e:ui
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Coverage Reports

Jest generates coverage reports in multiple formats:

- **HTML Report**: `coverage/lcov-report/index.html`
- **Text Summary**: Displayed in terminal
- **LCOV Format**: `coverage/lcov.info` for CI integration

Coverage thresholds are set to 70% for:
- Branches
- Functions  
- Lines
- Statements

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout values or check for infinite loops
2. **Mock not working**: Verify mock is set up before component render
3. **Element not found**: Use `waitFor` for async operations
4. **Flaky E2E tests**: Add proper waits and use stable selectors

### Getting Help

- Check the existing test files for examples
- Review the test utilities for available helpers
- Consult React Testing Library and Playwright documentation
- Use debug utilities: `screen.debug()`, `page.pause()`

## Future Enhancements

- **Visual Regression Testing**: Add screenshot comparisons
- **Performance Testing**: Integrate lighthouse CI
- **Accessibility Testing**: Expand a11y test coverage
- **API Contract Testing**: Add contract testing with Pact
- **Load Testing**: Implement stress testing scenarios 
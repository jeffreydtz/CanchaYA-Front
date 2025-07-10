/**
 * Test Utilities for CanchaYA
 * Custom render functions and test helpers
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth/auth-context'
import { NotificationProvider } from '@/components/notifications/notification-provider'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createTestUser = (overrides: Partial<any> = {}): any => ({
  ...global.testUser,
  ...overrides,
})

export const createTestCourt = (overrides: Partial<any> = {}): any => ({
  ...global.testCourt,
  ...overrides,
})

export const createTestReservation = (overrides: Partial<any> = {}): any => ({
  ...global.testReservation,
  ...overrides,
})

// Mock API responses
export const mockApiResponse = <T,>(data: T, status = 200) => ({
  data,
  status,
  message: 'Success',
})

export const mockApiError = (message = 'Error occurred', status = 500) => ({
  error: message,
  status,
})

// Mock fetch responses
export const mockFetchSuccess = <T,>(data: T) => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
  } as Response)
}

export const mockFetchError = (status = 500, message = 'Server Error') => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ message }),
  } as Response)
}

export const mockFetchNetworkError = () => {
  global.fetch.mockRejectedValueOnce(new Error('Network Error'))
}

// Form test helpers
export const fillForm = async (user: any, formData: Record<string, string>) => {
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement
    if (field) {
      await user.clear(field)
      await user.type(field, value)
    }
  }
}

export const submitForm = async (user: any, formSelector = 'form') => {
  const form = document.querySelector(formSelector) as HTMLFormElement
  const submitButton = form?.querySelector('[type="submit"]') as HTMLButtonElement
  if (submitButton) {
    await user.click(submitButton)
  }
}

// Wait for async operations
export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import('@testing-library/react')
  await waitFor(() => {
    expect(document.querySelector('[data-testid="loader-icon"]')).not.toBeInTheDocument()
  }, { timeout: 3000 })
}

// Mock implementations helpers
export const createMockRouter = (overrides = {}) => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  ...overrides,
})

export const createMockSearchParams = (params = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value))
  })
  return searchParams
}

// Date helpers for tests
export const mockDate = (dateString: string) => {
  const mockDate = new Date(dateString)
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate)
  return mockDate
}

export const restoreDate = () => {
  jest.restoreAllMocks()
}

// Local storage helpers
export const setLocalStorage = (key: string, value: any) => {
  global.localStorage.setItem(key, JSON.stringify(value))
}

export const getLocalStorage = (key: string) => {
  const item = global.localStorage.getItem(key)
  return item ? JSON.parse(item) : null
}

export const clearLocalStorage = () => {
  global.localStorage.clear()
}

// Viewport helpers for responsive testing
export const setMobileViewport = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

export const setDesktopViewport = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query === '(min-width: 769px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Assertion helpers
export const expectToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
  const { toast } = require('sonner')
  expect(toast[type]).toHaveBeenCalledWith(expect.stringContaining(message))
}

export const expectNavigation = (mockRouter: any, path: string) => {
  expect(mockRouter.push).toHaveBeenCalledWith(path)
}

export const expectApiCall = (endpoint: string, method = 'GET') => {
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining(endpoint),
    expect.objectContaining({
      method,
    })
  )
}

// Component testing helpers
export const getByDataTestId = (testId: string) => {
  return document.querySelector(`[data-testid="${testId}"]`)
}

export const getAllByDataTestId = (testId: string) => {
  return document.querySelectorAll(`[data-testid="${testId}"]`)
}

// Error boundary testing
export const triggerErrorBoundary = (errorMessage = 'Test error') => {
  const ThrowError = () => {
    throw new Error(errorMessage)
  }
  return ThrowError
}

// Notification testing helpers
export const mockNotification = (type: string, message: string, id = '1') => ({
  id,
  type,
  message,
  timestamp: new Date().toISOString(),
  read: false,
  priority: 'medium' as const,
})

// Authentication testing helpers
export const loginUser = (user = global.testUser) => {
  setLocalStorage('token', 'mock-token')
  setLocalStorage('user', user)
}

export const logoutUser = () => {
  clearLocalStorage()
}

// Form validation helpers
export const expectValidationError = async (fieldName: string, errorMessage: string) => {
  const { waitFor } = await import('@testing-library/react')
  await waitFor(() => {
    const errorElement = document.querySelector(`[name="${fieldName}"] + .text-destructive, [name="${fieldName}"] ~ .text-destructive`)
    expect(errorElement).toHaveTextContent(errorMessage)
  })
}

// Accessibility testing helpers
export const expectAriaLabel = (element: Element, label: string) => {
  expect(element).toHaveAttribute('aria-label', label)
}

export const expectAriaDescribedBy = (element: Element, describedBy: string) => {
  expect(element).toHaveAttribute('aria-describedby', describedBy)
}

// Custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R
      toHaveErrorMessage(message: string): R
    }
  }
}

// Add custom matchers
expect.extend({
  toBeVisible(received) {
    const pass = received && received.style.display !== 'none' && received.style.visibility !== 'hidden'
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}be visible`,
      pass,
    }
  },
  toHaveErrorMessage(received, expectedMessage) {
    const errorElement = received.parentElement?.querySelector('.text-destructive')
    const pass = errorElement?.textContent?.includes(expectedMessage) || false
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}have error message "${expectedMessage}"`,
      pass,
    }
  },
}) 
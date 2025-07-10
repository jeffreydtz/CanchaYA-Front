/**
 * Test Utilities for CanchaYA
 * Custom render functions and test helpers
 */

import React, { createContext, useContext } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import type { User, Court, Reservation } from '@/lib/api-client'

// Types imports (you might need to adjust these paths)
type User = any
type Court = any
type Reservation = any

// Mock auth context values
export const mockAuthContextValue = {
  user: global.testUser,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  refreshToken: jest.fn(),
  hasPermission: jest.fn(() => true),
  isAdmin: false,
  error: null,
  clearError: jest.fn(),
}

// Mock notification context values
export const mockNotificationContextValue = {
  notifications: [],
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  addNotification: jest.fn(),
  updateNotification: jest.fn(),
  removeNotification: jest.fn(),
  unreadCount: 0,
  isConnected: true,
  connectionRetries: 0,
}

// Create mock contexts
const MockAuthContext = createContext(mockAuthContextValue)
const MockNotificationContext = createContext(mockNotificationContextValue)

// Mock providers components
interface MockProvidersProps {
  children: React.ReactNode
  authValue?: typeof mockAuthContextValue
  notificationValue?: typeof mockNotificationContextValue
}

function MockAuthProvider({ children, authValue = mockAuthContextValue }: { children: React.ReactNode, authValue?: typeof mockAuthContextValue }) {
  return (
    <MockAuthContext.Provider value={authValue}>
      {children}
    </MockAuthContext.Provider>
  )
}

function MockNotificationProvider({ children, notificationValue = mockNotificationContextValue }: { children: React.ReactNode, notificationValue?: typeof mockNotificationContextValue }) {
  return (
    <MockNotificationContext.Provider value={notificationValue}>
      {children}
    </MockNotificationContext.Provider>
  )
}

function MockProviders({ 
  children, 
  authValue = mockAuthContextValue,
  notificationValue = mockNotificationContextValue 
}: MockProvidersProps) {
  return (
    <MockAuthProvider authValue={authValue}>
      <MockNotificationProvider notificationValue={notificationValue}>
        <div data-testid="mock-providers">
          {children}
        </div>
      </MockNotificationProvider>
    </MockAuthProvider>
  )
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: typeof mockAuthContextValue
  notificationValue?: typeof mockNotificationContextValue
  withProviders?: boolean
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const {
    authValue = mockAuthContextValue,
    notificationValue = mockNotificationContextValue,
    withProviders = true,
    ...renderOptions
  } = options

  if (!withProviders) {
    return render(ui, renderOptions)
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockProviders authValue={authValue} notificationValue={notificationValue}>
      {children}
    </MockProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from RTL
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Custom render as default export
export { renderWithProviders as render }

// Test data factories
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  ...global.testUser,
  ...overrides,
})

export const createTestCourt = (overrides: Partial<Court> = {}): Court => ({
  ...global.testCourt,
  ...overrides,
})

export const createTestReservation = (overrides: Partial<Reservation> = {}): Reservation => ({
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
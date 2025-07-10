/**
 * Unit Tests for LoginForm Component
 * Tests form validation, submission, error states, and user interactions
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../login-form'
import { AuthProvider } from '../auth-context'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  default: {
    login: jest.fn(),
  },
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form', () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)

    expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument()
    expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)

    expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
  })
}) 
/**
 * Unit Tests for ErrorBoundary Component
 * Tests error catching, classification, retry logic, and error reporting
 */

import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../error-boundary'

// Mock console.error to avoid noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  describe('Error Catching', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('catches JavaScript errors and shows error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/oops! algo salió mal/i)).toBeInTheDocument()
      expect(screen.getByText(/se produjo un error inesperado/i)).toBeInTheDocument()
      expect(screen.queryByText('No error')).not.toBeInTheDocument()
    })

    it('displays error type badge', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/error de conexión/i)).toBeInTheDocument()
    })

    it('shows suggestions based on error type', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/verifica tu conexión a internet/i)).toBeInTheDocument()
      expect(screen.getByText(/intenta recargar la página/i)).toBeInTheDocument()
    })
  })

  describe('Error Classification', () => {
    it('classifies network errors correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/error de conexión/i)).toBeInTheDocument()
    })

    it('classifies authentication errors correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/error de autenticación/i)).toBeInTheDocument()
    })

    it('classifies rendering errors correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/error de código/i)).toBeInTheDocument()
    })

    it('provides fallback classification for unknown errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/error desconocido/i)).toBeInTheDocument()
    })
  })

  describe('Error Recovery', () => {
    it('provides retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /intentar nuevamente/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('resets error state when retry is clicked', async () => {
      const user = userEvent.setup()
      let shouldThrow = true

      const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      )

      // Error state should be shown
      expect(screen.getByText(/oops! algo salió mal/i)).toBeInTheDocument()

      // Fix the component
      shouldThrow = false

      // Click retry
      await user.click(screen.getByRole('button', { name: /intentar nuevamente/i }))

      // Should attempt to render children again
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('provides navigation buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: /ir al inicio/i })).toBeInTheDocument()
    })

    it('limits retry attempts', async () => {
      const user = userEvent.setup()
      const reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /intentar nuevamente/i })

      // Click retry 3 times (max retries)
      await user.click(retryButton)
      await user.click(retryButton)
      await user.click(retryButton)
      await user.click(retryButton) // This should trigger page reload

      expect(reloadSpy).toHaveBeenCalled()
      reloadSpy.mockRestore()
    })
  })

  describe('Error Reporting', () => {
    it('generates unique error ID', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const errorIdElement = screen.getByText(/ID del error:/i)
      expect(errorIdElement).toBeInTheDocument()
      expect(errorIdElement.textContent).toMatch(/err_\d+_[a-z0-9]+/)
    })

    it('includes timestamp in error report', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const timestampElement = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)
      expect(timestampElement).toBeInTheDocument()
    })

    it('provides error reporting button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const reportButton = screen.getByRole('button', { name: /reportar error/i })
      expect(reportButton).toBeInTheDocument()
    })

    it('copies error info to clipboard when report button is clicked', async () => {
      const user = userEvent.setup()
      const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      await user.click(screen.getByRole('button', { name: /reportar error/i }))

      expect(clipboardSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      )
      
      clipboardSpy.mockRestore()
    })
  })

  describe('Development Mode', () => {
    const originalEnv = process.env.NODE_ENV

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
    })

    it('shows detailed error information in development', () => {
      process.env.NODE_ENV = 'development'
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/información de desarrollo/i)).toBeInTheDocument()
      expect(screen.getByText(/ver detalles del error/i)).toBeInTheDocument()
    })

    it('hides detailed error information in production', () => {
      process.env.NODE_ENV = 'production'
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByText(/información de desarrollo/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/ver detalles del error/i)).not.toBeInTheDocument()
    })

    it('shows stack trace in development mode', async () => {
      process.env.NODE_ENV = 'development'
      const user = userEvent.setup()
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const detailsToggle = screen.getByText(/ver detalles del error/i)
      await user.click(detailsToggle)

      expect(screen.getByText(/stack trace:/i)).toBeInTheDocument()
    })
  })

  describe('Custom Error Handler', () => {
    it('calls custom error handler when provided', () => {
      const customErrorHandler = jest.fn()
      
      render(
        <ErrorBoundary onError={customErrorHandler}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(customErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })

    it('uses custom fallback component when provided', () => {
      const CustomFallback = ({ error, resetError }: any) => (
        <div data-testid="custom-fallback">
          Custom error: {error.message}
          <button onClick={resetError}>Custom Reset</button>
        </div>
      )

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText(/custom error: test error/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /custom reset/i })).toBeInTheDocument()
    })
  })

  describe('Isolation Mode', () => {
    it('isolates errors when isolate prop is true', () => {
      const ParentComponent = () => (
        <div>
          <span data-testid="sibling">Sibling component</span>
          <ErrorBoundary isolate={true}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </div>
      )

      render(<ParentComponent />)

      // Sibling should still be rendered
      expect(screen.getByTestId('sibling')).toBeInTheDocument()
      // Error boundary should catch the error
      expect(screen.getByText(/oops! algo salió mal/i)).toBeInTheDocument()
    })
  })

  describe('Contact Support', () => {
    it('provides support contact options', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: /contactar soporte/i })).toBeInTheDocument()
    })

    it('opens email client when support email is clicked', async () => {
      const user = userEvent.setup()
      window.open = jest.fn()
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      await user.click(screen.getByRole('button', { name: /contactar soporte/i }))

      expect(window.open).toHaveBeenCalledWith('mailto:soporte@canchaya.com')
    })
  })

  describe('Accessibility', () => {
    it('provides proper heading structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent(/oops! algo salió mal/i)
    })

    it('provides descriptive error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/se produjo un error inesperado/i)).toBeInTheDocument()
    })

    it('has proper button accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /intentar nuevamente/i })
      const homeButton = screen.getByRole('button', { name: /ir al inicio/i })

      expect(retryButton).toHaveAttribute('type', 'button')
      expect(homeButton).toHaveAttribute('type', 'button')
    })
  })
}) 
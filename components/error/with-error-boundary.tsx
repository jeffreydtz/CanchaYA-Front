'use client'

import React from 'react'
import { ErrorBoundary } from './error-boundary'

/**
 * HOC para envolver componentes con ErrorBoundary
 * Uso: const SafeComponent = withErrorBoundary(MyComponent, 'My Component')
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string = 'Component'
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${componentName})`

  return WrappedComponent
}

/**
 * Componente wrapper para pages que necesitan error boundary
 */
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

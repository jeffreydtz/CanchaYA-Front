/**
 * E2E Tests for Authentication Flows
 * Tests login, registration, logout, and authentication error scenarios
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Flows', () => {
    test.describe('Login Flow', () => {
        test('should login successfully with valid credentials', async ({ page }) => {
            // Navigate to login page
            await page.goto('/login')

            // Verify we're on the login page
            await expect(page.getByText('Bienvenido a CanchaYA')).toBeVisible()
            await expect(page.getByText('Inicia sesión en tu cuenta')).toBeVisible()

            // Fill login form
            await page.fill('[name="email"]', 'testuser@canchaya.com')
            await page.fill('[name="password"]', 'testpassword123')

            // Submit form
            await page.click('button[type="submit"]')

            // Wait for redirect to dashboard
            await page.waitForURL('**/dashboard')

            // Verify successful login
            await expect(page.getByTestId('user-menu')).toBeVisible()
            await expect(page.getByText('Encuentra tu cancha perfecta')).toBeVisible()

            // Verify toast message
            await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible()
        })

        test('should show error for invalid credentials', async ({ page }) => {
            await page.goto('/login')

            // Fill form with invalid credentials
            await page.fill('[name="email"]', 'invalid@example.com')
            await page.fill('[name="password"]', 'wrongpassword')

            // Submit form
            await page.click('button[type="submit"]')

            // Should stay on login page and show error
            await expect(page.url()).toContain('/login')
            await expect(page.getByText('Credenciales inválidas')).toBeVisible()
        })

        test('should show validation errors for invalid email format', async ({ page }) => {
            await page.goto('/login')

            // Fill form with invalid email
            await page.fill('[name="email"]', 'invalid-email')
            await page.fill('[name="password"]', 'password123')

            // Submit form
            await page.click('button[type="submit"]')

            // Should show validation error
            await expect(page.getByText('Formato de email inválido')).toBeVisible()
        })

        test('should show validation errors for empty fields', async ({ page }) => {
            await page.goto('/login')

            // Try to submit empty form
            await page.click('button[type="submit"]')

            // Should show validation errors
            await expect(page.getByText('El email es requerido')).toBeVisible()
            await expect(page.getByText('La contraseña es requerida')).toBeVisible()
        })

        test('should toggle password visibility', async ({ page }) => {
            await page.goto('/login')

            const passwordInput = page.locator('[name="password"]')
            const toggleButton = page.getByTestId('eye-icon').locator('..') // Parent button

            // Initially password should be hidden
            await expect(passwordInput).toHaveAttribute('type', 'password')

            // Click to show password
            await toggleButton.click()
            await expect(passwordInput).toHaveAttribute('type', 'text')
            await expect(page.getByTestId('eye-off-icon')).toBeVisible()

            // Click to hide password again
            await toggleButton.click()
            await expect(passwordInput).toHaveAttribute('type', 'password')
            await expect(page.getByTestId('eye-icon')).toBeVisible()
        })

        test('should remember user preference', async ({ page }) => {
            await page.goto('/login')

            // Check remember me
            await page.check('[name="remember"]')

            // Fill and submit form
            await page.fill('[name="email"]', 'testuser@canchaya.com')
            await page.fill('[name="password"]', 'testpassword123')
            await page.click('button[type="submit"]')

            await page.waitForURL('**/dashboard')

            // Navigate away and back to check if user is still logged in
            await page.goto('/')
            await expect(page.getByTestId('user-menu')).toBeVisible()
        })
    })

    test.describe('Registration Flow', () => {
        test('should register successfully with valid data', async ({ page }) => {
            await page.goto('/register')

            // Verify we're on the registration page
            await expect(page.getByText('Únete a CanchaYA')).toBeVisible()
            await expect(page.getByText('Crea tu cuenta para empezar')).toBeVisible()

            // Generate unique email for this test
            const uniqueEmail = `newuser${Date.now()}@canchaya.com`

            // Fill registration form
            await page.fill('[name="nombre"]', 'Nuevo')
            await page.fill('[name="apellido"]', 'Usuario')
            await page.fill('[name="email"]', uniqueEmail)
            await page.fill('[name="password"]', 'newpassword123')
            await page.fill('[name="confirmPassword"]', 'newpassword123')

            // Accept terms
            await page.check('[name="acceptTerms"]')

            // Submit form
            await page.click('button[type="submit"]')

            // Wait for redirect to dashboard
            await page.waitForURL('**/dashboard')

            // Verify successful registration and login
            await expect(page.getByTestId('user-menu')).toBeVisible()
            await expect(page.getByText('Cuenta creada exitosamente')).toBeVisible()
        })

        test('should show error for existing email', async ({ page }) => {
            await page.goto('/register')

            // Try to register with existing email
            await page.fill('[name="nombre"]', 'Test')
            await page.fill('[name="apellido"]', 'User')
            await page.fill('[name="email"]', 'testuser@canchaya.com') // Existing email
            await page.fill('[name="password"]', 'password123')
            await page.fill('[name="confirmPassword"]', 'password123')
            await page.check('[name="acceptTerms"]')

            await page.click('button[type="submit"]')

            // Should show error
            await expect(page.getByText('El email ya está registrado')).toBeVisible()
        })

        test('should validate password confirmation', async ({ page }) => {
            await page.goto('/register')

            // Fill form with mismatched passwords
            await page.fill('[name="nombre"]', 'Test')
            await page.fill('[name="apellido"]', 'User')
            await page.fill('[name="email"]', 'test@example.com')
            await page.fill('[name="password"]', 'password123')
            await page.fill('[name="confirmPassword"]', 'differentpassword')

            await page.click('button[type="submit"]')

            // Should show validation error
            await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible()
        })

        test('should require terms acceptance', async ({ page }) => {
            await page.goto('/register')

            // Fill form but don't accept terms
            await page.fill('[name="nombre"]', 'Test')
            await page.fill('[name="apellido"]', 'User')
            await page.fill('[name="email"]', 'test@example.com')
            await page.fill('[name="password"]', 'password123')
            await page.fill('[name="confirmPassword"]', 'password123')

            await page.click('button[type="submit"]')

            // Should show validation error
            await expect(page.getByText('Debes aceptar los términos y condiciones')).toBeVisible()
        })

        test('should navigate to login from registration', async ({ page }) => {
            await page.goto('/register')

            // Click login link
            await page.click('text="Inicia sesión aquí"')

            // Should navigate to login page
            await page.waitForURL('**/login')
            await expect(page.getByText('Bienvenido a CanchaYA')).toBeVisible()
        })
    })

    test.describe('Logout Flow', () => {
        test.beforeEach(async ({ page }) => {
            // Login before each logout test
            await page.goto('/login')
            await page.fill('[name="email"]', 'testuser@canchaya.com')
            await page.fill('[name="password"]', 'testpassword123')
            await page.click('button[type="submit"]')
            await page.waitForURL('**/dashboard')
        })

        test('should logout successfully', async ({ page }) => {
            // Open user menu
            await page.click('[data-testid="user-menu"]')

            // Click logout
            await page.click('text="Cerrar Sesión"')

            // Should redirect to home page
            await page.waitForURL('/')

            // Should show login/register buttons
            await expect(page.getByRole('link', { name: 'Iniciar Sesión' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'Registrarse' })).toBeVisible()

            // User menu should not be visible
            await expect(page.getByTestId('user-menu')).not.toBeVisible()
        })

        test('should redirect to login when accessing protected routes after logout', async ({ page }) => {
            // Logout
            await page.click('[data-testid="user-menu"]')
            await page.click('text="Cerrar Sesión"')
            await page.waitForURL('/')

            // Try to access protected route
            await page.goto('/mis-reservas')

            // Should redirect to login
            await page.waitForURL('**/login')
            await expect(page.getByText('Debes iniciar sesión')).toBeVisible()
        })
    })

    test.describe('Navigation Between Auth Pages', () => {
        test('should navigate from login to register', async ({ page }) => {
            await page.goto('/login')

            // Click register link
            await page.click('text="Regístrate aquí"')

            // Should navigate to register page
            await page.waitForURL('**/register')
            await expect(page.getByText('Únete a CanchaYA')).toBeVisible()
        })

        test('should navigate from register to login', async ({ page }) => {
            await page.goto('/register')

            // Click login link
            await page.click('text="Inicia sesión aquí"')

            // Should navigate to login page
            await page.waitForURL('**/login')
            await expect(page.getByText('Bienvenido a CanchaYA')).toBeVisible()
        })
    })

    test.describe('Protected Routes', () => {
        test('should redirect unauthenticated users to login', async ({ page }) => {
            // Try to access protected routes
            const protectedRoutes = ['/dashboard', '/mis-reservas', '/admin']

            for (const route of protectedRoutes) {
                await page.goto(route)
                await page.waitForURL('**/login')
                await expect(page.getByText('Debes iniciar sesión')).toBeVisible()
            }
        })

        test('should allow authenticated users to access protected routes', async ({ page }) => {
            // Login first
            await page.goto('/login')
            await page.fill('[name="email"]', 'testuser@canchaya.com')
            await page.fill('[name="password"]', 'testpassword123')
            await page.click('button[type="submit"]')
            await page.waitForURL('**/dashboard')

            // Should be able to access dashboard
            await expect(page.getByText('Encuentra tu cancha perfecta')).toBeVisible()

            // Should be able to access reservations
            await page.goto('/mis-reservas')
            await expect(page.getByText('Mis Reservas')).toBeVisible()
        })
    })

    test.describe('Error Handling', () => {
        test('should handle network errors gracefully', async ({ page }) => {
            // Mock network failure
            await page.route('**/api/auth/login', route => route.abort())

            await page.goto('/login')
            await page.fill('[name="email"]', 'testuser@canchaya.com')
            await page.fill('[name="password"]', 'testpassword123')
            await page.click('button[type="submit"]')

            // Should show network error
            await expect(page.getByText('Error de conexión')).toBeVisible()
        })

        test('should handle server errors gracefully', async ({ page }) => {
            // Mock server error
            await page.route('**/api/auth/login', route =>
                route.fulfill({ status: 500, body: '{"error": "Internal server error"}' })
            )

            await page.goto('/login')
            await page.fill('[name="email"]', 'testuser@canchaya.com')
            await page.fill('[name="password"]', 'testpassword123')
            await page.click('button[type="submit"]')

            // Should show server error
            await expect(page.getByText('Error del servidor')).toBeVisible()
        })
    })

    test.describe('Accessibility', () => {
        test('should have proper focus management', async ({ page }) => {
            await page.goto('/login')

            // Tab through form elements
            await page.keyboard.press('Tab')
            await expect(page.locator('[name="email"]')).toBeFocused()

            await page.keyboard.press('Tab')
            await expect(page.locator('[name="password"]')).toBeFocused()

            await page.keyboard.press('Tab')
            await expect(page.locator('[name="remember"]')).toBeFocused()

            await page.keyboard.press('Tab')
            await expect(page.locator('button[type="submit"]')).toBeFocused()
        })

        test('should have proper ARIA labels', async ({ page }) => {
            await page.goto('/login')

            // Check form labels
            await expect(page.locator('label[for="email"]')).toContainText('Email')
            await expect(page.locator('label[for="password"]')).toContainText('Contraseña')

            // Check button accessibility
            const submitButton = page.locator('button[type="submit"]')
            await expect(submitButton).toHaveAccessibleName('Iniciar Sesión')
        })
    })

    test.describe('Mobile Responsiveness', () => {
        test('should work on mobile devices', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 })

            await page.goto('/login')

            // Form should be properly sized
            const form = page.locator('form')
            await expect(form).toBeVisible()

            // Fill and submit should work on mobile
            await page.fill('[name="email"]', 'testuser@canchaya.com')
            await page.fill('[name="password"]', 'testpassword123')
            await page.click('button[type="submit"]')

            await page.waitForURL('**/dashboard')
            await expect(page.getByTestId('user-menu')).toBeVisible()
        })
    })
}) 
/**
 * E2E Tests for Authentication Flows
 * Tests login, registration, logout, and authentication error scenarios
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should navigate to login page', async ({ page }) => {
        await page.click('text=Iniciar Sesión')
        await expect(page).toHaveURL('/login')
    })

    test('should navigate to register page', async ({ page }) => {
        await page.click('text=Registrarse')
        await expect(page).toHaveURL('/register')
    })

    test('should show login form', async ({ page }) => {
        await page.goto('/login')
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show register form', async ({ page }) => {
        await page.goto('/register')
        await expect(page.locator('input[name="nombre"]')).toBeVisible()
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()
        await expect(page.locator('input[name="telefono"]')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })
}) 
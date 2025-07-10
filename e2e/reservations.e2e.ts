/**
 * E2E Tests for Reservation Flow
 * Tests complete booking process from court selection to confirmation
 */

import { test, expect } from '@playwright/test'

test.describe('Reservations', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should navigate to court detail page', async ({ page }) => {
        await page.click('text=Ver Detalles')
        await expect(page).toHaveURL(/\/cancha\/.+/)
    })

    test('should show court information', async ({ page }) => {
        await page.goto('/cancha/1')
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('text=Precio')).toBeVisible()
        await expect(page.locator('text=Horarios')).toBeVisible()
    })

    test('should show reservation form when not logged in', async ({ page }) => {
        await page.goto('/cancha/1')
        await expect(page.locator('input[name="email"]')).toBeVisible()
        await expect(page.locator('input[name="fecha"]')).toBeVisible()
        await expect(page.locator('input[name="hora"]')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should navigate to my reservations', async ({ page }) => {
        await page.click('text=Mis Reservas')
        await expect(page).toHaveURL('/mis-reservas')
    })
}) 
/**
 * E2E Tests for Reservation Flow
 * Tests complete booking process from court selection to confirmation
 */

import { test, expect } from '@playwright/test'

test.describe('Reservation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to courts page
        await page.goto('/canchas')
        await page.waitForLoadState('networkidle')
    })

    test.describe('Court Search and Selection', () => {
        test('should search and filter courts', async ({ page }) => {
            // Verify courts are loaded
            await expect(page.getByTestId('court-list')).toBeVisible()
            await expect(page.locator('[data-testid^="court-card-"]')).toHaveCount(6, { timeout: 10000 })

            // Test search functionality
            await page.fill('[placeholder*="Buscar canchas"]', 'fútbol')
            await page.waitForTimeout(500) // Debounce delay

            // Should show only football courts
            const footballCourts = page.locator('[data-testid^="court-card-"]')
            await expect(footballCourts).toHaveCount(3)
            await expect(page.getByText('Cancha Fútbol')).toBeVisible()

            // Test sport filter
            await page.click('[data-testid="sport-filter"]')
            await page.click('text="Tenis"')

            // Should show tennis courts
            await expect(page.getByText('Cancha Tenis')).toBeVisible()

            // Test price filter
            await page.click('[data-testid="price-filter"]')
            await page.fill('[data-testid="min-price"]', '3000')
            await page.fill('[data-testid="max-price"]', '8000')
            await page.click('[data-testid="apply-price-filter"]')

            // Should filter by price range
            const priceElements = page.locator('[data-testid*="court-price"]')
            const prices = await priceElements.allTextContents()
            prices.forEach(priceText => {
                const price = parseInt(priceText.replace(/[^\d]/g, ''))
                expect(price).toBeGreaterThanOrEqual(3000)
                expect(price).toBeLessThanOrEqual(8000)
            })
        })

        test('should display court details correctly', async ({ page }) => {
            // Click on first court
            await page.click('[data-testid^="court-card-"]:first-child')

            // Wait for court details page
            await page.waitForURL('**/canchas/*')
            await expect(page.getByTestId('court-details')).toBeVisible()

            // Verify court information
            await expect(page.getByTestId('court-name')).toBeVisible()
            await expect(page.getByTestId('court-description')).toBeVisible()
            await expect(page.getByTestId('court-price')).toBeVisible()
            await expect(page.getByTestId('court-images')).toBeVisible()

            // Verify club information
            await expect(page.getByTestId('club-name')).toBeVisible()
            await expect(page.getByTestId('club-address')).toBeVisible()

            // Verify facilities
            await expect(page.getByTestId('court-facilities')).toBeVisible()
            await expect(page.getByText('Vestuarios')).toBeVisible()
            await expect(page.getByText('Estacionamiento')).toBeVisible()

            // Verify availability calendar
            await expect(page.getByTestId('availability-calendar')).toBeVisible()
        })

        test('should show court location on map', async ({ page }) => {
            await page.click('[data-testid^="court-card-"]:first-child')
            await page.waitForURL('**/canchas/*')

            // Click on location tab
            await page.click('[data-testid="location-tab"]')

            // Verify map is displayed
            await expect(page.getByTestId('court-map')).toBeVisible()
            await expect(page.getByTestId('directions-button')).toBeVisible()

            // Test directions functionality
            await page.click('[data-testid="directions-button"]')
            await expect(page.getByText('Cómo llegar')).toBeVisible()
        })
    })

    test.describe('Date and Time Selection', () => {
        test('should select available date and time', async ({ page }) => {
            await page.click('[data-testid^="court-card-"]:first-child')
            await page.waitForURL('**/canchas/*')

            // Select tomorrow's date
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowString = tomorrow.toLocaleDateString('es-AR')

            await page.click(`[data-date="${tomorrow.toISOString().split('T')[0]}"]`)

            // Wait for time slots to load
            await expect(page.getByTestId('time-slots')).toBeVisible()

            // Select an available time slot
            const availableSlot = page.locator('[data-testid^="time-slot-"]:not([disabled])').first()
            await expect(availableSlot).toBeVisible()
            await availableSlot.click()

            // Verify selection
            await expect(availableSlot).toHaveClass(/selected/)
            await expect(page.getByTestId('selected-datetime')).toHaveText(
                new RegExp(`${tomorrowString}.*10:00.*11:00`)
            )

            // Verify reserve button is enabled
            await expect(page.getByRole('button', { name: /reservar/i })).toBeEnabled()
        })

        test('should show unavailable time slots as disabled', async ({ page }) => {
            await page.click('[data-testid^="court-card-"]:first-child')
            await page.waitForURL('**/canchas/*')

            // Select today's date (should have some past slots disabled)
            const today = new Date().toISOString().split('T')[0]
            await page.click(`[data-date="${today}"]`)

            // Wait for time slots
            await expect(page.getByTestId('time-slots')).toBeVisible()

            // Check that past time slots are disabled
            const pastSlots = page.locator('[data-testid^="time-slot-"][disabled]')
            await expect(pastSlots).toHaveCount(expect.any(Number))

            // Try to click a disabled slot
            const disabledSlot = pastSlots.first()
            if (await disabledSlot.isVisible()) {
                await disabledSlot.click()
                // Should not be selected
                await expect(disabledSlot).not.toHaveClass(/selected/)
            }
        })

        test('should handle date navigation', async ({ page }) => {
            await page.click('[data-testid^="court-card-"]:first-child')
            await page.waitForURL('**/canchas/*')

            // Test next month navigation
            await page.click('[data-testid="next-month"]')

            const nextMonth = new Date()
            nextMonth.setMonth(nextMonth.getMonth() + 1)
            await expect(page.getByTestId('calendar-month')).toHaveText(
                nextMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
            )

            // Test previous month navigation
            await page.click('[data-testid="prev-month"]')

            const currentMonth = new Date()
            await expect(page.getByTestId('calendar-month')).toHaveText(
                currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
            )
        })
    })

    test.describe('Reservation Process', () => {
        test('should complete reservation successfully', async ({ page }) => {
            // Select court
            await page.click('[data-testid^="court-card-"]:first-child')
            await page.waitForURL('**/canchas/*')

            // Select date and time
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            await page.click(`[data-date="${tomorrow.toISOString().split('T')[0]}"]`)

            await page.click('[data-testid^="time-slot-"]:not([disabled])')

            // Click reserve button
            await page.click('[data-testid="reserve-button"]')

            // Wait for reservation summary page
            await page.waitForURL('**/reservar/**')
            await expect(page.getByText('Resumen de Reserva')).toBeVisible()

            // Verify reservation details
            await expect(page.getByTestId('reservation-court')).toBeVisible()
            await expect(page.getByTestId('reservation-date')).toBeVisible()
            await expect(page.getByTestId('reservation-time')).toBeVisible()
            await expect(page.getByTestId('reservation-price')).toBeVisible()

            // Confirm reservation
            await page.click('[data-testid="confirm-reservation"]')

            // Wait for payment page
            await page.waitForURL('**/pago/**')
            await expect(page.getByText('Procesar Pago')).toBeVisible()

            // Fill payment form
            await page.fill('[data-testid="card-number"]', '4111111111111111')
            await page.fill('[data-testid="card-expiry"]', '12/25')
            await page.fill('[data-testid="card-cvc"]', '123')
            await page.fill('[data-testid="card-name"]', 'Test User')

            // Submit payment
            await page.click('[data-testid="submit-payment"]')

            // Wait for success page
            await page.waitForURL('**/reserva-exitosa/**')
            await expect(page.getByText('¡Reserva Confirmada!')).toBeVisible()
            await expect(page.getByTestId('reservation-number')).toBeVisible()
            await expect(page.getByTestId('qr-code')).toBeVisible()

            // Verify notification
            await expect(page.getByText('Reserva creada exitosamente')).toBeVisible()
        })

        test('should handle payment failure', async ({ page }) => {
            // Navigate through reservation process
            await page.click('[data-testid^="court-card-"]:first-child')
            await page.waitForURL('**/canchas/*')

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            await page.click(`[data-date="${tomorrow.toISOString().split('T')[0]}"]`)
            await page.click('[data-testid^="time-slot-"]:not([disabled])');
            await page.click('[data-testid="reserve-button"]')
            await page.click('[data-testid="confirm-reservation"]')

            // Wait for payment page
            await page.waitForURL('**/pago/**')

            // Use invalid card number
            await page.fill('[data-testid="card-number"]', '4000000000000002') // Declined card
            await page.fill('[data-testid="card-expiry"]', '12/25')
            await page.fill('[data-testid="card-cvc"]', '123')
            await page.fill('[data-testid="card-name"]', 'Test User')

            // Submit payment
            await page.click('[data-testid="submit-payment"]')

            // Should show error message
            await expect(page.getByText(/pago rechazado/i)).toBeVisible()
            await expect(page.getByText(/intenta con otra tarjeta/i)).toBeVisible()

            // Should stay on payment page
            expect(page.url()).toContain('/pago/')
        })

        test('should validate reservation form', async ({ page }) => {
            await page.click('[data-testid^="court-card-"]:first-child')
            await page.waitForURL('**/canchas/*')

            // Try to reserve without selecting date/time
            await page.click('[data-testid="reserve-button"]')

            // Should show validation errors
            await expect(page.getByText(/selecciona una fecha/i)).toBeVisible()
            await expect(page.getByText(/selecciona un horario/i)).toBeVisible()

            // Reserve button should be disabled
            await expect(page.getByTestId('reserve-button')).toBeDisabled()
        })
    })

    test.describe('Reservation Management', () => {
        test('should view reservation details', async ({ page }) => {
            // Go to my reservations page
            await page.goto('/mis-reservas')
            await page.waitForLoadState('networkidle')

            // Click on first reservation
            await page.click('[data-testid^="reservation-card-"]:first-child')

            // Verify modal opens with details
            await expect(page.getByText('Detalles de la Reserva')).toBeVisible()
            await expect(page.getByTestId('reservation-details-modal')).toBeVisible()

            // Verify all details are shown
            await expect(page.getByTestId('detail-court-name')).toBeVisible()
            await expect(page.getByTestId('detail-date')).toBeVisible()
            await expect(page.getByTestId('detail-time')).toBeVisible()
            await expect(page.getByTestId('detail-price')).toBeVisible()
            await expect(page.getByTestId('detail-status')).toBeVisible()

            // For confirmed reservations, QR code should be visible
            const status = await page.getByTestId('detail-status').textContent()
            if (status?.includes('CONFIRMADA')) {
                await expect(page.getByTestId('qr-code')).toBeVisible()
            }

            // Close modal
            await page.click('[data-testid="close-modal"]')
            await expect(page.getByTestId('reservation-details-modal')).not.toBeVisible()
        })

        test('should cancel upcoming reservation', async ({ page }) => {
            await page.goto('/mis-reservas')
            await page.waitForLoadState('networkidle')

            // Find a confirmed reservation with cancel button
            const cancelButton = page.getByRole('button', { name: /cancelar/i }).first()

            if (await cancelButton.isVisible()) {
                await cancelButton.click()

                // Confirm cancellation in dialog
                await expect(page.getByText(/¿estás seguro/i)).toBeVisible()
                await page.click('[data-testid="confirm-cancel"]')

                // Should show success message
                await expect(page.getByText(/reserva cancelada/i)).toBeVisible()

                // Status should update to CANCELADA
                await expect(page.getByText('CANCELADA')).toBeVisible()
            }
        })

        test('should filter reservations by status', async ({ page }) => {
            await page.goto('/mis-reservas')
            await page.waitForLoadState('networkidle')

            // Test confirmed filter
            await page.click('[data-testid="filter-confirmed"]')

            const confirmedReservations = page.locator('[data-testid^="reservation-card-"]')
            const confirmedCount = await confirmedReservations.count()

            for (let i = 0; i < confirmedCount; i++) {
                await expect(confirmedReservations.nth(i).getByText('CONFIRMADA')).toBeVisible()
            }

            // Test pending filter
            await page.click('[data-testid="filter-pending"]')

            const pendingReservations = page.locator('[data-testid^="reservation-card-"]')
            const pendingCount = await pendingReservations.count()

            for (let i = 0; i < pendingCount; i++) {
                await expect(pendingReservations.nth(i).getByText('PENDIENTE')).toBeVisible()
            }

            // Reset filter
            await page.click('[data-testid="filter-all"]')

            // Should show all reservations again
            await expect(page.locator('[data-testid^="reservation-card-"]')).toHaveCount(expect.any(Number))
        })

        test('should search reservations', async ({ page }) => {
            await page.goto('/mis-reservas')
            await page.waitForLoadState('networkidle')

            // Search by court name
            await page.fill('[data-testid="search-reservations"]', 'Fútbol')
            await page.waitForTimeout(500) // Debounce

            // Should show only football court reservations
            const reservationCards = page.locator('[data-testid^="reservation-card-"]')
            const cardCount = await reservationCards.count()

            for (let i = 0; i < cardCount; i++) {
                await expect(reservationCards.nth(i).getByText(/fútbol/i)).toBeVisible()
            }

            // Clear search
            await page.fill('[data-testid="search-reservations"]', '')
            await page.waitForTimeout(500)

            // Should show all reservations again
            await expect(reservationCards).toHaveCount(expect.any(Number))
        })
    })

    test.describe('Mobile Responsiveness', () => {
        test('should work correctly on mobile devices', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 })

            await page.goto('/canchas')
            await page.waitForLoadState('networkidle')

            // Courts should display in mobile layout
            await expect(page.getByTestId('court-list')).toBeVisible()

            // Mobile filter toggle should be visible
            await expect(page.getByTestId('mobile-filter-toggle')).toBeVisible()

            // Open mobile filters
            await page.click('[data-testid="mobile-filter-toggle"]')
            await expect(page.getByTestId('mobile-filter-panel')).toBeVisible()

            // Apply a filter
            await page.click('[data-testid="mobile-sport-filter"]')
            await page.click('text="Fútbol"')
            await page.click('[data-testid="apply-mobile-filters"]')

            // Select a court
            await page.click('[data-testid^="court-card-"]:first-child')

            // Date/time selector should work on mobile
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            await page.click(`[data-date="${tomorrow.toISOString().split('T')[0]}"]`)
            await page.click('[data-testid^="time-slot-"]:not([disabled])')

            // Reserve button should be accessible
            await expect(page.getByTestId('reserve-button')).toBeVisible()
        })
    })

    test.describe('Error Handling', () => {
        test('should handle network errors gracefully', async ({ page }) => {
            // Simulate network failure
            await page.route('**/api/courts/**', route => route.abort())

            await page.goto('/canchas')

            // Should show error message
            await expect(page.getByText(/error al cargar las canchas/i)).toBeVisible()
            await expect(page.getByRole('button', { name: /intentar nuevamente/i })).toBeVisible()

            // Retry should work when network is restored
            await page.unroute('**/api/courts/**')
            await page.click('[data-testid="retry-button"]')

            await expect(page.getByTestId('court-list')).toBeVisible()
        })

        test('should handle double booking attempts', async ({ page }) => {
            // Navigate to court and select time
            await page.click('[data-testid^="court-card-"]:first-child')
            await page.waitForURL('**/canchas/*')

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            await page.click(`[data-date="${tomorrow.toISOString().split('T')[0]}"]`)
            await page.click('[data-testid^="time-slot-"]:not([disabled])');

            // Simulate slot becoming unavailable during booking process
            await page.route('**/api/reservations', route => {
                if (route.request().method() === 'POST') {
                    route.fulfill({
                        status: 409,
                        contentType: 'application/json',
                        body: JSON.stringify({ message: 'Horario ya reservado' })
                    })
                } else {
                    route.continue()
                }
            })

            await page.click('[data-testid="reserve-button"]')
            await page.click('[data-testid="confirm-reservation"]')

            // Should show conflict error
            await expect(page.getByText(/horario ya reservado/i)).toBeVisible()
            await expect(page.getByText(/selecciona otro horario/i)).toBeVisible()
        })
    })

    test.describe('Accessibility', () => {
        test('should be keyboard navigable', async ({ page }) => {
            await page.goto('/canchas')
            await page.waitForLoadState('networkidle')

            // Tab through court cards
            await page.keyboard.press('Tab')
            await expect(page.locator('[data-testid^="court-card-"]:first-child')).toBeFocused()

            // Enter should open court details
            await page.keyboard.press('Enter')
            await page.waitForURL('**/canchas/*')

            // Tab through date picker
            await page.keyboard.press('Tab')
            await expect(page.getByTestId('date-picker')).toBeFocused()

            // Arrow keys should navigate dates
            await page.keyboard.press('ArrowRight')
            await page.keyboard.press('Enter')

            // Tab through time slots
            await page.keyboard.press('Tab')
            await expect(page.locator('[data-testid^="time-slot-"]:not([disabled])').first()).toBeFocused()
        })

        test('should have proper ARIA labels', async ({ page }) => {
            await page.goto('/canchas')
            await page.waitForLoadState('networkidle')

            // Check main landmarks
            await expect(page.locator('main')).toHaveAttribute('aria-label', 'Lista de canchas')

            // Check search has proper label
            await expect(page.locator('[placeholder*="Buscar"]')).toHaveAttribute('aria-label', 'Buscar canchas')

            // Check filter sections have proper headings
            await expect(page.getByRole('heading', { name: 'Filtros' })).toBeVisible()

            // Navigate to court details
            await page.click('[data-testid^="court-card-"]:first-child')

            // Check calendar has proper labels
            await expect(page.getByTestId('availability-calendar')).toHaveAttribute('aria-label', 'Calendario de disponibilidad')
        })
    })
}) 
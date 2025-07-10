/**
 * Global Setup for Playwright E2E Tests
 * Prepares authentication states and test environment
 */

import { chromium, FullConfig } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

async function globalSetup(config: FullConfig) {
    console.log('🚀 Starting global setup...')

    const { baseURL } = config.projects[0].use
    const browser = await chromium.launch()

    // Create auth directory
    const authDir = path.join(process.cwd(), 'playwright/.auth')
    const fs = await import('fs')
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
    }

    // Setup regular user authentication
    console.log('🔐 Setting up user authentication...')
    const userContext = await browser.newContext()
    const userPage = await userContext.newPage()

    try {
        // Navigate to login page
        await userPage.goto(`${baseURL}/login`)

        // Fill login form with test user credentials
        await userPage.fill('[name="email"]', 'testuser@canchaya.com')
        await userPage.fill('[name="password"]', 'testpassword123')

        // Submit login form
        await userPage.click('button[type="submit"]')

        // Wait for successful login and redirect
        await userPage.waitForURL('**/dashboard', { timeout: 10000 })

        // Verify we're logged in by checking for user-specific elements
        await userPage.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 })

        // Save authentication state
        await userContext.storageState({
            path: path.join(authDir, 'user.json')
        })

        console.log('✅ User authentication state saved')
    } catch (error) {
        console.error('❌ Failed to setup user authentication:', error)
        // Continue with setup even if auth fails
    } finally {
        await userContext.close()
    }

    // Setup admin user authentication
    console.log('🔐 Setting up admin authentication...')
    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()

    try {
        // Navigate to login page
        await adminPage.goto(`${baseURL}/login`)

        // Fill login form with admin credentials
        await adminPage.fill('[name="email"]', 'admin@canchaya.com')
        await adminPage.fill('[name="password"]', 'adminpassword123')

        // Submit login form
        await adminPage.click('button[type="submit"]')

        // Wait for successful login and redirect to admin dashboard
        await adminPage.waitForURL('**/admin', { timeout: 10000 })

        // Verify we're logged in as admin
        await adminPage.waitForSelector('[data-testid="admin-sidebar"]', { timeout: 5000 })

        // Save admin authentication state
        await adminContext.storageState({
            path: path.join(authDir, 'admin.json')
        })

        console.log('✅ Admin authentication state saved')
    } catch (error) {
        console.error('❌ Failed to setup admin authentication:', error)
        // Continue with setup even if auth fails
    } finally {
        await adminContext.close()
    }

    await browser.close()

    // Setup test data
    console.log('📊 Setting up test data...')
    try {
        await setupTestData(baseURL!)
        console.log('✅ Test data setup completed')
    } catch (error) {
        console.error('❌ Failed to setup test data:', error)
    }

    console.log('🎉 Global setup completed')
}

/**
 * Setup test data for E2E tests
 */
async function setupTestData(baseURL: string) {
    // Create test courts, users, and reservations
    const testData = {
        courts: [
            {
                id: 'test-court-1',
                nombre: 'Cancha Test 1',
                descripcion: 'Cancha de prueba para E2E tests',
                precio: 5000,
                disponible: true,
                club: {
                    nombre: 'Club Test',
                    direccion: 'Dirección Test 123, Rosario'
                },
                deporte: {
                    nombre: 'Fútbol'
                }
            },
            {
                id: 'test-court-2',
                nombre: 'Cancha Test 2',
                descripcion: 'Segunda cancha de prueba',
                precio: 7000,
                disponible: true,
                club: {
                    nombre: 'Club Test 2',
                    direccion: 'Dirección Test 456, Rosario'
                },
                deporte: {
                    nombre: 'Tenis'
                }
            }
        ],
        users: [
            {
                id: 'test-user-1',
                email: 'testuser@canchaya.com',
                password: 'testpassword123',
                nombre: 'Usuario',
                apellido: 'Prueba',
                rol: 'JUGADOR'
            },
            {
                id: 'admin-user-1',
                email: 'admin@canchaya.com',
                password: 'adminpassword123',
                nombre: 'Admin',
                apellido: 'Test',
                rol: 'ADMINISTRADOR'
            }
        ],
        reservations: [
            {
                id: 'test-reservation-1',
                fecha: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
                horaInicio: '10:00',
                horaFin: '11:00',
                estado: 'CONFIRMADA',
                courtId: 'test-court-1',
                userId: 'test-user-1'
            }
        ]
    }

    // In a real scenario, you would seed this data to your test database
    // For now, we'll store it in a JSON file for mock API responses
    const fs = await import('fs')
    const testDataPath = path.join(process.cwd(), 'e2e/test-data.json')

    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2))
}

export default globalSetup 
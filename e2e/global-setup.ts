/**
 * Global Setup for Playwright E2E Tests
 * Prepares authentication states and test environment
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    // Add any global setup here
    // For example, setting up test data or authentication
    
    await browser.close()
}

export default globalSetup 
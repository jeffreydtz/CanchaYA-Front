/**
 * Global Teardown for Playwright E2E Tests
 * Cleans up test environment and resources
 */

import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
    // Add any global cleanup here
    // For example, cleaning up test data
}

export default globalTeardown 
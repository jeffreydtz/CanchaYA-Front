/**
 * Playwright Configuration for CanchaYA E2E Testing
 * Supports multiple browsers, mobile testing, and CI/CD environments
 */

import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,

    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: process.env.CI ? [
        ['html'],
        ['json', { outputFile: 'e2e-results.json' }],
        ['junit', { outputFile: 'e2e-results.xml' }],
        ['github', {}]
    ] : [
        ['html'],
        ['json', { outputFile: 'e2e-results.json' }],
        ['junit', { outputFile: 'e2e-results.xml' }],
        ['list']
    ],

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        /* Take screenshot only when test fails */
        screenshot: 'only-on-failure',

        /* Record video only when test fails */
        video: 'retain-on-failure',

        /* Default timeout for actions */
        actionTimeout: 10000,

        /* Default timeout for navigation */
        navigationTimeout: 30000,
    },

    /* Configure global setup and teardown */
    globalSetup: require.resolve('./e2e/global-setup.ts'),
    globalTeardown: require.resolve('./e2e/global-teardown.ts'),

    /* Configure projects for major browsers */
    projects: [
        // Setup project to prepare test environment
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },

        // Desktop Chrome
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Use prepared auth state for authenticated tests
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },

        // Desktop Firefox
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },

        // Desktop Safari
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },

        /* Test against mobile viewports. */
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },

        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 12'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },

        /* Test admin functionality */
        {
            name: 'admin-chrome',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/admin.json',
            },
            dependencies: ['setup'],
            testMatch: /.*admin.*\.e2e\.ts/,
        },

        /* Test unauthenticated user flows */
        {
            name: 'guest-chrome',
            use: {
                ...devices['Desktop Chrome'],
                // No storage state for guest users
            },
            testMatch: /.*guest.*\.e2e\.ts/,
        },

        /* Visual regression testing */
        {
            name: 'visual-chrome',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
            testMatch: /.*visual.*\.e2e\.ts/,
        },

        /* Accessibility testing */
        {
            name: 'accessibility',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
            testMatch: /.*a11y.*\.e2e\.ts/,
        },
    ],

    /* Configure test environment */
    timeout: 30000,
    expect: {
        /* Maximum time expect() should wait for the condition to be met. */
        timeout: 10000,

        /* Threshold for visual comparisons */
        toHaveScreenshot: {
            threshold: 0.3,
            mode: 'local'
        },
    },

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },

    /* Test output directory */
    outputDir: 'test-results/',

    /* Test artifacts */
    testIdAttribute: 'data-testid',
}) 
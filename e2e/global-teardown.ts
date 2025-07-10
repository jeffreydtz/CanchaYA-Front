/**
 * Global Teardown for Playwright E2E Tests
 * Cleans up test environment and resources
 */

import { FullConfig } from '@playwright/test'
import path from 'path'

async function globalTeardown(config: FullConfig) {
    console.log('🧹 Starting global teardown...')

    try {
        // Clean up test data
        await cleanupTestData()
        console.log('✅ Test data cleanup completed')

        // Clean up screenshots and videos from previous runs (optional)
        await cleanupTestArtifacts()
        console.log('✅ Test artifacts cleanup completed')

        // Clean up authentication files (optional - you might want to keep them)
        // await cleanupAuthFiles()
        // console.log('✅ Authentication files cleanup completed')

    } catch (error) {
        console.error('❌ Error during teardown:', error)
    }

    console.log('🎉 Global teardown completed')
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
    const fs = await import('fs')
    const testDataPath = path.join(process.cwd(), 'e2e/test-data.json')

    if (fs.existsSync(testDataPath)) {
        fs.unlinkSync(testDataPath)
    }

    // In a real scenario, you would clean up test database records here
    // Example:
    // - Delete test users
    // - Delete test courts
    // - Delete test reservations
    // - Reset any modified system state
}

/**
 * Clean up test artifacts from previous runs
 */
async function cleanupTestArtifacts() {
    const fs = await import('fs')

    // Clean up old test results
    const testResultsDir = path.join(process.cwd(), 'test-results')
    if (fs.existsSync(testResultsDir)) {
        const files = fs.readdirSync(testResultsDir)
        const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

        files.forEach(file => {
            const filePath = path.join(testResultsDir, file)
            const stats = fs.statSync(filePath)

            if (stats.isDirectory() && stats.mtime < cutoffDate) {
                fs.rmSync(filePath, { recursive: true, force: true })
            }
        })
    }

    // Clean up old playwright reports
    const playwrightReportDir = path.join(process.cwd(), 'playwright-report')
    if (fs.existsSync(playwrightReportDir)) {
        // Keep only the latest report
        const files = fs.readdirSync(playwrightReportDir)
        const oldReports = files.filter(file => file.startsWith('index-') && file.endsWith('.html'))

        if (oldReports.length > 5) {
            // Keep only the 5 most recent reports
            oldReports
                .sort((a, b) => {
                    const aPath = path.join(playwrightReportDir, a)
                    const bPath = path.join(playwrightReportDir, b)
                    return fs.statSync(bPath).mtime.getTime() - fs.statSync(aPath).mtime.getTime()
                })
                .slice(5)
                .forEach(file => {
                    const filePath = path.join(playwrightReportDir, file)
                    fs.unlinkSync(filePath)
                })
        }
    }
}

/**
 * Clean up authentication files (optional)
 */
async function cleanupAuthFiles() {
    const fs = await import('fs')
    const authDir = path.join(process.cwd(), 'playwright/.auth')

    if (fs.existsSync(authDir)) {
        // Only clean up if specifically requested
        // You might want to keep auth files between test runs for faster execution
        const authFiles = fs.readdirSync(authDir)
        authFiles.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(authDir, file)
                fs.unlinkSync(filePath)
            }
        })
    }
}

export default globalTeardown 
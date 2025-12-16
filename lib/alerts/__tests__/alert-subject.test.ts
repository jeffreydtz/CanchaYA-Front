/**
 * Tests for AlertSubject (Observer Pattern Subject)
 */

import { AlertSubject, resetAlertSubject } from '../alert-subject'
import {
  IAlertObserver,
  Alert,
  AlertDeliveryResult,
  AlertChannel,
  AlertType,
  AlertSeverity,
  AlertStatus
} from '../types'

// Mock Observer para testing
class MockObserver implements IAlertObserver {
  id: string
  channels: AlertChannel[]
  notifications: Alert[] = []
  shouldFail: boolean = false

  constructor(id: string, channels: AlertChannel[]) {
    this.id = id
    this.channels = channels
  }

  canHandle(alert: Alert): boolean {
    return alert.channels.some(channel => this.channels.includes(channel))
  }

  async notify(alert: Alert): Promise<AlertDeliveryResult> {
    this.notifications.push(alert)

    if (this.shouldFail) {
      return {
        channel: this.channels[0],
        success: false,
        error: 'Mock error'
      }
    }

    return {
      channel: this.channels[0],
      success: true,
      sentAt: new Date()
    }
  }
}

describe('AlertSubject', () => {
  let alertSubject: AlertSubject

  beforeEach(() => {
    resetAlertSubject()
    alertSubject = new AlertSubject()
  })

  describe('Observer Management', () => {
    it('should attach an observer', () => {
      const observer = new MockObserver('test-1', [AlertChannel.EMAIL])
      alertSubject.attach(observer)

      expect(alertSubject.getObservers()).toHaveLength(1)
      expect(alertSubject.getObserver('test-1')).toBe(observer)
    })

    it('should not attach duplicate observers', () => {
      const observer = new MockObserver('test-1', [AlertChannel.EMAIL])
      alertSubject.attach(observer)

      expect(() => {
        alertSubject.attach(observer)
      }).toThrow('Observer with id test-1 already exists')
    })

    it('should detach an observer', () => {
      const observer = new MockObserver('test-1', [AlertChannel.EMAIL])
      alertSubject.attach(observer)

      const result = alertSubject.detach('test-1')

      expect(result).toBe(true)
      expect(alertSubject.getObservers()).toHaveLength(0)
    })

    it('should return false when detaching non-existent observer', () => {
      const result = alertSubject.detach('non-existent')
      expect(result).toBe(false)
    })

    it('should get observers by channels', () => {
      const emailObserver = new MockObserver('email', [AlertChannel.EMAIL])
      const pushObserver = new MockObserver('push', [AlertChannel.PUSH])
      const multiObserver = new MockObserver('multi', [AlertChannel.EMAIL, AlertChannel.PUSH])

      alertSubject.attach(emailObserver)
      alertSubject.attach(pushObserver)
      alertSubject.attach(multiObserver)

      const emailObservers = alertSubject.getObserversByChannels([AlertChannel.EMAIL])
      expect(emailObservers).toHaveLength(2)
      expect(emailObservers).toContain(emailObserver)
      expect(emailObservers).toContain(multiObserver)
    })
  })

  describe('Alert Notification', () => {
    it('should notify relevant observers', async () => {
      const emailObserver = new MockObserver('email', [AlertChannel.EMAIL])
      const pushObserver = new MockObserver('push', [AlertChannel.PUSH])

      alertSubject.attach(emailObserver)
      alertSubject.attach(pushObserver)

      const { alert, results } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test Alert',
        message: 'Test message',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL]
      })

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true)
      expect(emailObserver.notifications).toHaveLength(1)
      expect(pushObserver.notifications).toHaveLength(0)
    })

    it('should update alert status after notification', async () => {
      const observer = new MockObserver('test', [AlertChannel.EMAIL])
      alertSubject.attach(observer)

      const { alert } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL]
      })

      expect(alert.status).toBe(AlertStatus.SENT)
      expect(alert.sentAt).toBeDefined()
    })

    it('should handle observer failures gracefully', async () => {
      const observer = new MockObserver('test', [AlertChannel.EMAIL])
      observer.shouldFail = true

      alertSubject.attach(observer)

      const { alert, results } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL]
      })

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(false)
      expect(alert.status).toBe(AlertStatus.FAILED)
    })

    it('should notify multiple observers for multiple channels', async () => {
      const emailObserver = new MockObserver('email', [AlertChannel.EMAIL])
      const pushObserver = new MockObserver('push', [AlertChannel.PUSH])
      const inAppObserver = new MockObserver('in-app', [AlertChannel.IN_APP])

      alertSubject.attach(emailObserver)
      alertSubject.attach(pushObserver)
      alertSubject.attach(inAppObserver)

      const { results } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL, AlertChannel.PUSH, AlertChannel.IN_APP]
      })

      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
    })
  })

  describe('Scheduled Alerts', () => {
    it('should create scheduled alert without immediate notification', async () => {
      const observer = new MockObserver('test', [AlertChannel.EMAIL])
      alertSubject.attach(observer)

      const futureDate = new Date(Date.now() + 60000) // 1 minute in future

      const { alert, results } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_REMINDER,
        severity: AlertSeverity.INFO,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL],
        scheduledFor: futureDate
      })

      expect(alert.status).toBe(AlertStatus.SCHEDULED)
      expect(results).toHaveLength(0)
      expect(observer.notifications).toHaveLength(0)
    })
  })

  describe('Alert Retry', () => {
    it('should retry failed alert', async () => {
      const observer = new MockObserver('test', [AlertChannel.EMAIL])
      observer.shouldFail = true

      alertSubject.attach(observer)

      const { alert } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL]
      })

      expect(alert.status).toBe(AlertStatus.FAILED)
      expect(alert.retryCount).toBe(0)

      // Now make it succeed
      observer.shouldFail = false

      const retryResults = await alertSubject.retry(alert.id)

      expect(retryResults[0].success).toBe(true)

      const updatedAlert = alertSubject.getAlert(alert.id)
      expect(updatedAlert?.retryCount).toBe(1)
      expect(updatedAlert?.status).toBe(AlertStatus.SENT)
    })

    it('should throw error when retrying non-existent alert', async () => {
      await expect(alertSubject.retry('non-existent')).rejects.toThrow('Alert non-existent not found')
    })

    it('should throw error when retrying already sent alert', async () => {
      const observer = new MockObserver('test', [AlertChannel.EMAIL])
      alertSubject.attach(observer)

      const { alert } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL]
      })

      await expect(alertSubject.retry(alert.id)).rejects.toThrow('was already sent successfully')
    })
  })

  describe('Alert Cancellation', () => {
    it('should cancel scheduled alert', async () => {
      const futureDate = new Date(Date.now() + 60000)

      const { alert } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_REMINDER,
        severity: AlertSeverity.INFO,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL],
        scheduledFor: futureDate
      })

      const result = alertSubject.cancel(alert.id)

      expect(result).toBe(true)

      const cancelledAlert = alertSubject.getAlert(alert.id)
      expect(cancelledAlert?.status).toBe(AlertStatus.CANCELLED)
    })

    it('should not cancel already sent alert', async () => {
      const observer = new MockObserver('test', [AlertChannel.EMAIL])
      alertSubject.attach(observer)

      const { alert } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL]
      })

      expect(() => {
        alertSubject.cancel(alert.id)
      }).toThrow('Cannot cancel alert')
    })

    it('should return false for non-existent alert', () => {
      const result = alertSubject.cancel('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('History Management', () => {
    it('should store delivery history', async () => {
      const observer = new MockObserver('test', [AlertChannel.EMAIL])
      alertSubject.attach(observer)

      const { alert } = await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL]
      })

      const history = alertSubject.getDeliveryHistory(alert.id)

      expect(history).toBeDefined()
      expect(history).toHaveLength(1)
      expect(history![0].channel).toBe(AlertChannel.EMAIL)
      expect(history![0].success).toBe(true)
    })

    it('should clean old alerts', async () => {
      const observer = new MockObserver('test', [AlertChannel.EMAIL])
      alertSubject.attach(observer)

      await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL]
      })

      const oneHourFromNow = new Date(Date.now() + 3600000)
      const removed = alertSubject.cleanHistory(oneHourFromNow)

      expect(removed).toBe(1)
      expect(alertSubject.getAllAlerts()).toHaveLength(0)
    })
  })

  describe('Statistics', () => {
    it('should provide accurate statistics', async () => {
      const emailObserver = new MockObserver('email', [AlertChannel.EMAIL])
      const pushObserver = new MockObserver('push', [AlertChannel.PUSH])

      alertSubject.attach(emailObserver)
      alertSubject.attach(pushObserver)

      await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CONFIRMED,
        severity: AlertSeverity.SUCCESS,
        title: 'Test 1',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.EMAIL]
      })

      await alertSubject.createAndNotify({
        type: AlertType.RESERVATION_CANCELLED,
        severity: AlertSeverity.WARNING,
        title: 'Test 2',
        message: 'Test',
        recipients: [{ userId: 'user-1', email: 'test@test.com' }],
        channels: [AlertChannel.PUSH]
      })

      const stats = alertSubject.getStats()

      expect(stats.totalAlerts).toBe(2)
      expect(stats.totalObservers).toBe(2)
      expect(stats.byStatus[AlertStatus.SENT]).toBe(2)
      expect(stats.byType[AlertType.RESERVATION_CONFIRMED]).toBe(1)
      expect(stats.byType[AlertType.RESERVATION_CANCELLED]).toBe(1)
      expect(stats.bySeverity[AlertSeverity.SUCCESS]).toBe(1)
      expect(stats.bySeverity[AlertSeverity.WARNING]).toBe(1)
    })
  })
})

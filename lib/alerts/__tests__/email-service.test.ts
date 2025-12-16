/**
 * Tests for EmailService
 */

import { EmailService } from '../services/email-service'
import { EmailConfig } from '../types'

// Mock fetch globally
global.fetch = jest.fn()

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize with SMTP provider', () => {
      const config: EmailConfig = {
        provider: 'smtp',
        from: { email: 'test@example.com', name: 'Test' },
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: 'user', pass: 'pass' }
        }
      }

      const service = new EmailService(config)
      expect(service).toBeDefined()
    })

    it('should initialize with SendGrid provider', () => {
      const config: EmailConfig = {
        provider: 'sendgrid',
        apiKey: 'test-api-key',
        from: { email: 'test@example.com', name: 'Test' }
      }

      const service = new EmailService(config)
      expect(service).toBeDefined()
    })

    it('should initialize with Resend provider', () => {
      const config: EmailConfig = {
        provider: 'resend',
        apiKey: 'test-api-key',
        from: { email: 'test@example.com', name: 'Test' }
      }

      const service = new EmailService(config)
      expect(service).toBeDefined()
    })

    it('should throw error for unsupported provider', () => {
      const config: any = {
        provider: 'unsupported',
        from: { email: 'test@example.com', name: 'Test' }
      }

      expect(() => new EmailService(config)).toThrow('Unsupported email provider')
    })

    it('should throw error for SendGrid without API key', () => {
      const config: EmailConfig = {
        provider: 'sendgrid',
        from: { email: 'test@example.com', name: 'Test' }
      }

      expect(() => new EmailService(config)).toThrow('SendGrid API key is required')
    })
  })

  describe('Validation', () => {
    let service: EmailService

    beforeEach(() => {
      const config: EmailConfig = {
        provider: 'smtp',
        from: { email: 'test@example.com', name: 'Test' },
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: 'user', pass: 'pass' }
        }
      }
      service = new EmailService(config)
    })

    it('should reject email without recipient', async () => {
      const result = await service.send({
        to: '',
        subject: 'Test',
        text: 'Test message'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Recipient email is required')
    })

    it('should reject email without subject', async () => {
      const result = await service.send({
        to: 'test@example.com',
        subject: '',
        text: 'Test message'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Subject is required')
    })

    it('should reject email without body', async () => {
      const result = await service.send({
        to: 'test@example.com',
        subject: 'Test',
        text: ''
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Email body')
    })
  })

  describe('SendGrid Integration', () => {
    let service: EmailService

    beforeEach(() => {
      const config: EmailConfig = {
        provider: 'sendgrid',
        apiKey: 'test-api-key',
        from: { email: 'sender@example.com', name: 'Sender' }
      }
      service = new EmailService(config)
    })

    it('should send email successfully via SendGrid', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('message-id-123')
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await service.send({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test message',
        html: '<p>Test message</p>'
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('message-id-123')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.sendgrid.com/v3/mail/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should handle SendGrid API error', async () => {
      const mockResponse = {
        ok: false,
        text: jest.fn().mockResolvedValue('API Error')
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await service.send({
        to: 'recipient@example.com',
        subject: 'Test',
        text: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('SendGrid API error')
    })

    it('should support multiple recipients', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('message-id-123')
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await service.send({
        to: ['recipient1@example.com', 'recipient2@example.com'],
        subject: 'Test',
        text: 'Test'
      })

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1]
      const payload = JSON.parse(callArgs.body)

      expect(payload.personalizations[0].to).toHaveLength(2)
      expect(payload.personalizations[0].to[0].email).toBe('recipient1@example.com')
      expect(payload.personalizations[0].to[1].email).toBe('recipient2@example.com')
    })

    it('should support CC and BCC', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('message-id-123')
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await service.send({
        to: 'recipient@example.com',
        subject: 'Test',
        text: 'Test',
        cc: 'cc@example.com',
        bcc: 'bcc@example.com'
      })

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1]
      const payload = JSON.parse(callArgs.body)

      expect(payload.personalizations[0].cc).toHaveLength(1)
      expect(payload.personalizations[0].bcc).toHaveLength(1)
    })
  })

  describe('Resend Integration', () => {
    let service: EmailService

    beforeEach(() => {
      const config: EmailConfig = {
        provider: 'resend',
        apiKey: 'test-api-key',
        from: { email: 'sender@example.com', name: 'Sender' }
      }
      service = new EmailService(config)
    })

    it('should send email successfully via Resend', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 'resend-message-id' })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await service.send({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test message',
        html: '<p>Test message</p>'
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('resend-message-id')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      )
    })

    it('should handle Resend API error', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Invalid API key' })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await service.send({
        to: 'recipient@example.com',
        subject: 'Test',
        text: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Resend API error')
    })
  })

  describe('Template Support', () => {
    let service: EmailService

    beforeEach(() => {
      const config: EmailConfig = {
        provider: 'resend',
        apiKey: 'test-api-key',
        from: { email: 'sender@example.com', name: 'Sender' }
      }
      service = new EmailService(config)
    })

    it('should replace variables in template', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 'message-id' })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const template = '<p>Hello {{name}}, your code is {{code}}</p>'
      const variables = { name: 'John', code: '1234' }

      await service.sendWithTemplate(
        {
          to: 'test@example.com',
          subject: 'Test'
        },
        template,
        variables
      )

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1]
      const payload = JSON.parse(callArgs.body)

      expect(payload.html).toBe('<p>Hello John, your code is 1234</p>')
    })
  })

  describe('Batch Sending', () => {
    let service: EmailService

    beforeEach(() => {
      const config: EmailConfig = {
        provider: 'resend',
        apiKey: 'test-api-key',
        from: { email: 'sender@example.com', name: 'Sender' }
      }
      service = new EmailService(config)
    })

    it('should send multiple emails in batch', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 'message-id' })
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const emails = [
        { to: 'user1@example.com', subject: 'Test 1', text: 'Message 1' },
        { to: 'user2@example.com', subject: 'Test 2', text: 'Message 2' },
        { to: 'user3@example.com', subject: 'Test 3', text: 'Message 3' }
      ]

      const results = await service.sendBatch(emails)

      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('should handle partial failures in batch', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 'message-1' })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: jest.fn().mockResolvedValue({ error: 'Failed' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 'message-3' })
        })

      const emails = [
        { to: 'user1@example.com', subject: 'Test 1', text: 'Message 1' },
        { to: 'user2@example.com', subject: 'Test 2', text: 'Message 2' },
        { to: 'user3@example.com', subject: 'Test 3', text: 'Message 3' }
      ]

      const results = await service.sendBatch(emails)

      expect(results).toHaveLength(3)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[2].success).toBe(true)
    })
  })
})

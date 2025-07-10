/**
 * Unit Tests for NotificationProvider Component
 * Tests real-time notifications, SSE connection, and notification management
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationProvider, useNotifications } from '../notification-provider'
import * as notificationLib from '../../../lib/notifications'
import { toast } from '../../../hooks/use-toast'

// Mock the dependencies
jest.mock('../../../lib/notifications')
jest.mock('../../../hooks/use-toast')

const mockNotificationLib = notificationLib as jest.Mocked<typeof notificationLib>
const mockToast = toast as jest.MockedFunction<typeof toast>

// Test component to access the notification context
function TestNotificationConsumer() {
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAllNotifications 
  } = useNotifications()

  return (
    <div>
      <div data-testid="notification-count">{notifications.length}</div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="connection-status">{isConnected ? 'connected' : 'disconnected'}</div>
      <button data-testid="mark-as-read" onClick={() => markAsRead('1')}>
        Mark as Read
      </button>
      <button data-testid="mark-all-read" onClick={() => markAllAsRead()}>
        Mark All Read
      </button>
      <button data-testid="clear-notification" onClick={() => clearNotification('1')}>
        Clear Notification
      </button>
      <button data-testid="clear-all" onClick={() => clearAllNotifications()}>
        Clear All
      </button>
      {notifications.map(notification => (
        <div key={notification.id} data-testid={`notification-${notification.id}`}>
          <span data-testid={`title-${notification.id}`}>{notification.title}</span>
          <span data-testid={`read-${notification.id}`}>{notification.read ? 'read' : 'unread'}</span>
        </div>
      ))}
    </div>
  )
}

// Mock notifications
const mockNotifications = [
  {
    id: '1',
    title: 'Test Notification 1',
    message: 'Test message 1',
    type: 'RESERVA_CONFIRMADA',
    priority: 'medium' as const,
    read: false,
    userId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Test Notification 2',
    message: 'Test message 2',
    type: 'TURNO_LIBERADO',
    priority: 'high' as const,
    read: true,
    userId: '1',
    createdAt: new Date().toISOString(),
  },
]

describe('NotificationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockNotificationLib.getNotifications.mockResolvedValue(mockNotifications)
    mockNotificationLib.markNotificationAsRead.mockResolvedValue(true)
    mockNotificationLib.clearNotification.mockResolvedValue(true)
    mockNotificationLib.requestNotificationPermission.mockResolvedValue('granted')
    mockNotificationLib.showBrowserNotification.mockImplementation(() => {})
    
    // Mock NotificationManager
    const mockManager = {
      connect: jest.fn().mockResolvedValue(true),
      disconnect: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }
    mockNotificationLib.NotificationManager.mockImplementation(() => mockManager as any)
  })

  describe('Context Provider', () => {
    it('provides notification context to children', async () => {
      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      // Should render the consumer component
      expect(screen.getByTestId('notification-count')).toBeInTheDocument()
      expect(screen.getByTestId('unread-count')).toBeInTheDocument()
      expect(screen.getByTestId('connection-status')).toBeInTheDocument()
    })

    it('throws error when useNotifications is used outside provider', () => {
      // Capture console.error to avoid test output pollution
      const originalError = console.error
      console.error = jest.fn()

      expect(() => {
        render(<TestNotificationConsumer />)
      }).toThrow('useNotifications must be used within a NotificationProvider')

      console.error = originalError
    })
  })

  describe('Initialization', () => {
    it('loads notifications when user is authenticated', async () => {
      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(mockNotificationLib.getNotifications).toHaveBeenCalledWith('mock-token')
      })

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('2')
        expect(screen.getByTestId('unread-count')).toHaveTextContent('1')
      })
    })

    it('handles fetch error gracefully', async () => {
      mockNotificationLib.getNotifications.mockRejectedValue(new Error('Fetch failed'))

      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      // Should not crash and should show empty state
      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('0')
        expect(screen.getByTestId('unread-count')).toHaveTextContent('0')
      })
    })

    it('requests browser notification permission', async () => {
      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(mockNotificationLib.requestNotificationPermission).toHaveBeenCalled()
      })
    })
  })

  describe('Notification Management', () => {
    it('marks single notification as read', async () => {
      const user = userEvent.setup()
      
      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('2')
      })

      await user.click(screen.getByTestId('mark-as-read'))

      await waitFor(() => {
        expect(mockNotificationLib.markNotificationAsRead).toHaveBeenCalledWith('1', 'mock-token')
      })
    })

    it('marks all notifications as read', async () => {
      const user = userEvent.setup()
      
      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('unread-count')).toHaveTextContent('1')
      })

      await user.click(screen.getByTestId('mark-all-read'))

      await waitFor(() => {
        expect(mockNotificationLib.markNotificationAsRead).toHaveBeenCalledWith('1', 'mock-token')
      })
    })

    it('clears single notification', async () => {
      const user = userEvent.setup()
      
      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('2')
      })

      await user.click(screen.getByTestId('clear-notification'))

      await waitFor(() => {
        expect(mockNotificationLib.clearNotification).toHaveBeenCalledWith('1', 'mock-token')
      })
    })

    it('clears all notifications', async () => {
      const user = userEvent.setup()
      
      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('2')
      })

      await user.click(screen.getByTestId('clear-all'))

      await waitFor(() => {
        expect(mockNotificationLib.clearNotification).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Real-time Connection', () => {
    it('connects to notification stream when authenticated', async () => {
      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(mockNotificationLib.NotificationManager).toHaveBeenCalledWith('1', 'mock-token')
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
      })
    })

    it('handles connection failure', async () => {
      const mockManager = {
        connect: jest.fn().mockResolvedValue(false),
        disconnect: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }
      mockNotificationLib.NotificationManager.mockImplementation(() => mockManager as any)

      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
      })
    })
  })

  describe('Toast Notifications', () => {
    it('shows toast for high priority notifications', async () => {
      const mockManager = {
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }
      mockNotificationLib.NotificationManager.mockImplementation(() => mockManager as any)

      render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      // Wait for manager to be created and listener to be added
      await waitFor(() => {
        expect(mockManager.addListener).toHaveBeenCalled()
      })

      // Simulate receiving a high priority notification
      const highPriorityNotification = {
        id: '3',
        title: 'Urgent Notification',
        message: 'High priority message',
        type: 'RESERVA_LIBERADA',
        priority: 'high' as const,
        read: false,
        userId: '1',
        createdAt: new Date().toISOString(),
      }

      // Get the listener function that was registered
      const listener = mockManager.addListener.mock.calls[0][0]
      
      act(() => {
        listener(highPriorityNotification)
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Urgent Notification',
          description: 'High priority message',
          variant: 'destructive',
          duration: 5000,
        })
      })
    })
  })

  describe('Cleanup', () => {
    it('cleans up when user logs out', async () => {
      const mockManager = {
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }
      mockNotificationLib.NotificationManager.mockImplementation(() => mockManager as any)

      // Mock useAuth to first return authenticated user, then null
      const mockUseAuth = require('../../../components/auth/auth-context').useAuth
      mockUseAuth.mockReturnValueOnce({
        user: global.testUser,
        token: 'mock-token',
        isAuthenticated: true,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        eventSource: null,
      }).mockReturnValueOnce({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        eventSource: null,
      })

      const { rerender } = render(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(mockManager.addListener).toHaveBeenCalled()
      })

      // Simulate user logout by rerendering with different auth state
      rerender(
        <NotificationProvider>
          <TestNotificationConsumer />
        </NotificationProvider>
      )

      await waitFor(() => {
        expect(mockManager.disconnect).toHaveBeenCalled()
      })
    })
  })
}) 
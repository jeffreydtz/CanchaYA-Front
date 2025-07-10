/**
 * Global test setup and mocks for Jest
 */

import '@testing-library/jest-dom'

// Mock React 19 features
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: jest.fn(() => [
    { success: null, errors: null, message: null },
    jest.fn()
  ]),
  useOptimistic: jest.fn((state) => [state, jest.fn()]),
}))

// Mock Next.js components and hooks
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} data-testid="next-image" />
  },
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props} data-testid="next-link">
      {children}
    </a>
  ),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock all Lucide React icons
const createMockIcon = (name) => {
  const MockIcon = (props) => (
    <svg {...props} data-testid={`${name.toLowerCase()}-icon`} className={`lucide lucide-${name.toLowerCase()} ${props.className || ''}`}>
      <title>{name}</title>
    </svg>
  )
  MockIcon.displayName = name
  return MockIcon
}

const iconMocks = [
  'User', 'Mail', 'Lock', 'Eye', 'EyeOff', 'LogIn', 'UserPlus', 'Home',
  'Calendar', 'MapPin', 'Search', 'Filter', 'Heart', 'Star', 'Clock',
  'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'Plus',
  'Minus', 'X', 'Check', 'AlertCircle', 'Info', 'Bell', 'Settings',
  'Menu', 'MoreHorizontal', 'MoreVertical', 'Edit', 'Trash2', 'Save',
  'Cancel', 'Upload', 'Download', 'Share2', 'Copy', 'ExternalLink',
  'Phone', 'MessageSquare', 'Globe', 'Navigation', 'Car', 'Wifi',
  'Shield', 'CreditCard', 'DollarSign', 'Users', 'Building', 'MapPin',
  'Loader', 'Loader2', 'RefreshCw', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
]

const mockIcons = {}
iconMocks.forEach(iconName => {
  mockIcons[iconName] = createMockIcon(iconName)
})

jest.mock('lucide-react', () => mockIcons)

// Mock external libraries
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'dd/MM/yyyy') return '01/01/2024'
    if (formatStr === 'HH:mm') return '10:00'
    return date.toString()
  }),
  parseISO: jest.fn((dateStr) => new Date(dateStr)),
  isValid: jest.fn(() => true),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
  endOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)),
  isSameDay: jest.fn((date1, date2) => date1.toDateString() === date2.toDateString()),
  isAfter: jest.fn((date1, date2) => date1 > date2),
  isBefore: jest.fn((date1, date2) => date1 < date2),
}))

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => fn),
    formState: { errors: {}, isSubmitting: false, isValid: true },
    watch: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
    reset: jest.fn(),
    control: {},
  })),
  Controller: ({ render }) => render({ field: { onChange: jest.fn(), value: '' } }),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}))

// Polyfill for HTMLFormElement.prototype.requestSubmit
Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
  value: function (submitter) {
    if (submitter) {
      submitter.click()
    } else {
      // Find the submit button and click it
      const submitButton = this.querySelector('[type="submit"]')
      if (submitButton) {
        submitButton.click()
      } else {
        // Fallback: trigger submit event
        this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      }
    }
  },
  writable: true,
  configurable: true
})

// Mock browser APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
})

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
})

global.fetch = jest.fn()

// Mock EventSource for SSE
global.EventSource = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Global test data
global.testUser = {
  id: '1',
  nombre: 'Test',
  apellido: 'User',
  email: 'test@example.com',
  rol: 'JUGADOR',
  telefono: '+54911234567',
  fechaRegistro: '2024-01-01T00:00:00.000Z',
}

global.testCourt = {
  id: '1',
  nombre: 'Cancha Test',
  descripcion: 'Cancha de prueba',
  deporte: 'FUTBOL',
  precioPorHora: 5000,
  ubicacion: 'Test Location',
  imagenes: ['test-image.jpg'],
  caracteristicas: ['Vestuarios', 'Estacionamiento'],
  club: {
    id: '1',
    nombre: 'Club Test',
    direccion: 'Test Address',
    telefono: '+54911111111',
  },
}

global.testReservation = {
  id: '1',
  fecha: '2024-12-25',
  horaInicio: '10:00',
  horaFin: '11:00',
  estado: 'CONFIRMADA',
  precioTotal: 5000,
  usuarioId: '1',
  canchaId: '1',
  cancha: global.testCourt,
  fechaCreacion: '2024-01-01T00:00:00.000Z',
}

// Mock the AuthContext
jest.mock('@/components/auth/auth-context', () => ({
  useAuth: jest.fn(() => ({
    user: global.testUser,
    token: 'mock-token',
    isAuthenticated: true,
    isAdmin: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
    eventSource: null,
  })),
  AuthProvider: ({ children }) => children,
  useRequireAuth: jest.fn(() => ({
    user: global.testUser,
    isAuthenticated: true,
  })),
  useRequireAdmin: jest.fn(() => ({
    user: global.testUser,
    isAuthenticated: true,
    isAdmin: true,
  })),
}))

// Mock the NotificationContext (disabled for notification provider tests)
/*
jest.mock('@/components/notifications/notification-provider', () => ({
  useNotifications: jest.fn(() => ({
    notifications: [],
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    addNotification: jest.fn(),
    updateNotification: jest.fn(),
    removeNotification: jest.fn(),
    unreadCount: 0,
    isConnected: true,
    connectionRetries: 0,
  })),
  NotificationProvider: ({ children }) => children,
}))
*/

// Mock server-side actions that use Next.js server components
jest.mock('@/lib/actions', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
  confirmReservationAction: jest.fn(),
  cancelReservationAction: jest.fn(),
}))

// Environment variables for testing
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Add TextEncoder/TextDecoder polyfills for Node.js
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder
}

// Setup and teardown functions
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()

  // Reset localStorage
  window.localStorage.clear()
  window.sessionStorage.clear()

  // Reset fetch mock
  global.fetch.mockClear()
})

afterEach(() => {
  // Clean up any side effects
  jest.restoreAllMocks()
}) 
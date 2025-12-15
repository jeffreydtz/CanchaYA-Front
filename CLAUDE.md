# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Testing
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:ci` - Run tests in CI mode (no watch)
- `npm run test:unit` - Run only unit tests
- `npm run test:components` - Run only component tests
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:all` - Run all tests (unit and E2E)

### Database & API
- `npm run db:seed` - Seed database with test data
- `npm run generate:api` - Generate TypeScript types from OpenAPI spec

### Storybook
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

## Architecture Overview

### Project Structure
This is a Next.js 14 application using the App Router with TypeScript and Tailwind CSS.

**Key directories:**
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components organized by feature
- `lib/` - Core utilities, API client, and server/client auth
- `hooks/` - Custom React hooks
- `__tests__/` - Unit tests
- `e2e/` - End-to-end tests

### Authentication Architecture
Dual authentication system with JWT tokens:
- **Client-side**: `lib/auth.ts` - Cookie management, auth state
- **Server-side**: `lib/auth-server.ts` - JWT verification, protected routes
- **Context**: `components/auth/auth-context.tsx` - React context for auth state
- **Permissions**: `lib/permissions.ts` - Permission helper functions

**⚠️ CRITICAL:** Always use `nivelAcceso` for permission checks, NEVER use `rol`. See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for complete rules and examples.

### API Integration
Comprehensive API client (`lib/api-client.ts`) aligned with NestJS backend:
- Centralized `apiRequest()` function for all HTTP calls
- Complete TypeScript interfaces for all entities
- JWT token automatic inclusion
- Error handling and response formatting

### UI Components
Built with shadcn/ui and Radix UI:
- `components/ui/` - Base UI components (buttons, forms, dialogs)
- `components/dashboard/` - Dashboard-specific components
- `components/admin/` - Admin panel components
- `components/auth/` - Authentication forms and flows

### State Management
- React Context for auth state
- React Hook Form for form management
- Zustand for complex client state (if needed)

## Backend Integration

**API Base URL**: `https://backend-cancha-ya-production.up.railway.app/api`

### Key Entity Relationships
- Users (JUGADOR/ADMINISTRADOR roles)
- Clubs → Canchas (courts)
- Deportes → Canchas → Reservas
- Equipos → Desafios (team challenges)
- Valoraciones (court ratings)

### Authentication Flow
1. Login: `POST /auth/login` returns JWT token
2. Register: `POST /usuarios/registro` creates new user
3. Token stored in HTTP-only cookies
4. Server-side validation via JWT decode

## Testing Strategy

### Unit Tests (Jest + React Testing Library)
- Component testing in `__tests__/` directories
- Utils testing in `lib/__tests__/`
- Focus on user interactions and error states

### E2E Tests (Playwright)
- Authentication flows (`e2e/auth.e2e.ts`)
- Reservation workflows (`e2e/reservations.e2e.ts`)
- Admin panel functionality

### Component Documentation (Storybook)
- UI component library
- Interactive component testing
- Design system documentation

## Environment Variables

**Required for development:**
```env
NEXT_PUBLIC_BACKEND_URL=https://backend-cancha-ya-production.up.railway.app/api
JWT_SECRET=cancha-ya-jwt-secret-development
NEXTAUTH_SECRET=cancha-ya-nextauth-secret-development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Code Conventions

### TypeScript
- Strict type checking enabled
- All API responses typed via `lib/api-client.ts` interfaces
- Use `interface` for object shapes, `type` for unions

### Components
- Functional components with TypeScript
- Props interface defined above component
- Use React Hook Form for form handling
- Error boundaries for error handling

### Styling
- Tailwind CSS utility classes
- shadcn/ui component library
- CSS modules avoided (use Tailwind)
- Dark/light theme support via `next-themes`

### File Organization
- Co-locate tests with components (`__tests__/` subdirectories)
- Group related components by feature
- Separate client (`auth.ts`) and server (`auth-server.ts`) utilities

## Common Patterns

### API Calls
```typescript
import apiClient from '@/lib/api-client'

const response = await apiClient.getCanchas()
if (response.error) {
  // Handle error
} else {
  // Use response.data
}
```

### Authentication Checks
```typescript
// Client-side - Context hooks
import { useAuth } from '@/components/auth/auth-context'
const { isAuthenticated, isAdmin, isAdminClub, nivelAcceso, clubIds } = useAuth()

// Client-side - Permission helpers
import { hasAdminPrivileges, hasClubAccess } from '@/lib/permissions'
if (hasAdminPrivileges(nivelAcceso)) { /* show admin features */ }

// Server-side
import { requireAuth, requireAdmin, requireAdminOrAdminClub } from '@/lib/auth-server'
const user = await requireAuth() // Redirects if not authenticated
const admin = await requireAdmin() // Only global admins
const clubAdmin = await requireAdminOrAdminClub() // Global or club admins

// ⚠️ CRITICAL: Always check nivelAcceso, never check rol
// ❌ WRONG: if (user.rol === 'admin')
// ✅ CORRECT: if (user.nivelAcceso === 'admin')
```

### Form Handling
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  // Define schema
})

const form = useForm({
  resolver: zodResolver(schema)
})
```
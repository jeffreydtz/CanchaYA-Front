import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth/auth-context'
import { ChallengesProvider } from '@/components/challenges/challenges-context'
import { LanguageProvider } from '@/lib/language-context'
import { Toaster } from '@/components/ui/sonner'
import { NotificationProvider } from '@/lib/patterns/notification-observer'

export const metadata: Metadata = {
  title: 'CanchaYA - Reserva de Canchas Deportivas',
  description: 'Reserva canchas de fútbol, tenis, paddle y más deportes de forma fácil y rápida',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotificationProvider>
            <LanguageProvider>
              <AuthProvider>
                <ChallengesProvider>
                  {children}
                  <Toaster />
                </ChallengesProvider>
              </AuthProvider>
            </LanguageProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import localFont from "next/font/local"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-context"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { ErrorBoundary } from "@/components/error/error-boundary"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "CanchaYA - Reserva de Canchas",
  description: "Plataforma web para reservas de canchas deportivas en Rosario. Reserva en línea, confirma asistencia y disfruta del deporte.",
  keywords: ["canchas", "reservas", "deportes", "fútbol", "básquet", "tenis", "Rosario"],
  authors: [{ name: "CanchaYA Team" }],
  openGraph: {
    title: "CanchaYA - Reserva de Canchas",
    description: "Reserva canchas deportivas de forma fácil y rápida",
    type: "website",
    locale: "es_AR",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>
              <NotificationProvider>
                {children}
                <Toaster
                  position="top-right"
                  expand={true}
                  richColors
                  closeButton
                />
              </NotificationProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}

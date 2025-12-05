/**
 * Dashboard Layout
 * Layout compartido para todas las páginas del dashboard
 * Incluye la Navbar en todas las páginas
 */

import Navbar from '@/components/navbar/navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}


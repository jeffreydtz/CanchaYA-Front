'use client'

import { Suspense, useEffect } from 'react'
import AdminSidebar from '@/components/admin/admin-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import Navbar from '@/components/navbar/navbar'
import { useAuth } from '@/components/auth/auth-context'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/error/error-boundary'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isAdmin, isAdminClub, clubIds, nivelAcceso } = useAuth()
  const router = useRouter()

  // Allow access to both admin and admin-club users
  const hasAdminAccess = isAdmin || isAdminClub
  const hasNoClubScope = isAdminClub && (!clubIds || clubIds.length === 0)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (!hasAdminAccess) {
      router.replace('/')
    }
  }, [isAuthenticated, hasAdminAccess, router])


  if (!isAuthenticated || !hasAdminAccess) {
    return null // O un loader/spinner
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <SidebarProvider>
          <div className="flex pt-16">
            <AdminSidebar />
            <SidebarInset className="flex-1">
              {/* Mobile Sidebar Trigger */}
              <header className="flex h-14 items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4 md:hidden sticky top-16 bg-white dark:bg-gray-950 z-40">
                <SidebarTrigger className="h-8 w-8" />
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Panel Admin</h1>
                </div>
              </header>
              <main className="p-4 md:p-6 lg:p-8">
                {/* Header role badge */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {nivelAcceso === 'admin'
                        ? 'Admin Global'
                        : nivelAcceso === 'admin-club'
                        ? `Admin Club${clubIds && clubIds.length ? ` · Clubs: ${clubIds.length}` : ''}`
                        : 'Usuario'}
                    </Badge>
                  </div>
                </div>

                {/* Warning banner for admin-club users without assigned clubs */}
                {hasNoClubScope && (
                  <div className="mb-4">
                    <Card className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className="mt-1">
                          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                            No tenés clubes asignados todavía
                          </p>
                          <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                            Tu usuario tiene nivel de acceso <strong>Admin Club</strong>, pero no hay clubes vinculados a tu cuenta.
                            Pedile a un <strong>admin global</strong> que te asigne al menos un club para poder ver reservas, canchas y métricas.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
                    </div>
                  </div>
                }>
                  {children}
                </Suspense>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </ErrorBoundary>
  )
}

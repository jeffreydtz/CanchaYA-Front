'use client'

import { Suspense } from 'react'
import AdminSidebar from '@/components/admin/admin-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import Navbar from '@/components/navbar/navbar'
import { useAuth } from '@/components/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (!isAdmin) {
      router.replace('/')
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) {
    return null // O un loader/spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <SidebarProvider>
        <div className="flex pt-16">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <main className="p-6 md:p-8 lg:p-10">
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
  )
}

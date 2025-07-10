import { Suspense } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import Navbar from '@/components/navbar/navbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}

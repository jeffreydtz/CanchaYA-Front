import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Navbar } from "@/components/navbar"
import { getServerUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Redirect to dashboard if not admin
  if (user.rol !== 'ADMINISTRADOR') {
    redirect('/')
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <Navbar user={user} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

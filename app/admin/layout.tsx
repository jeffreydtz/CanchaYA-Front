import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Navbar } from "@/components/navbar"

// Mock admin user
const mockAdminUser = {
  name: "Admin CanchaYa",
  email: "admin@canchaya.com",
  role: "admin" as const,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <Navbar user={mockAdminUser} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

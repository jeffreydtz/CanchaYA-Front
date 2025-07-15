"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BarChart3, Calendar, MapPin, Users, LogOut, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: BarChart3,
  },
  {
    title: "Canchas",
    url: "/admin/canchas",
    icon: MapPin,
  },
  {
    title: "Reservas",
    url: "/admin/reservas",
    icon: Calendar,
  },
  {
    title: "Usuarios",
    url: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Reportes",
    url: "/admin/reportes",
    icon: FileText,
  },
]

function clientLogout(router: ReturnType<typeof useRouter>) {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  localStorage.removeItem('user')
  router.push('/login')
}

export default function AdminSidebar() {
  const router = useRouter()

  return (
    <Sidebar>
      <SidebarHeader>Panel Admin</SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url} className="flex items-center">
                <item.icon className="h-4 w-4 mr-2 inline-block" />
                {item.title}
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton onClick={() => clientLogout(router)}>
          <LogOut className="h-4 w-4 mr-2 inline-block" />
          Cerrar sesión
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}

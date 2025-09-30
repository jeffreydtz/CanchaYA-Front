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
import { 
  LayoutDashboard, 
  Calendar, 
  MapPin, 
  Users, 
  LogOut, 
  FileText,
  Building2,
  Trophy,
  Settings,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    description: "Vista general del sistema"
  },
  {
    title: "Analytics",
    url: "/admin/dashboard",
    icon: Trophy,
    description: "Business Intelligence y métricas"
  },
  {
    title: "Canchas",
    url: "/admin/canchas",
    icon: MapPin,
    description: "Gestión de canchas deportivas"
  },
  {
    title: "Reservas",
    url: "/admin/reservas",
    icon: Calendar,
    description: "Administrar reservas"
  },
  {
    title: "Usuarios",
    url: "/admin/usuarios",
    icon: Users,
    description: "Gestión de usuarios"
  },
  {
    title: "Reportes",
    url: "/admin/reportes",
    icon: FileText,
    description: "Estadísticas y análisis"
  },
]

function clientLogout(router: ReturnType<typeof useRouter>) {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  localStorage.removeItem('user')
  router.push('/login')
}

export default function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Panel Admin</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">CanchaYA</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-5 w-5 transition-transform group-hover:scale-110",
                        isActive ? "text-primary-foreground" : "text-gray-500 dark:text-gray-400"
                      )} />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">{item.title}</span>
                        {!isActive && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 hidden xl:block">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-primary-foreground" />
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 p-4">
        <SidebarMenuButton 
          onClick={() => clientLogout(router)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 font-semibold"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
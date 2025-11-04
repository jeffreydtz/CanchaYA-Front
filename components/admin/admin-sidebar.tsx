"use client"

import { useState } from "react"
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
  ChevronRight,
  BarChart3,
  Bell,
  Download,
  UserCog,
  ChevronDown
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
    icon: Trophy,
    description: "Business Intelligence y métricas",
    submenu: [
      {
        title: "Dashboard BI",
        url: "/admin/dashboard",
        icon: BarChart3,
        description: "Métricas y KPIs en tiempo real"
      },
      {
        title: "Alertas",
        url: "/admin/alertas",
        icon: Bell,
        description: "Configurar alertas automáticas"
      },
      {
        title: "Reportes",
        url: "/admin/reportes-analytics",
        icon: Download,
        description: "Generar reportes personalizados"
      },
      {
        title: "Segmentación",
        url: "/admin/segmentacion",
        icon: UserCog,
        description: "Análisis RFM de usuarios"
      }
    ]
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
  const [expandedItems, setExpandedItems] = useState<string[]>(['Analytics'])

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

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
        <SidebarMenu className="space-y-3">
          {menuItems.map((item) => {
            const hasSubmenu = 'submenu' in item && item.submenu
            const isExpanded = expandedItems.includes(item.title)
            const isActive = pathname === item.url || (hasSubmenu && item.submenu?.some(sub => pathname === sub.url))

            return (
              <SidebarMenuItem key={item.title}>
                {hasSubmenu ? (
                  <div className="space-y-2">
                    <SidebarMenuButton
                      onClick={() => toggleExpand(item.title)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn(
                          "h-5 w-5 transition-transform group-hover:scale-110",
                          isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
                        )} />
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-sm">{item.title}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 hidden xl:block">
                            {item.description}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded ? "rotate-180" : ""
                      )} />
                    </SidebarMenuButton>

                    {isExpanded && item.submenu && (
                      <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-2 mt-2">
                        {item.submenu.map((subItem) => {
                          const isSubActive = pathname === subItem.url
                          return (
                            <Link key={subItem.url} href={subItem.url}>
                              <SidebarMenuButton
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                                  isSubActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                              >
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                                {isSubActive && (
                                  <ChevronRight className="h-3 w-3 ml-auto" />
                                )}
                              </SidebarMenuButton>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.url!}>
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
                )}
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
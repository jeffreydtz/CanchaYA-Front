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
  ChevronDown,
  Clock
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
    title: "Clubes",
    url: "/admin/clubes",
    icon: Building2,
    description: "Gestión de clubes deportivos"
  },
  {
    title: "Canchas",
    url: "/admin/canchas",
    icon: MapPin,
    description: "Gestión de canchas deportivas"
  },
  {
    title: "Disponibilidad",
    url: "/admin/disponibilidad",
    icon: Clock,
    description: "Patrones de disponibilidad semanal"
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
    <Sidebar className="border-r-2 border-gold/20 glass-luxury shadow-luxury-lg">
      <SidebarHeader className="border-b-2 border-gold/30 p-6 gradient-overlay">
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative group">
            <div className="h-12 w-12 rounded-xl metallic-gold flex items-center justify-center shadow-glow-gold group-hover:shadow-glow-gold-lg transition-all duration-500">
              <Settings className="h-6 w-6 text-black animate-rotate-slow" />
            </div>
            <div className="absolute inset-0 bg-gradient-gold rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-gradient-luxury">Panel Admin</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-luxury font-semibold tracking-wider">CANCHAYA</p>
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
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-500 group relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-gold/20 via-secondary/20 to-gold/20 text-gold shadow-glow-gold border border-gold/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gold/10 hover:to-transparent hover:shadow-glow border border-transparent hover:border-gold/20"
                      )}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <item.icon className={cn(
                          "h-5 w-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12",
                          isActive ? "text-gold animate-glow-pulse" : "text-gray-500 dark:text-gray-400 group-hover:text-gold"
                        )} />
                        <span className="font-luxury font-bold text-sm tracking-wide">{item.title}</span>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-all duration-500 relative z-10",
                        isExpanded ? "rotate-180 text-gold" : "",
                        isActive && "text-gold"
                      )} />
                      {isActive && (
                        <div className="absolute inset-0 shimmer-gold opacity-50" />
                      )}
                    </SidebarMenuButton>

                    {isExpanded && item.submenu && (
                      <div className="ml-4 pl-4 border-l-2 border-gold/40 space-y-2 mt-2 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold via-secondary to-transparent" />
                        {item.submenu.map((subItem) => {
                          const isSubActive = pathname === subItem.url
                          return (
                            <Link key={subItem.url} href={subItem.url}>
                              <SidebarMenuButton
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 text-sm group relative overflow-hidden",
                                  isSubActive
                                    ? "metallic-gold text-black shadow-glow-gold border border-gold/50 font-black"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gold/10 hover:text-gold hover:shadow-glow border border-transparent hover:border-gold/20"
                                )}
                              >
                                <subItem.icon className={cn(
                                  "h-4 w-4 transition-all duration-500",
                                  isSubActive ? "animate-glow-pulse" : "group-hover:scale-110"
                                )} />
                                <span className="font-luxury font-semibold">{subItem.title}</span>
                                {isSubActive && (
                                  <ChevronRight className="h-3 w-3 ml-auto animate-pulse" />
                                )}
                                {isSubActive && (
                                  <div className="absolute inset-0 shimmer-effect opacity-30" />
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
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-500 group relative overflow-hidden",
                        isActive
                          ? "metallic-gold text-black shadow-glow-gold-lg border-2 border-gold/50"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gold/10 hover:to-transparent hover:shadow-glow border border-transparent hover:border-gold/20"
                      )}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <item.icon className={cn(
                          "h-5 w-5 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12",
                          isActive ? "text-black animate-glow-pulse" : "text-gray-500 dark:text-gray-400 group-hover:text-gold"
                        )} />
                        <span className="font-luxury font-bold text-sm tracking-wide">{item.title}</span>
                      </div>
                      {isActive && (
                        <>
                          <ChevronRight className="h-4 w-4 text-black relative z-10 animate-pulse" />
                          <div className="absolute inset-0 shimmer-effect opacity-40" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </Link>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-gold/30 p-4 gradient-overlay">
        <SidebarMenuButton
          onClick={() => clientLogout(router)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 hover:text-red-700 dark:hover:text-red-300 hover:shadow-glow-rose transition-all duration-500 font-luxury font-bold group relative overflow-hidden border border-transparent hover:border-red-500/30"
        >
          <LogOut className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-500" />
          <span className="relative z-10">Cerrar sesión</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
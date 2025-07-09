/**
 * Navigation Bar Component for CanchaYA
 * Responsive navbar with authentication state management
 * Includes user menu, notifications, and mobile navigation
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Calendar, 
  Shield,
  Bell,
  Search,
  Home
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-context'
import { logoutAction } from '@/lib/actions'
import { User as UserType } from '@/lib/api-client'

interface NavbarProps {
  user?: UserType | null
}

export function Navbar({ user: serverUser }: NavbarProps) {
  const { user: clientUser, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Use client user if available, fallback to server user
  const user = clientUser || serverUser
  const isAuthenticated = !!user
  const isAdmin = user?.rol === 'ADMINISTRADOR'

  const handleLogout = async () => {
    try {
      logout()
      await logoutAction()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getUserInitials = (user: UserType) => {
    return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl text-primary-600">CanchaYA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-sm font-medium hover:text-primary-600 transition-colors flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Inicio
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  href="/mis-reservas" 
                  className="text-sm font-medium hover:text-primary-600 transition-colors flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Mis Reservas
                </Link>
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-sm font-medium hover:text-primary-600 transition-colors flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side - Auth buttons or User menu */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-4 w-4" />
              <span className="sr-only">Buscar</span>
            </Button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    2
                  </Badge>
                  <span className="sr-only">Notificaciones</span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user.nombre} />
                        <AvatarFallback className="bg-primary-100 text-primary-600">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.nombre} {user.apellido}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <Badge variant="secondary" className="text-xs w-fit">
                            Administrador
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/perfil')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/mis-reservas')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Mis Reservas</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Panel Admin</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push('/configuracion')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Authentication buttons for non-authenticated users */
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <Link 
                    href="/" 
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2 text-lg font-medium"
                  >
                    <Home className="h-5 w-5" />
                    <span>Inicio</span>
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      <Link 
                        href="/mis-reservas" 
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 text-lg font-medium"
                      >
                        <Calendar className="h-5 w-5" />
                        <span>Mis Reservas</span>
                      </Link>
                      {isAdmin && (
                        <Link 
                          href="/admin" 
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-2 text-lg font-medium"
                        >
                          <Shield className="h-5 w-5" />
                          <span>Panel Admin</span>
                        </Link>
                      )}
                      <Link 
                        href="/perfil" 
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 text-lg font-medium"
                      >
                        <User className="h-5 w-5" />
                        <span>Perfil</span>
                      </Link>
                      <Link 
                        href="/configuracion" 
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 text-lg font-medium"
                      >
                        <Settings className="h-5 w-5" />
                        <span>Configuración</span>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className="justify-start text-red-600 text-lg font-medium"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-2 text-lg font-medium"
                      >
                        <User className="h-5 w-5" />
                        <span>Iniciar sesión</span>
                      </Link>
                      <Button asChild onClick={closeMobileMenu}>
                        <Link href="/register">Registrarse</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

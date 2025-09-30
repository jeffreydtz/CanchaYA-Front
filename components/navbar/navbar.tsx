'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import NotificationBell from '@/components/notifications/notification-bell'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, User, Menu, X, Home, Calendar, Shield, Search, Trophy, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/buscar', label: 'Buscar', icon: Search },
    { href: '/mis-reservas', label: t('nav.reservations'), icon: Calendar },
    ...(isAuthenticated ? [
      { href: '/profile', label: t('nav.profile'), icon: User }
    ] : []),
    ...(isAdmin ? [{ href: '/admin', label: t('nav.admin'), icon: Shield }] : []),
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 dark:bg-gray-950/98 backdrop-blur-lg shadow-xl border-b border-gray-200 dark:border-gray-800' 
        : 'bg-black/10 dark:bg-black/20 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white font-black text-lg">CY</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10" />
            </div>
            <span className={`font-black text-2xl transition-colors duration-300 ${
              isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
            }`}>
              CanchaYA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 text-sm font-semibold antialiased transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg ${
                    isScrolled 
                      ? 'text-gray-700 dark:text-gray-100 hover:text-primary dark:hover:text-primary hover:bg-primary/10' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:scale-105 transition-transform">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                        <AvatarImage src={'/placeholder-user.png'} alt={user?.nombre || 'Usuario'} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                          {user?.nombre?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    <DropdownMenuLabel className="p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={'/placeholder-user.png'} alt={user?.nombre || 'Usuario'} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                              {user?.nombre?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-base font-semibold leading-none">{user?.nombre}</p>
                            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                            {isAdmin && (
                              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r from-secondary to-accent text-white mt-2">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                        <User className="mr-3 h-5 w-5" />
                        <span className="font-medium">{t('nav.profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mis-reservas" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                        <Calendar className="mr-3 h-5 w-5" />
                        <span className="font-medium">{t('nav.reservations')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notificaciones" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                        <Bell className="mr-3 h-5 w-5" />
                        <span className="font-medium">Notificaciones</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                          <Shield className="mr-3 h-5 w-5" />
                          <span className="font-medium">{t('nav.admin')}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout} 
                      className="flex items-center p-3 rounded-lg hover:bg-destructive/10 text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span className="font-medium">{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`font-semibold transition-all duration-300 ${
                      isScrolled 
                        ? 'text-gray-700 dark:text-gray-200 hover:text-primary' 
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="btn-glow shadow-lg">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon-sm"
              className={`md:hidden ${
                isScrolled 
                  ? 'text-gray-700 dark:text-gray-200' 
                  : 'text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/98 dark:bg-gray-950/98 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-100 font-semibold antialiased hover:bg-primary/10 hover:text-primary rounded-lg mx-2 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
              {!isAuthenticated && (
                <div className="px-2 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex flex-col space-y-2">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start" size="lg">
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full" size="lg">
                        {t('nav.register')}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
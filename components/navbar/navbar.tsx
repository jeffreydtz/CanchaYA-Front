'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-context'
import { useChallengesNotifications } from '@/components/challenges/challenges-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, User, Menu, X, Home, Calendar, Shield, Search, Trophy, Bell, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Badge } from '@/components/ui/badge'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isAdminClub, clubIds, nivelAcceso, logout } = useAuth()
  const { pendingChallengesCount } = useChallengesNotifications()
  const { t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check if user has any admin privileges (admin or admin-club)
  const hasAdminAccess = isAdmin || isAdminClub

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Block body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const navigationItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/buscar', label: 'Buscar', icon: Search },
    { href: '/mis-reservas', label: t('nav.reservations'), icon: Calendar },
    ...(isAuthenticated ? [
      { href: '/profile', label: t('nav.profile'), icon: User }
    ] : []),
    ...(hasAdminAccess ? [{ href: '/admin/dashboard', label: t('nav.admin'), icon: Shield }] : []),
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'glass-luxury shadow-luxury border-b border-gold/20'
        : 'bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-12 w-12 metallic-gold rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-glow-gold">
                <span className="text-black font-black text-xl drop-shadow-lg">CY</span>
              </div>
              <div className="absolute inset-0 bg-gradient-gold rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10 animate-pulse-gold" />
            </div>
            <span className={`font-display font-black text-3xl transition-all duration-500 ${
              isScrolled
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold animate-gradient-shift'
                : 'text-white drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]'
            }`}>
              CanchaYA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center space-x-2 text-sm font-luxury font-bold antialiased transition-all duration-500 hover:scale-110 px-4 py-2.5 rounded-lg group overflow-hidden ${
                    isScrolled
                      ? 'text-gray-800 dark:text-gray-100 hover:text-gold hover:shadow-glow-gold'
                      : 'text-white/95 hover:text-gold-light hover:shadow-glow'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Icon className="h-5 w-5 relative z-10 group-hover:animate-float-smooth" />
                  <span className="relative z-10 tracking-wide">{item.label}</span>
                </Link>
              )
            })}

            {/* Challenges Dropdown */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`relative flex items-center space-x-2 text-sm font-luxury font-bold antialiased transition-all duration-500 hover:scale-110 px-4 py-2.5 rounded-lg group overflow-hidden ${
                    isScrolled
                      ? 'text-gray-800 dark:text-gray-100 hover:text-gold hover:shadow-glow-gold'
                      : 'text-white/95 hover:text-gold-light hover:shadow-glow'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Trophy className="h-5 w-5 relative z-10 group-hover:animate-float-smooth" />
                    <span className="relative z-10 tracking-wide">Desafíos</span>
                    {pendingChallengesCount > 0 && (
                      <Badge variant="destructive" className="relative z-10 ml-1 px-2 py-0 h-5">
                        {pendingChallengesCount}
                      </Badge>
                    )}
                    <ChevronDown className="h-4 w-4 relative z-10 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Desafíos</span>
                    {pendingChallengesCount > 0 && (
                      <Badge variant="destructive">{pendingChallengesCount} Pendientes</Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/desafios" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <Trophy className="mr-3 h-5 w-5" />
                      <span className="font-medium">Todos los Desafíos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/desafios?tab=invitaciones" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <Bell className="mr-3 h-5 w-5" />
                      <span className="font-medium">Invitaciones Pendientes</span>
                      {pendingChallengesCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">{pendingChallengesCount}</Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/desafios?tab=creados" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <Trophy className="mr-3 h-5 w-5" />
                      <span className="font-medium">Mis Desafíos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/desafios?tab=jugando" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <Trophy className="mr-3 h-5 w-5" />
                      <span className="font-medium">En Juego</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/desafios?tab=finalizados" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <Trophy className="mr-3 h-5 w-5" />
                      <span className="font-medium">Finalizados</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil-competitivo" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <User className="mr-3 h-5 w-5" />
                      <span className="font-medium">Mi Perfil Competitivo</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/ranking" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                      <Trophy className="mr-3 h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Ranking Global</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:scale-110 transition-all duration-500 group">
                      <Avatar className="h-12 w-12 ring-2 ring-gold/30 hover:ring-gold hover:shadow-glow-gold transition-all duration-500">
                        <AvatarImage
                          src={user?.avatarUrl || '/placeholder-user.png'}
                          alt={user?.nombre || 'Usuario'}
                          className="object-cover"
                        />
                        <AvatarFallback className="metallic-gold text-black font-black text-lg">
                          {user?.nombre?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-gradient-gold rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    <DropdownMenuLabel className="p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                            <AvatarImage
                              src={user?.avatarUrl || '/placeholder-user.png'}
                              alt={user?.nombre || 'Usuario'}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                              {user?.nombre?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-base font-semibold leading-none">{user?.nombre}</p>
                            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                            {hasAdminAccess && (
                              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r from-secondary to-accent text-white mt-2">
                                <Shield className="h-3 w-3 mr-1" />
                                {isAdmin
                                  ? 'Administrador (Global)'
                                  : `Administrador (Club)${
                                      clubIds && clubIds.length > 0
                                        ? ` · Clubs: ${clubIds.length}`
                                        : ''
                                    }`}
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
                      <Link href="/desafios" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                        <Trophy className="mr-3 h-5 w-5" />
                        <span className="font-medium">Desafíos</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/perfil-competitivo" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                        <Trophy className="mr-3 h-5 w-5 text-green-600" />
                        <span className="font-medium">Perfil Competitivo</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/ranking" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                        <Trophy className="mr-3 h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Ranking</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notificaciones" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
                        <Bell className="mr-3 h-5 w-5" />
                        <span className="font-medium">Notificaciones</span>
                      </Link>
                    </DropdownMenuItem>
                    {hasAdminAccess && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer">
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
                    className={`font-luxury font-bold transition-all duration-500 hover:scale-110 ${
                      isScrolled
                        ? 'text-gray-800 dark:text-gray-200 hover:text-gold hover:shadow-glow-gold'
                        : 'text-white/95 hover:text-gold-light hover:shadow-glow'
                    }`}
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="btn-luxury shadow-glow-gold hover:shadow-glow-gold-lg font-luxury tracking-wide">
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
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Navigation Menu */}
        <div 
          className={`md:hidden fixed top-20 left-0 right-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full w-[85%] max-w-sm bg-white dark:bg-gray-950 shadow-2xl overflow-y-auto">
            <div className="py-6 px-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3.5 text-gray-700 dark:text-gray-100 font-semibold antialiased hover:bg-gold/10 hover:text-gold rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}

              {/* Desafíos section for mobile */}
              {isAuthenticated && (
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="px-4 py-2 text-xs font-bold text-gold uppercase tracking-wider">
                    Desafíos
                  </div>
                  <Link
                    href="/desafios"
                    className="flex items-center space-x-3 px-4 py-3.5 text-gray-700 dark:text-gray-100 font-semibold antialiased hover:bg-gold/10 hover:text-gold rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Trophy className="h-5 w-5" />
                    <span className="font-medium">Todos los Desafíos</span>
                    {pendingChallengesCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {pendingChallengesCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/desafios?tab=invitaciones"
                    className="flex items-center space-x-3 px-4 py-3.5 text-gray-700 dark:text-gray-100 font-semibold antialiased hover:bg-gold/10 hover:text-gold rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="font-medium">Invitaciones</span>
                    {pendingChallengesCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {pendingChallengesCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/perfil-competitivo"
                    className="flex items-center space-x-3 px-4 py-3.5 text-gray-700 dark:text-gray-100 font-semibold antialiased hover:bg-gold/10 hover:text-gold rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Trophy className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Perfil Competitivo</span>
                  </Link>
                  <Link
                    href="/ranking"
                    className="flex items-center space-x-3 px-4 py-3.5 text-gray-700 dark:text-gray-100 font-semibold antialiased hover:bg-gold/10 hover:text-gold rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Ranking Global</span>
                  </Link>
                </div>
              )}

              {!isAuthenticated && (
                <div className="pt-6 mt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex flex-col space-y-3">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center font-bold" size="lg">
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full btn-luxury" size="lg">
                        {t('nav.register')}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
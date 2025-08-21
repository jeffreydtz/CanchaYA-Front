'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'es' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translations
const translations = {
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.reservations': 'Mis Reservas',
    'nav.profile': 'Perfil',
    'nav.admin': 'Admin',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    
    // Hero Section
    'hero.title': 'Reserva tu cancha deportiva',
    'hero.subtitle': 'La plataforma más moderna para encontrar y reservar canchas deportivas.',
    'hero.subtitle2': '¡Experiencia premium garantizada!',
    'hero.explore': 'Explorar Canchas',
    'hero.reservations': 'Mis Reservas',
    
    // Features
    'feature.instant.title': 'Reserva Instantánea',
    'feature.instant.desc': 'Confirma tu cancha en menos de 30 segundos con nuestro sistema ultrarrápido',
    'feature.secure.title': 'Pago Seguro',
    'feature.secure.desc': 'Tecnología de encriptación bancaria para proteger todas tus transacciones',
    'feature.premium.title': 'Canchas Premium',
    'feature.premium.desc': 'Acceso exclusivo a las mejores instalaciones deportivas de la ciudad',
    
    // Stats
    'stats.courts': 'Canchas Disponibles',
    'stats.users': 'Usuarios Activos',
    'stats.bookings': 'Reservas Realizadas',
    'stats.rating': 'Calificación Promedio',
    
    // Courts
    'courts.title': 'Canchas Destacadas',
    'courts.subtitle': 'Descubre las instalaciones deportivas más populares y mejor calificadas.',
    'courts.available': 'Disponible',
    'courts.unavailable': 'Ocupada',
    'courts.book': 'Reservar Ahora',
    'courts.viewAll': 'Ver Todas las Canchas',
    
    // Footer
    'footer.description': 'La plataforma líder para reservar canchas deportivas. Conectamos jugadores con las mejores instalaciones.',
    'footer.quickLinks': 'Enlaces Rápidos',
    'footer.sports': 'Deportes',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',
    'footer.cookies': 'Cookies',
    'footer.rights': 'Todos los derechos reservados.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.reservations': 'My Reservations',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.login': 'Sign In',
    'nav.register': 'Sign Up',
    'nav.logout': 'Sign Out',
    
    // Hero Section
    'hero.title': 'Book your sports court',
    'hero.subtitle': 'The most modern platform to find and book sports courts.',
    'hero.subtitle2': 'Premium experience guaranteed!',
    'hero.explore': 'Explore Courts',
    'hero.reservations': 'My Reservations',
    
    // Features
    'feature.instant.title': 'Instant Booking',
    'feature.instant.desc': 'Confirm your court in less than 30 seconds with our ultra-fast system',
    'feature.secure.title': 'Secure Payment',
    'feature.secure.desc': 'Banking-grade encryption technology to protect all your transactions',
    'feature.premium.title': 'Premium Courts',
    'feature.premium.desc': 'Exclusive access to the best sports facilities in the city',
    
    // Stats
    'stats.courts': 'Available Courts',
    'stats.users': 'Active Users',
    'stats.bookings': 'Bookings Made',
    'stats.rating': 'Average Rating',
    
    // Courts
    'courts.title': 'Featured Courts',
    'courts.subtitle': 'Discover the most popular and highest-rated sports facilities.',
    'courts.available': 'Available',
    'courts.unavailable': 'Unavailable',
    'courts.book': 'Book Now',
    'courts.viewAll': 'View All Courts',
    
    // Footer
    'footer.description': 'The leading platform for booking sports courts. We connect players with the best facilities.',
    'footer.quickLinks': 'Quick Links',
    'footer.sports': 'Sports',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.cookies': 'Cookies',
    'footer.rights': 'All rights reserved.',
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es')

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['es']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
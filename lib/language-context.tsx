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

    // Search & Filters
    'search.title': 'Buscar Canchas',
    'search.subtitle': 'Encuentra la cancha perfecta para tu próximo partido',
    'search.placeholder': 'Buscar por nombre, club o ubicación...',
    'search.sport': 'Deporte',
    'search.club': 'Club',
    'search.location': 'Ubicación',
    'search.priceMin': 'Precio Mín.',
    'search.priceMax': 'Precio Máx.',
    'search.surface': 'Tipo de Superficie',
    'search.distance': 'Distancia Máx. (km)',
    'search.amenities': 'Amenidades',
    'search.clearFilters': 'Limpiar Filtros',
    'search.results': 'Resultados',
    'search.noResults': 'No se encontraron canchas',
    'search.tryAdjusting': 'Prueba ajustando tus filtros de búsqueda',
    'search.gridView': 'Vista de Grilla',
    'search.listView': 'Vista de Lista',
    'search.mapView': 'Mapa 3D',

    // Court Details
    'court.location': 'Ubicación',
    'court.hours': 'Horarios',
    'court.phone': 'Teléfono',
    'court.email': 'Email',
    'court.book': 'Reservar Ahora',
    'court.selectDate': 'Selecciona una fecha',
    'court.availableSlots': 'Horarios disponibles',
    'court.noSlots': 'No hay horarios disponibles para este día',
    'court.bookingSummary': 'Resumen de la Reserva',
    'court.date': 'Fecha',
    'court.time': 'Hora',
    'court.pricePerHour': 'Precio por hora',
    'court.duration': 'Duración',
    'court.total': 'Total',
    'court.amenities': 'Servicios y Comodidades',
    'court.ratings': 'Valoraciones y Opiniones',
    'court.addRating': 'Agregar Valoración',
    'court.signInToBook': 'Inicia sesión para hacer una reserva',

    // Ratings
    'rating.averageRating': 'Calificación Promedio',
    'rating.basedOn': 'Basado en',
    'rating.excellent': 'Excelente',
    'rating.good': 'Buena',
    'rating.fair': 'Regular',
    'rating.weak': 'Débil',
    'rating.recent': 'Más Recientes',
    'rating.highestRated': 'Mejor Calificación',
    'rating.noRatings': 'Aún no hay valoraciones',
    'rating.beFirst': 'Sé el primero en valorar',

    // Password Strength
    'password.strength': 'Seguridad de la Contraseña',
    'password.strongVery': 'Muy Fuerte',
    'password.strong': 'Fuerte',
    'password.good': 'Buena',
    'password.fair': 'Regular',
    'password.weak': 'Débil',
    'password.requirements': 'Requisitos',
    'password.minChars': 'Al menos 8 caracteres',
    'password.uppercase': 'Mayúsculas (A-Z)',
    'password.lowercase': 'Minúsculas (a-z)',
    'password.numbers': 'Números (0-9)',
    'password.special': 'Caracteres especiales (!@#$%^&*)',
    'password.optional': 'Opcional',
    'password.valid': 'Contraseña válida',
    'password.invalid': 'Contraseña débil',

    // Errors
    'error.somethingWrong': 'Algo salió mal',
    'error.tryAgain': 'Intenta nuevamente',
    'error.loading': 'Cargando...',
    'error.notFound': 'No encontrado',
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

    // Search & Filters
    'search.title': 'Find Courts',
    'search.subtitle': 'Find the perfect court for your next game',
    'search.placeholder': 'Search by name, club, or location...',
    'search.sport': 'Sport',
    'search.club': 'Club',
    'search.location': 'Location',
    'search.priceMin': 'Min Price',
    'search.priceMax': 'Max Price',
    'search.surface': 'Surface Type',
    'search.distance': 'Max Distance (km)',
    'search.amenities': 'Amenities',
    'search.clearFilters': 'Clear Filters',
    'search.results': 'Results',
    'search.noResults': 'No courts found',
    'search.tryAdjusting': 'Try adjusting your search filters',
    'search.gridView': 'Grid View',
    'search.listView': 'List View',
    'search.mapView': '3D Map',

    // Court Details
    'court.location': 'Location',
    'court.hours': 'Hours',
    'court.phone': 'Phone',
    'court.email': 'Email',
    'court.book': 'Book Now',
    'court.selectDate': 'Select a date',
    'court.availableSlots': 'Available slots',
    'court.noSlots': 'No available slots for this day',
    'court.bookingSummary': 'Booking Summary',
    'court.date': 'Date',
    'court.time': 'Time',
    'court.pricePerHour': 'Price per hour',
    'court.duration': 'Duration',
    'court.total': 'Total',
    'court.amenities': 'Amenities & Services',
    'court.ratings': 'Ratings & Reviews',
    'court.addRating': 'Add Rating',
    'court.signInToBook': 'Sign in to make a booking',

    // Ratings
    'rating.averageRating': 'Average Rating',
    'rating.basedOn': 'Based on',
    'rating.excellent': 'Excellent',
    'rating.good': 'Good',
    'rating.fair': 'Fair',
    'rating.weak': 'Weak',
    'rating.recent': 'Most Recent',
    'rating.highestRated': 'Highest Rated',
    'rating.noRatings': 'No ratings yet',
    'rating.beFirst': 'Be the first to rate',

    // Password Strength
    'password.strength': 'Password Strength',
    'password.strongVery': 'Very Strong',
    'password.strong': 'Strong',
    'password.good': 'Good',
    'password.fair': 'Fair',
    'password.weak': 'Weak',
    'password.requirements': 'Requirements',
    'password.minChars': 'At least 8 characters',
    'password.uppercase': 'Uppercase (A-Z)',
    'password.lowercase': 'Lowercase (a-z)',
    'password.numbers': 'Numbers (0-9)',
    'password.special': 'Special characters (!@#$%^&*)',
    'password.optional': 'Optional',
    'password.valid': 'Valid password',
    'password.invalid': 'Weak password',

    // Errors
    'error.somethingWrong': 'Something went wrong',
    'error.tryAgain': 'Try again',
    'error.loading': 'Loading...',
    'error.notFound': 'Not found',
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
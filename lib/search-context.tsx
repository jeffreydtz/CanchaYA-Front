'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Cancha, Club, Deporte } from '@/lib/api-client'

interface SearchFilters {
  search: string
  deporte: string
  club: string
  fecha: Date | undefined
  hora: string
  precio: [number, number]
  rating: number
}

interface SearchContextType {
  filters: SearchFilters
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>
  filteredCourts: Cancha[]
  setFilteredCourts: React.Dispatch<React.SetStateAction<Cancha[]>>
  allCourts: Cancha[]
  setAllCourts: React.Dispatch<React.SetStateAction<Cancha[]>>
  applyFilters: () => void
  clearFilters: () => void
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const defaultFilters: SearchFilters = {
  search: '',
  deporte: 'all',
  club: 'all',
  fecha: undefined,
  hora: '',
  precio: [0, 10000],
  rating: 0,
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)
  const [filteredCourts, setFilteredCourts] = useState<Cancha[]>([])
  const [allCourts, setAllCourts] = useState<Cancha[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const applyFilters = useCallback(() => {
    setIsLoading(true)
    
    // Check if any filters are actually applied
    const hasActiveFilters = 
      filters.search.trim() !== '' ||
      filters.deporte !== 'all' ||
      filters.club !== 'all' ||
      filters.fecha !== undefined ||
      filters.hora !== '' ||
      filters.precio[0] !== 0 ||
      filters.precio[1] !== 10000 ||
      filters.rating > 0

    // If no filters are applied, show all available courts
    if (!hasActiveFilters) {
      const availableCourts = allCourts.filter(court => court.disponible)
      setFilteredCourts(availableCourts)
      setIsLoading(false)
      return
    }

    let filtered = [...allCourts]

    // Filter by search text
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      filtered = filtered.filter(court => 
        court.nombre?.toLowerCase().includes(searchTerm) ||
        court.ubicacion?.toLowerCase().includes(searchTerm) ||
        court.deporte?.nombre?.toLowerCase().includes(searchTerm) ||
        court.club?.nombre?.toLowerCase().includes(searchTerm)
      )
    }

    // Filter by sport
    if (filters.deporte !== 'all') {
      filtered = filtered.filter(court => court.deporteId === filters.deporte)
    }

    // Filter by club
    if (filters.club !== 'all') {
      filtered = filtered.filter(court => court.clubId === filters.club)
    }

    // Filter by price range (only if not default range)
    if (filters.precio[0] !== 0 || filters.precio[1] !== 10000) {
      filtered = filtered.filter(court => {
        const price = court.precioPorHora || 0
        return price >= filters.precio[0] && price <= filters.precio[1]
      })
    }

    // Filter by rating (if we had ratings data)
    if (filters.rating > 0) {
      // This would filter by rating when we have that data
      // filtered = filtered.filter(court => (court.rating || 0) >= filters.rating)
    }

    // Filter by availability status
    filtered = filtered.filter(court => court.disponible)

    setFilteredCourts(filtered)
    setIsLoading(false)
  }, [filters, allCourts])

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
    setFilteredCourts(allCourts)
  }, [allCourts])

  return (
    <SearchContext.Provider value={{
      filters,
      setFilters,
      filteredCourts,
      setFilteredCourts,
      allCourts,
      setAllCourts,
      applyFilters,
      clearFilters,
      isLoading,
      setIsLoading
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
/**
 * PersonaSearch Component
 * Autocomplete search for personas with debounce (300ms)
 * Shows avatar or initials
 * Minimum 2 characters to search
 * Returns up to 20 results
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import apiClient, { Persona } from '@/lib/api-client'
import { cn } from '@/lib/utils'

interface PersonaSearchProps {
  onSelect?: (persona: Persona) => void
  placeholder?: string
  className?: string
  showAvatar?: boolean
}

export default function PersonaSearch({
  onSelect,
  placeholder = 'Buscar personas...',
  className,
  showAvatar = true,
}: PersonaSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Persona[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search function
  const searchPersonas = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setResults([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.searchPersonas(searchTerm)
      if (response.error) {
        setError(response.error)
        setResults([])
      } else {
        setResults(response.data || [])
      }
    } catch (err) {
      setError('Error al buscar personas')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPersonas(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query, searchPersonas])

  const handleSelect = (persona: Persona) => {
    setQuery('')
    setResults([])
    setShowResults(false)
    onSelect?.(persona)
  }

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido?.charAt(0) || ''}`.toUpperCase()
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="pl-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (query.length >= 2 || error) && (
        <Card className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto shadow-lg">
          {error && (
            <div className="p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!error && results.length === 0 && query.length >= 2 && !loading && (
            <div className="p-4 text-sm text-gray-500 text-center">
              No se encontraron personas
            </div>
          )}

          {!error && query.length < 2 && (
            <div className="p-4 text-sm text-gray-500 text-center">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}

          {!error && results.length > 0 && (
            <div className="py-2">
              {results.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handleSelect(persona)}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {showAvatar && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={persona.avatarUrl} alt={persona.nombre} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(persona.nombre, persona.apellido)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">
                      {persona.nombre} {persona.apellido}
                    </p>
                    <p className="text-xs text-gray-500">
                      {persona.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

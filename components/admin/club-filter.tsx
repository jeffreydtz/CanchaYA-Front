'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import apiClient, { Club } from '@/lib/api-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Building2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ClubFilterProps {
  selectedClubId?: string
  onClubChange?: (clubId: string | undefined) => void
  label?: string
  placeholder?: string
  allowAll?: boolean
  className?: string
}

/**
 * ClubFilter component
 *
 * - If user is admin (isSuperAdmin): shows all clubs + optional "Todos los clubes" option
 * - If user is admin-club: only shows their assigned clubs (from clubIds array)
 * - Automatically filters and handles club selection
 */
export function ClubFilter({
  selectedClubId,
  onClubChange,
  label = 'Club',
  placeholder = 'Seleccionar club',
  allowAll = true,
  className = '',
}: ClubFilterProps) {
  const { isSuperAdmin, clubIds } = useAuth()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [availableClubs, setAvailableClubs] = useState<Club[]>([])

  useEffect(() => {
    loadClubs()
  }, [])

  useEffect(() => {
    if (clubs.length === 0) return

    // If super admin, show all clubs
    if (isSuperAdmin) {
      setAvailableClubs(clubs)
    } else {
      // If admin-club, filter by their assigned clubIds
      const filtered = clubs.filter((club) => clubIds.includes(club.id))
      setAvailableClubs(filtered)
    }
  }, [clubs, isSuperAdmin, clubIds])

  const loadClubs = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getClubes()
      if (response.error) {
        toast.error(response.error)
      } else if (response.data) {
        setClubs(response.data)
      }
    } catch {
      toast.error('Error al cargar clubes')
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (value: string) => {
    if (value === 'all') {
      onClubChange?.(undefined)
    } else {
      onClubChange?.(value)
    }
  }

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && <Label>{label}</Label>}
        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Cargando clubes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <Select value={selectedClubId || 'all'} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {isSuperAdmin && allowAll && (
            <SelectItem value="all">
              Todos los clubes
            </SelectItem>
          )}
          {availableClubs.map((club) => (
            <SelectItem key={club.id} value={club.id}>
              {club.nombre}
            </SelectItem>
          ))}
          {availableClubs.length === 0 && (
            <SelectItem value="none" disabled>
              No hay clubes disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

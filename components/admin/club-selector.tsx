/**
 * Club Selector Component
 * Allows admin-club and admin users to select which club(s) they want to view data for
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import apiClient, { Club } from '@/lib/api-client'
import { Building2, ChevronDown, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ClubSelectorProps {
  selectedClubId?: string | null
  onClubSelect?: (clubId: string | null) => void
  allowMultiple?: boolean
  showLabel?: boolean
}

/**
 * ClubSelector Component
 *
 * For admin users (global):
 * - Shows all clubs in the system
 * - Can select "All clubs" or individual clubs
 *
 * For admin-club users (scoped):
 * - Shows only clubs they have access to (from JWT clubIds)
 * - Can select one of their assigned clubs
 *
 * For regular users (usuario):
 * - Not shown (component renders null)
 */
export function ClubSelector({
  selectedClubId,
  onClubSelect,
  showLabel = true,
}: ClubSelectorProps) {
  const { nivelAcceso, clubIds, isSuperAdmin, isAdminClub } = useAuth()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)

  useEffect(() => {
    // Skip if user is not an admin (check nivelAcceso, not userRole)
    if (nivelAcceso !== 'admin' && nivelAcceso !== 'admin-club') {
      return
    }

    const fetchClubs = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getClubes()

        if (response.error) {
          toast.error('Error al cargar los clubes')
          return
        }

        let clubList = response.data || []

        // Filter clubs based on user role
        if (isAdminClub && clubIds && clubIds.length > 0) {
          // Admin-club users can only see their assigned clubs
          clubList = clubList.filter(club => clubIds.includes(club.id))
        }
        // Global admin sees all clubs

        setClubs(clubList)

        // Set initial selected club
        if (selectedClubId) {
          const club = clubList.find(c => c.id === selectedClubId)
          if (club) {
            setSelectedClub(club)
          }
        } else if (clubList.length > 0) {
          // Auto-select first club for admin-club users
          if (isAdminClub && clubIds && clubIds.length === 1) {
            setSelectedClub(clubList[0])
            onClubSelect?.(clubList[0].id)
          }
        }
      } catch (error) {
        toast.error('Error al cargar los clubes')
      } finally {
        setLoading(false)
      }
    }

    fetchClubs()
  }, [nivelAcceso, clubIds, isAdminClub, selectedClubId, onClubSelect])

  const handleSelectClub = (club: Club) => {
    setSelectedClub(club)
    onClubSelect?.(club.id)
  }

  const handleSelectAll = () => {
    setSelectedClub(null)
    onClubSelect?.(null)
  }

  // Only show for admin users (check nivelAcceso)
  if (nivelAcceso !== 'admin' && nivelAcceso !== 'admin-club') {
    return null
  }

  // Get display label
  const displayLabel = selectedClub ? selectedClub.nombre : 'Todos los clubes'

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Building2 className="h-4 w-4" />
          Club:
        </div>
      )}

      <DropdownMenu>
        <Button
          variant="outline"
          className="w-48 justify-between"
          disabled={clubs.length === 0}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>

        <DropdownMenuContent align="end" className="w-56">
          {isSuperAdmin && (
            <>
              <DropdownMenuLabel className="text-xs font-semibold uppercase text-gray-500">
                Filtro
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={!selectedClub}
                onCheckedChange={handleSelectAll}
              >
                <Check className="mr-2 h-4 w-4" />
                <span className="font-medium">Todos los clubes</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuLabel className="text-xs font-semibold uppercase text-gray-500">
            {isAdminClub ? 'Mis Clubes' : 'Clubes Disponibles'}
          </DropdownMenuLabel>

          {clubs.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
              No hay clubes disponibles
            </div>
          ) : (
            clubs.map(club => (
              <DropdownMenuCheckboxItem
                key={club.id}
                checked={selectedClub?.id === club.id}
                onCheckedChange={() => handleSelectClub(club)}
              >
                <Check className="mr-2 h-4 w-4" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{club.nombre}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {club.direccion}
                  </span>
                </div>
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedClub && (
        <Badge variant="secondary" className="ml-2">
          {isSuperAdmin ? 'Filtrado' : 'Seleccionado'}
        </Badge>
      )}
    </div>
  )
}

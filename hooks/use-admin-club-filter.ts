/**
 * Hook for managing club-based filtering in admin dashboard
 * Provides selected club state and filtering utilities for admin users
 */

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-context'

export function useAdminClubFilter() {
  const { isAdmin, isAdminClub, clubIds } = useAuth()
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null)

  // For admin-club users, automatically set to their first (or only) club
  useEffect(() => {
    if (isAdminClub && clubIds && clubIds.length > 0 && !selectedClubId) {
      setSelectedClubId(clubIds[0])
    }
  }, [isAdminClub, clubIds, selectedClubId])

  const handleClubSelect = useCallback((clubId: string | null) => {
    setSelectedClubId(clubId)
  }, [])

  /**
   * Filter canchas by selected club
   * Returns all canchas if no club is selected (global admin)
   */
  const filterCanchasByClub = useCallback(
    (canchas: any[]) => {
      if (!selectedClubId || isAdmin) {
        // Global admin sees all, or no club selected
        return canchas
      }
      // Filter by selected club
      return canchas.filter(c => c.club?.id === selectedClubId)
    },
    [selectedClubId, isAdmin]
  )

  /**
   * Filter reservas by selected club
   * Returns all reservas if no club is selected (global admin)
   */
  const filterReservasByClub = useCallback(
    (reservas: any[]) => {
      if (!selectedClubId || isAdmin) {
        // Global admin sees all, or no club selected
        return reservas
      }
      // Filter by selected club (through cancha)
      return reservas.filter(r => r.disponibilidad?.cancha?.club?.id === selectedClubId)
    },
    [selectedClubId, isAdmin]
  )

  return {
    selectedClubId,
    onClubSelect: handleClubSelect,
    filterCanchasByClub,
    filterReservasByClub,
    isFiltered: !!selectedClubId && isAdminClub,
  }
}

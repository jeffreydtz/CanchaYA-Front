'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useAuth } from '@/components/auth/auth-context'

interface ChallengesContextType {
  pendingChallengesCount: number
  refreshPendingChallenges: () => Promise<void>
  notifyChallengePendingCountChanged: () => void
}

const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined)

export function ChallengesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [pendingChallengesCount, setPendingChallengesCount] = useState(0)

  // Fetch pending challenges from API
  const refreshPendingChallenges = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await apiClient.getDesafios()
      if (response.data) {
        const pending = response.data.filter(d => d.estado === 'pendiente').length
        setPendingChallengesCount(pending)
      }
    } catch (error) {
      console.error('Error fetching pending challenges:', error)
    }
  }, [isAuthenticated])

  // Notify that the challenge count may have changed (without immediate refetch)
  const notifyChallengePendingCountChanged = useCallback(() => {
    // Small delay to ensure backend state is updated
    setTimeout(() => {
      refreshPendingChallenges()
    }, 500)
  }, [refreshPendingChallenges])

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshPendingChallenges()
    }
  }, [isAuthenticated, refreshPendingChallenges])

  return (
    <ChallengesContext.Provider
      value={{
        pendingChallengesCount,
        refreshPendingChallenges,
        notifyChallengePendingCountChanged,
      }}
    >
      {children}
    </ChallengesContext.Provider>
  )
}

export function useChallengesNotifications() {
  const context = useContext(ChallengesContext)
  if (context === undefined) {
    throw new Error('useChallengesNotifications must be used within ChallengesProvider')
  }
  return context
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

/**
 * Competitivo Page - Redirect to Desafios
 * This page has been consolidated with /desafios for better UX consistency
 */
export default function CompetitivoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the desafios page where all challenge functionality is centralized
    router.push('/desafios')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <div className="text-lg text-gray-600 dark:text-gray-300">Redirigiendo a Desafíos...</div>
      </div>
    </div>
  )
}

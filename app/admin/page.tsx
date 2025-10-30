"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main dashboard with real data
    router.push("/admin/dashboard")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <div className="text-lg text-gray-600 dark:text-gray-300">Redirigiendo al dashboard...</div>
      </div>
    </div>
  )
}

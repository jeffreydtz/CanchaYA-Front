import { Navbar } from "@/components/navbar"
import { CourtDetail } from "@/components/court/court-detail"
import { notFound } from "next/navigation"
import { getServerUser } from '@/lib/auth-server'
import apiClient from '@/lib/api-client'

interface CourtPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CourtPage({ params }: CourtPageProps) {
  const { id } = await params
  const user = await getServerUser()

  // Fetch court data from API
  const courtResponse = await apiClient.getCourt(id)
  
  if (courtResponse.error || !courtResponse.data) {
    notFound()
  }

  const court = courtResponse.data

  // Fetch availability for today by default
  const today = new Date().toISOString().split('T')[0]
  const availabilityResponse = await apiClient.getCourtAvailability(id, today)
  const availability = availabilityResponse.data?.horarios || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <CourtDetail 
          court={court} 
          availability={availability}
          isAuthenticated={!!user}
          userId={user?.id}
        />
      </main>
    </div>
  )
}

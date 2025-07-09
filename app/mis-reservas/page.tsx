import { Navbar } from "@/components/navbar"
import { MyReservations } from "@/components/reservations/my-reservations"
import { getServerUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import apiClient from '@/lib/api-client'

export default async function MyReservationsPage() {
  const user = await getServerUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch user's reservations
  const reservationsResponse = await apiClient.getMyReservations()
  const reservations = reservationsResponse.data || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <MyReservations 
          reservations={reservations}
          userId={user.id}
        />
      </main>
    </div>
  )
}

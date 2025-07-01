import { Navbar } from "@/components/navbar"
import { MyReservations } from "@/components/reservations/my-reservations"

// Mock user data
const mockUser = {
  name: "Juan Pérez",
  email: "juan@email.com",
  role: "player" as const,
}

export default function MyReservationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />
      <main className="container mx-auto px-4 py-8">
        <MyReservations />
      </main>
    </div>
  )
}

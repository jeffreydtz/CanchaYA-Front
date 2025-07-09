import { Navbar } from "@/components/navbar"
import { CourtDetail } from "@/components/court/court-detail"
import { notFound } from "next/navigation"

// Mock user data
const mockUser = {
  name: "Juan Pérez",
  email: "juan@email.com",
  role: "player" as const,
}

// Mock court data
const mockCourts = {
  1: {
    id: 1,
    name: "Club Atlético Central",
    sport: "Fútbol 5",
    price: 8000,
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    rating: 4.8,
    location: "Centro",
    address: "San Martín 1234, Rosario",
    surface: "Césped sintético",
    hasLights: true,
    capacity: 10,
    description:
      "Cancha de fútbol 5 con césped sintético de última generación. Ubicada en el centro de la ciudad con fácil acceso y estacionamiento.",
    amenities: ["Vestuarios", "Estacionamiento", "Buffet", "Duchas"],
    availableSlots: [
      { time: "18:00", available: true },
      { time: "19:00", available: true },
      { time: "20:00", available: false },
      { time: "21:00", available: true },
      { time: "22:00", available: true },
    ],
    reviews: [
      {
        id: 1,
        user: "Carlos M.",
        rating: 5,
        comment: "Excelente cancha, muy bien mantenida. El césped sintético está en perfectas condiciones.",
        date: "2024-01-15",
      },
      {
        id: 2,
        user: "María L.",
        rating: 4,
        comment: "Buena ubicación y instalaciones. Los vestuarios podrían estar mejor.",
        date: "2024-01-10",
      },
    ],
  },
}

interface CourtPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CourtPage({ params }: CourtPageProps) {
  const { id } = await params
  const courtId = Number.parseInt(id)
  const court = mockCourts[courtId as keyof typeof mockCourts]

  if (!court) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />
      <main className="container mx-auto px-4 py-8">
        <CourtDetail court={court} />
      </main>
    </div>
  )
}

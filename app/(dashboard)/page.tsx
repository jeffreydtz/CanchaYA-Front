import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/dashboard/hero-section"
import { FeaturedCourts } from "@/components/dashboard/featured-courts"
import { CourtFilters } from "@/components/dashboard/court-filters"

// Mock user data - in real app this would come from auth
const mockUser = {
  name: "Juan Pérez",
  email: "juan@email.com",
  role: "player" as const,
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />
      <main>
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-80">
              <CourtFilters />
            </aside>
            <div className="flex-1">
              <FeaturedCourts />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

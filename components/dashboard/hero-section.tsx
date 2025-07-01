import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary to-primary-600 text-primary-foreground">
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('/placeholder.svg?height=600&width=1200')",
        }}
      />
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Reservá tu próxima cancha en <span className="text-yellow-300">3 clics</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-primary-foreground/90">
            La plataforma más fácil para reservar canchas deportivas en Rosario. Fútbol, pádel, básquet y más.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" variant="secondary" className="min-touch-target" asChild>
              <Link href="/canchas">
                Ver canchas disponibles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-touch-target bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              ¿Cómo funciona?
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Reserva fácil</h3>
                <p className="text-sm text-primary-foreground/80">En solo 3 clics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Ubicaciones</h3>
                <p className="text-sm text-primary-foreground/80">Por toda la ciudad</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Comunidad</h3>
                <p className="text-sm text-primary-foreground/80">Miles de jugadores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

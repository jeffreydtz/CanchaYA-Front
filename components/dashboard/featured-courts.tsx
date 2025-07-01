import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const mockCourts = [
  {
    id: 1,
    name: "Club Atlético Central",
    sport: "Fútbol 5",
    price: 8000,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.8,
    location: "Centro",
    available: true,
    surface: "Césped sintético",
    hasLights: true,
  },
  {
    id: 2,
    name: "Complejo Deportivo Norte",
    sport: "Pádel",
    price: 6000,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.6,
    location: "Zona Norte",
    available: false,
    surface: "Cemento",
    hasLights: true,
  },
  {
    id: 3,
    name: "Polideportivo Sur",
    sport: "Básquet",
    price: 5000,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.7,
    location: "Zona Sur",
    available: true,
    surface: "Parquet",
    hasLights: false,
  },
  {
    id: 4,
    name: "Tennis Club Rosario",
    sport: "Tenis",
    price: 7000,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.9,
    location: "Pichincha",
    available: true,
    surface: "Polvo de ladrillo",
    hasLights: true,
  },
  {
    id: 5,
    name: "Futsal Arena",
    sport: "Fútbol 5",
    price: 9000,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.5,
    location: "Echesortu",
    available: true,
    surface: "Sintético premium",
    hasLights: true,
  },
  {
    id: 6,
    name: "Paddle Center",
    sport: "Pádel",
    price: 6500,
    image: "/placeholder.svg?height=200&width=300",
    rating: 4.4,
    location: "Fisherton",
    available: false,
    surface: "Césped sintético",
    hasLights: true,
  },
]

export function FeaturedCourts() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Canchas destacadas</h2>
        <Button variant="outline" asChild>
          <Link href="/canchas">Ver todas</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockCourts.map((court) => (
          <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <Image
                src={court.image || "/placeholder.svg"}
                alt={court.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant={court.available ? "default" : "secondary"}>
                  {court.available ? "Disponible" : "Ocupada"}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="bg-background/90">
                  {court.sport}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg leading-tight">{court.name}</h3>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{court.rating}</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {court.location}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Superficie:</span>
                  <span>{court.surface}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Iluminación:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{court.hasLights ? "Sí" : "No"}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-0">
              <div className="text-lg font-bold text-primary">${court.price.toLocaleString()}/hora</div>
              <Button asChild disabled={!court.available} className="min-touch-target">
                <Link href={`/cancha/${court.id}`}>{court.available ? "Ver detalles" : "No disponible"}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

'use client'

/**
 * Next.js 404 Not Found Page for CanchaYA
 * Custom error page for pages that don't exist
 */

import Link from 'next/link'
import { Search, Home, ArrowLeft, MapPin, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Página no encontrada</CardTitle>
          <CardDescription className="text-lg">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Navigation Options */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="flex items-center gap-2 h-auto py-3">
              <Link href="/">
                <Home className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Ir al inicio</div>
                  <div className="text-xs opacity-90">Página principal</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2 h-auto py-3" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Volver atrás</div>
                <div className="text-xs opacity-90">Página anterior</div>
              </div>
            </Button>
          </div>

          {/* Popular Pages */}
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertTitle>¿Buscabas alguna de estas páginas?</AlertTitle>
            <AlertDescription>
              <div className="grid gap-2 mt-3">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-sm hover:underline p-2 rounded hover:bg-muted"
                >
                  <Search className="h-3 w-3" />
                  Buscar canchas disponibles
                </Link>
                <Link 
                  href="/mis-reservas" 
                  className="flex items-center gap-2 text-sm hover:underline p-2 rounded hover:bg-muted"
                >
                  <Calendar className="h-3 w-3" />
                  Mis reservas
                </Link>
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 text-sm hover:underline p-2 rounded hover:bg-muted"
                >
                  <Users className="h-3 w-3" />
                  Iniciar sesión
                </Link>
              </div>
            </AlertDescription>
          </Alert>

          {/* Help Section */}
          <Alert className="border-blue-200 bg-blue-50">
            <Search className="h-4 w-4" />
            <AlertTitle>¿Necesitas ayuda?</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                <li>Verifica que la URL esté escrita correctamente</li>
                <li>Es posible que el enlace haya expirado</li>
                <li>Intenta buscar lo que necesitas desde la página principal</li>
                <li>Si llegaste aquí desde un enlace, reporta el problema</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Contact Support */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p className="mb-2">
              ¿Crees que esto es un error? Contáctanos:
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="link"
                size="sm"
                asChild
                className="h-auto p-0"
              >
                <a href="mailto:soporte@canchaya.com">
                  <Search className="h-3 w-3 mr-1" />
                  Reportar problema
                </a>
              </Button>
              <Button
                variant="link"
                size="sm"
                asChild
                className="h-auto p-0"
              >
                <a href="https://wa.me/5493415555555" target="_blank" rel="noopener noreferrer">
                  <Users className="h-3 w-3 mr-1" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Breadcrumb-style navigation */}
          <div className="text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">CanchaYA</Link>
            <span className="mx-1">/</span>
            <span>404 - Página no encontrada</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
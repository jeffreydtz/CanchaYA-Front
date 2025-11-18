/**
 * My Debts Page for CanchaYA
 * User-facing page to view and track their debts
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wallet,
  CreditCard,
  Clock
} from 'lucide-react'
import apiClient, { Deuda } from '@/lib/api-client'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-context'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Navbar from '@/components/navbar/navbar'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default function MisDeudasPage() {
  const { isAuthenticated, personaId } = useAuth()
  const [debts, setDebts] = useState<Deuda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && personaId) {
      loadDebts()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, personaId])

  const loadDebts = async () => {
    try {
      const response = await apiClient.getDeudas()
      if (response.error) {
        console.error('Error loading debts:', response.error)
        return
      }

      if (response.data) {
        // Filter debts for current user
        const userDebts = response.data.filter(
          (debt) => debt.persona.id === personaId
        )
        setDebts(userDebts)
      }
    } catch (error) {
      console.error('Error loading debts:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalDebt = debts
    .filter((d) => !d.pagada)
    .reduce((sum, d) => sum + d.monto, 0)

  const overdueDebts = debts.filter((d) => {
    if (d.pagada || !d.fechaVencimiento) return false
    return new Date(d.fechaVencimiento) < new Date()
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Inicia sesión para ver tus deudas</h2>
            <p className="text-gray-600 mb-4">
              Necesitas estar autenticado para acceder a tu información financiera
            </p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
        <Navbar />
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
      <Navbar />

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Mis Deudas
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestiona y realiza seguimiento de tus pagos pendientes
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Debt */}
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200/50 dark:border-red-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                    Deuda Total
                  </p>
                  <h3 className="text-3xl font-bold text-red-900 dark:text-red-100">
                    ${totalDebt.toFixed(2)}
                  </h3>
                </div>
                <div className="p-3 bg-red-500 rounded-full">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Debts */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200/50 dark:border-yellow-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                    Deudas Vencidas
                  </p>
                  <h3 className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                    {overdueDebts.length}
                  </h3>
                </div>
                <div className="p-3 bg-yellow-500 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paid Debts */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                    Deudas Pagadas
                  </p>
                  <h3 className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {debts.filter((d) => d.pagada).length}
                  </h3>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Detalles de Deudas
            </CardTitle>
            <CardDescription>
              {debts.length > 0
                ? `Tienes ${debts.length} ${debts.length === 1 ? 'deuda registrada' : 'deudas registradas'}`
                : 'No tienes deudas registradas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ¡No tienes deudas!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tu cuenta está al día
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {debts.map((debt) => {
                  const isOverdue =
                    !debt.pagada &&
                    debt.fechaVencimiento &&
                    new Date(debt.fechaVencimiento) < new Date()

                  return (
                    <div
                      key={debt.id}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        debt.pagada
                          ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                          : isOverdue
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50'
                          : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700/50'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`p-2 rounded-lg ${
                                debt.pagada
                                  ? 'bg-green-500'
                                  : isOverdue
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                              }`}
                            >
                              {debt.pagada ? (
                                <CheckCircle className="h-5 w-5 text-white" />
                              ) : isOverdue ? (
                                <AlertTriangle className="h-5 w-5 text-white" />
                              ) : (
                                <Clock className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                                ${debt.monto.toFixed(2)}
                              </h4>
                              <Badge
                                variant={debt.pagada ? 'default' : 'secondary'}
                                className={
                                  debt.pagada
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : isOverdue
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'bg-blue-100 text-blue-800 border-blue-200'
                                }
                              >
                                {debt.pagada ? 'Pagada' : isOverdue ? 'Vencida' : 'Pendiente'}
                              </Badge>
                            </div>
                          </div>

                          {debt.fechaVencimiento && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Vencimiento:{' '}
                                {new Date(debt.fechaVencimiento).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {!debt.pagada && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="default" size="sm">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pagar Ahora
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        {debts.some((d) => !d.pagada) && (
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Información Importante
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Las deudas pendientes pueden afectar tu capacidad para realizar nuevas reservas.
                    Por favor, contacta con el club o utiliza la opción de pago para regularizar tu situación.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

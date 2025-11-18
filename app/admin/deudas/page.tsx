/**
 * Admin Debts Management Page for CanchaYA
 * Allows administrators to create, view, and manage user debts
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Trash2,
  User,
  Edit
} from 'lucide-react'
import apiClient, { Deuda, Persona } from '@/lib/api-client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function AdminDeudasPage() {
  const [debts, setDebts] = useState<Deuda[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [selectedPersonaId, setSelectedPersonaId] = useState('')
  const [monto, setMonto] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [debtsResponse, personasResponse] = await Promise.all([
        apiClient.getDeudas(),
        apiClient.getPersonas(),
      ])

      if (debtsResponse.data) {
        setDebts(debtsResponse.data)
      }

      if (personasResponse.data) {
        setPersonas(personasResponse.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDebt = async () => {
    if (!selectedPersonaId || !monto || !fechaVencimiento) {
      toast.error('Por favor completa todos los campos')
      return
    }

    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      toast.error('El monto debe ser un número positivo')
      return
    }

    setSubmitting(true)
    try {
      const response = await apiClient.createDeuda({
        personaId: selectedPersonaId,
        monto: montoNum,
        fechaVencimiento: fechaVencimiento,
        pagada: false,
      })

      if (response.error) {
        toast.error(response.error)
        return
      }

      if (response.data) {
        toast.success('Deuda creada exitosamente')
        setShowCreateDialog(false)
        setSelectedPersonaId('')
        setMonto('')
        setFechaVencimiento('')
        loadData()
      }
    } catch (error) {
      console.error('Error creating debt:', error)
      toast.error('No se pudo crear la deuda')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsPaid = async (debtId: string) => {
    try {
      const response = await apiClient.updateDeuda(debtId, { pagada: true })

      if (response.error) {
        toast.error(response.error)
        return
      }

      if (response.data) {
        toast.success('Deuda marcada como pagada')
        loadData()
      }
    } catch (error) {
      console.error('Error updating debt:', error)
      toast.error('No se pudo actualizar la deuda')
    }
  }

  const handleDeleteDebt = async (debtId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta deuda?')) return

    try {
      const response = await apiClient.deleteDeuda(debtId)

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success('Deuda eliminada')
      loadData()
    } catch (error) {
      console.error('Error deleting debt:', error)
      toast.error('No se pudo eliminar la deuda')
    }
  }

  const filteredDebts = debts.filter((debt) => {
    const personaNombre = debt.persona?.nombre?.toLowerCase() || ''
    return personaNombre.includes(searchTerm.toLowerCase())
  })

  const totalDebt = debts.filter((d) => !d.pagada).reduce((sum, d) => sum + d.monto, 0)
  const overdueDebts = debts.filter((d) => {
    if (d.pagada || !d.fechaVencimiento) return false
    return new Date(d.fechaVencimiento) < new Date()
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Gestión de Deudas
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Administra y realiza seguimiento de las deudas de todos los usuarios
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Deudas</p>
                <h3 className="text-2xl font-bold">{debts.length}</h3>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Monto Total</p>
                <h3 className="text-2xl font-bold">${totalDebt.toFixed(2)}</h3>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Vencidas</p>
                <h3 className="text-2xl font-bold">{overdueDebts.length}</h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pagadas</p>
                <h3 className="text-2xl font-bold">{debts.filter((d) => d.pagada).length}</h3>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre de persona..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Deuda
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Deudas</CardTitle>
          <CardDescription>
            {filteredDebts.length} {filteredDebts.length === 1 ? 'deuda encontrada' : 'deudas encontradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDebts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No se encontraron deudas' : 'No hay deudas registradas'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDebts.map((debt) => {
                const isOverdue =
                  !debt.pagada &&
                  debt.fechaVencimiento &&
                  new Date(debt.fechaVencimiento) < new Date()

                return (
                  <div
                    key={debt.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      debt.pagada
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200'
                        : isOverdue
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200'
                        : 'bg-white dark:bg-gray-800 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`p-2 rounded-lg ${
                            debt.pagada
                              ? 'bg-green-500'
                              : isOverdue
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                        >
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {debt.persona?.nombre || 'Usuario Desconocido'}
                            </h4>
                            <Badge
                              variant={debt.pagada ? 'default' : 'secondary'}
                              className={
                                debt.pagada
                                  ? 'bg-green-100 text-green-800'
                                  : isOverdue
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {debt.pagada ? 'Pagada' : isOverdue ? 'Vencida' : 'Pendiente'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-medium text-lg">${debt.monto.toFixed(2)}</span>
                            {debt.fechaVencimiento && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(debt.fechaVencimiento).toLocaleDateString('es-ES')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!debt.pagada && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(debt.id)}
                            variant="default"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como pagada
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDebt(debt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Debt Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Deuda</DialogTitle>
            <DialogDescription>
              Registra una nueva deuda para un usuario del sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="persona">Usuario</Label>
              <select
                id="persona"
                value={selectedPersonaId}
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Selecciona un usuario</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre} {persona.apellido} ({persona.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="monto">Monto ($)</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDebt} disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Deuda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

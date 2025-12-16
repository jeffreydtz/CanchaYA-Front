"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import apiClient, { Cancha, DisponibilidadHorario, Horario } from '@/lib/api-client'
import { Loader2, Calendar, Clock, Trash2, CheckSquare, PlusCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { withErrorBoundary } from '@/components/error/with-error-boundary'
import { useAuth } from '@/components/auth/auth-context'

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
]

/**
 * Convierte días de la semana del formato frontend (0-6) al formato backend (1-7)
 * Frontend: 0=domingo, 1=lunes, ..., 6=sábado
 * Backend POST: 1=lunes, ..., 6=sábado, 7=domingo
 */
function convertDiasToBackendFormat(dias: number[]): number[] {
  return dias.map(dia => {
    if (dia === 0) return 7 // Domingo: 0 -> 7
    return dia // Lunes-Sábado: 1-6 -> 1-6
  })
}

/**
 * Convierte días de la semana del formato backend al formato frontend (0-6)
 * Backend GET puede devolver:
 *   - Formato 0-6: 0=domingo, 1=lunes, ..., 6=sábado (formato interno)
 *   - Formato 1-7: 1=lunes, ..., 6=sábado, 7=domingo (formato de respuesta)
 * Frontend siempre usa: 0=domingo, 1=lunes, ..., 6=sábado
 */
function convertDiaFromBackendFormat(backendDia: number): number {
  // Si el backend devuelve 0 para domingo, mantenerlo (ya está en formato frontend)
  if (backendDia === 0) return 0
  // Si el backend devuelve 7 para domingo, convertir a 0
  if (backendDia === 7) return 0
  // Para lunes-sábado (1-6), mantener igual (compatible en ambos formatos)
  if (backendDia >= 1 && backendDia <= 6) return backendDia
  // Si recibimos un valor inesperado, loguear y devolver tal cual
  return backendDia
}

function AdminDisponibilidadPage() {
  const { nivelAcceso, clubIds, isAdmin } = useAuth()
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadHorario[]>([])
  const [selectedCancha, setSelectedCancha] = useState<string>('')
  const [selectedCanchas, setSelectedCanchas] = useState<string[]>([])
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>([])
  const [selectedDias, setSelectedDias] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)

  // Cargar canchas al inicio - FILTRADAS POR ALCANCE DEL USUARIO
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        const [canchasRes, horariosRes] = await Promise.all([
          apiClient.getCanchas(),
          apiClient.getHorarios()
        ])

        if (canchasRes.data) {
          let filteredCanchas = canchasRes.data

          // CRITICAL: Filtrar canchas según nivel de acceso
          // Admin global: ve todas las canchas
          // Admin club: solo ve canchas de sus clubes asignados
          if (nivelAcceso === 'admin-club' && clubIds && clubIds.length > 0) {
            filteredCanchas = canchasRes.data.filter(cancha =>
              clubIds.includes(cancha.club.id)
            )
          }

          setCanchas(filteredCanchas)
        }
        if (horariosRes.data) {
          // Filtrar horarios para excluir el de las 23:00-23:59
          const filteredHorarios = horariosRes.data.filter(horario =>
            horario.horaInicio !== '23:00:00' && horario.horaInicio !== '23:00'
          )
          setHorarios(filteredHorarios)
        }
      } catch {
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [nivelAcceso, clubIds])

  // Cargar disponibilidades cuando se selecciona una cancha para ver
  useEffect(() => {
    const loadDisponibilidades = async () => {
      if (!selectedCancha) {
        setDisponibilidades([])
        return
      }

      setViewLoading(true)
      try {
        const response = await apiClient.getDisponibilidadPorCancha(selectedCancha)

        if (response.error) {
          // Si es un 404, puede que simplemente no haya disponibilidades aún
          if (response.status === 404) {
            setDisponibilidades([])
            // No mostrar error si es 404, solo loguear
          } else {
            toast.error('Error al cargar disponibilidades', {
              description: response.error
            })
            setDisponibilidades([])
          }
          return
        }

        if (response.data) {
          // Verificar que sea un array
          if (!Array.isArray(response.data)) {
            toast.error('Error en el formato de datos', {
              description: 'El servidor devolvió un formato inesperado'
            })
            setDisponibilidades([])
            return
          }

          // Convertir días del formato backend al formato frontend
          // Backend puede devolver 0-6 (0=domingo) o 1-7 (7=domingo), normalizamos a 0-6
          const disponibilidadesConvertidas = response.data.map((disp) => {
            const diaConvertido = convertDiaFromBackendFormat(disp.diaSemana)

            return {
              ...disp,
              diaSemana: diaConvertido
            }
          })

          setDisponibilidades(disponibilidadesConvertidas)
        } else {
          setDisponibilidades([])
        }
      } catch (error) {
        toast.error('Error al cargar disponibilidades', {
          description: error instanceof Error ? error.message : 'Error desconocido'
        })
        setDisponibilidades([])
      } finally {
        setViewLoading(false)
      }
    }
    loadDisponibilidades()
  }, [selectedCancha])

  const handleSubmitPattern = async () => {
    if (selectedCanchas.length === 0) {
      toast.error('Selecciona al menos una cancha')
      return
    }
    if (selectedHorarios.length === 0) {
      toast.error('Selecciona al menos un horario')
      return
    }
    if (selectedDias.length === 0) {
      toast.error('Selecciona al menos un día de la semana')
      return
    }

    setSubmitting(true)
    try {
      // Convertir días del formato frontend (0-6) al formato backend (1-7)
      const diasBackend = convertDiasToBackendFormat(selectedDias)

      const requestData = {
        canchaIds: selectedCanchas,
        horarioIds: selectedHorarios,
        diasSemana: diasBackend,
        disponible: true
      }
      
      const response = await apiClient.crearDisponibilidadLote(requestData)


      if (response.error) {
        toast.error('Error al crear disponibilidad', {
          description: response.error || 'Error desconocido del servidor'
        })
        setSubmitting(false)
        return
      }

      const result = response.data
      if (result) {
        toast.success('Patrón de disponibilidad creado', {
          description: `${result.inserted} slot(s) creado(s), ${result.skipped || 0} duplicado(s)`
        })

        // Limpiar selección
        setSelectedCanchas([])
        setSelectedHorarios([])
        setSelectedDias([])

        // Recargar si estamos viendo una cancha
        if (selectedCancha) {
          // Pequeño delay para asegurar que el backend haya procesado la creación
          setTimeout(async () => {
            try {
              const reloadResponse = await apiClient.getDisponibilidadPorCancha(selectedCancha)
              if (reloadResponse.data) {
                // Convertir días del formato backend al formato frontend
                const disponibilidadesConvertidas = reloadResponse.data.map(disp => ({
                  ...disp,
                  diaSemana: convertDiaFromBackendFormat(disp.diaSemana)
                }))
                setDisponibilidades(disponibilidadesConvertidas)
              } else if (reloadResponse.error) {
                toast.error('Error al recargar disponibilidades', {
                  description: reloadResponse.error
                })
              }
            } catch (error) {
              toast.error('Error al recargar disponibilidades', {
                description: error instanceof Error ? error.message : 'Error desconocido'
              })
            }
          }, 1000) // Aumentado a 1 segundo para dar más tiempo al backend
        }
      } else {
        toast.error('Error al crear disponibilidad', {
          description: 'No se recibió respuesta del servidor. Revisa la consola para más detalles.'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al crear disponibilidad', {
        description: errorMessage
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    try {
      const response = await apiClient.deleteDisponibilidadHorario(id)

      if (response.error) {
        toast.error('Error al eliminar', {
          description: response.error
        })
        return
      }

      toast.success('Slot eliminado exitosamente')
      setDisponibilidades(prev => prev.filter(d => d.id !== id))
    } catch {
      toast.error('Error al eliminar slot')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Gestión de Disponibilidad</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configura los patrones semanales de disponibilidad para las canchas
        </p>
      </div>

      {/* Create Pattern Card */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-md">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-gray-950">
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Crear Patrón de Disponibilidad
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Selecciona canchas, horarios y días para crear disponibilidades en lote
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Selección de Canchas */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Canchas *
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {loading ? (
                <div className="col-span-full flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                canchas.map((cancha) => (
                  <div key={cancha.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cancha-${cancha.id}`}
                      checked={selectedCanchas.includes(cancha.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCanchas([...selectedCanchas, cancha.id])
                        } else {
                          setSelectedCanchas(selectedCanchas.filter(id => id !== cancha.id))
                        }
                      }}
                    />
                    <label
                      htmlFor={`cancha-${cancha.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {cancha.nombre}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selección de Horarios */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Horarios *
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {loading ? (
                <div className="col-span-full flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                horarios.map((horario) => (
                  <div key={horario.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`horario-${horario.id}`}
                      checked={selectedHorarios.includes(horario.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedHorarios([...selectedHorarios, horario.id])
                        } else {
                          setSelectedHorarios(selectedHorarios.filter(id => id !== horario.id))
                        }
                      }}
                    />
                    <label
                      htmlFor={`horario-${horario.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {horario.horaInicio} - {horario.horaFin}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selección de Días */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Días de la Semana *
            </Label>
            <div className="flex flex-wrap gap-3">
              {DIAS_SEMANA.map((dia) => (
                <div key={dia.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dia-${dia.value}`}
                    checked={selectedDias.includes(dia.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDias([...selectedDias, dia.value])
                      } else {
                        setSelectedDias(selectedDias.filter(d => d !== dia.value))
                      }
                    }}
                  />
                  <label
                    htmlFor={`dia-${dia.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {dia.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              onClick={handleSubmitPattern}
              disabled={submitting || loading}
              className="bg-primary hover:bg-primary/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Aplicar Patrón
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Pattern Card */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-md">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ver Disponibilidades por Cancha
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Selecciona una cancha para ver y gestionar sus horarios
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Selector de Cancha */}
          <div className="space-y-2">
            <Label htmlFor="view-cancha" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Cancha
            </Label>
            <Select value={selectedCancha} onValueChange={setSelectedCancha}>
              <SelectTrigger className="border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Seleccionar cancha..." />
              </SelectTrigger>
              <SelectContent>
                {canchas.map((cancha) => (
                  <SelectItem key={cancha.id} value={cancha.id}>
                    {cancha.nombre} - {cancha.club.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de Disponibilidades */}
          {selectedCancha && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900">
                  <TableRow>
                    <TableHead className="font-semibold">Día de la Semana</TableHead>
                    <TableHead className="font-semibold">Horario</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : disponibilidades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                          <p className="text-gray-500 dark:text-gray-400">
                            No hay disponibilidades configuradas para esta cancha
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    disponibilidades
                      .filter(disp => disp.horario) // Filtrar disponibilidades sin horario
                      .map((disp) => {
                        const dia = DIAS_SEMANA.find(d => d.value === disp.diaSemana)
                        
                        if (!disp.horario) {
                          return null
                        }
                        
                        return (
                          <TableRow key={disp.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <TableCell className="font-semibold text-gray-900 dark:text-white">
                              {dia?.label || `Día ${disp.diaSemana}`}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {disp.horario.horaInicio} - {disp.horario.horaFin}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  disp.disponible !== false
                                    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                                }
                              >
                                {disp.disponible !== false ? 'Disponible' : 'No disponible'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar este horario?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Se eliminará el slot de {dia?.label} de {disp.horario.horaInicio} a {disp.horario.horaFin}.
                                      Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSlot(disp.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        )
                      })
                      .filter(Boolean) // Remover nulls
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default withErrorBoundary(AdminDisponibilidadPage, 'Gestión de Disponibilidad')

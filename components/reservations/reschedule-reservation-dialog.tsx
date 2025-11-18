/**
 * Reschedule Reservation Dialog Component
 * Allows users to change the date/time or court availability of a pending reservation
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import apiClient, { Reserva, DisponibilidadHorario, EditReservaData } from '@/lib/api-client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface RescheduleReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reserva: Reserva
  onSuccess: (updatedReserva: Reserva) => void
}

export function RescheduleReservationDialog({
  open,
  onOpenChange,
  reserva,
  onSuccess,
}: RescheduleReservationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [loadingDisponibilidades, setLoadingDisponibilidades] = useState(false)
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadHorario[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    reserva.fechaHora ? new Date(reserva.fechaHora) : undefined
  )
  const [selectedDisponibilidadId, setSelectedDisponibilidadId] = useState<string>(
    reserva.disponibilidad.id
  )

  // Fetch available time slots for the current court
  useEffect(() => {
    if (!open || !reserva.disponibilidad.cancha.id) return

    const fetchDisponibilidades = async () => {
      setLoadingDisponibilidades(true)
      try {
        const response = await apiClient.getDisponibilidadesByCancha(
          reserva.disponibilidad.cancha.id
        )
        if (response.data) {
          setDisponibilidades(response.data)
        } else {
          toast.error('Error al cargar horarios disponibles')
        }
      } catch (error) {
        toast.error('Error de conexión')
      } finally {
        setLoadingDisponibilidades(false)
      }
    }

    fetchDisponibilidades()
  }, [open, reserva.disponibilidad.cancha.id])

  const handleReschedule = async () => {
    if (!selectedDate || !selectedDisponibilidadId) {
      toast.error('Por favor selecciona fecha y horario')
      return
    }

    // Find the selected disponibilidad to get the exact time
    const selectedDisp = disponibilidades.find(d => d.id === selectedDisponibilidadId)
    if (!selectedDisp) {
      toast.error('Horario no encontrado')
      return
    }

    // Check if day of week matches
    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    if (dayOfWeek !== selectedDisp.diaSemana) {
      toast.error('El día seleccionado no coincide con el horario disponible')
      return
    }

    // Build ISO datetime string with the correct timezone
    // Format: YYYY-MM-DDTHH:mm:ss-03:00 (Argentina timezone)
    const [hours, minutes] = selectedDisp.horario.horaInicio.split(':')
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const fechaHora = `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`

    setLoading(true)
    try {
      const data: EditReservaData = {
        disponibilidadId: selectedDisponibilidadId,
        fechaHora: fechaHora,
      }

      const response = await apiClient.editReserva(reserva.id, data)

      if (response.error) {
        toast.error(response.error)
      } else if (response.data) {
        toast.success('Reserva reprogramada exitosamente')
        onSuccess(response.data)
        onOpenChange(false)
      }
    } catch (error) {
      toast.error('Error al reprogramar la reserva')
    } finally {
      setLoading(false)
    }
  }

  // Filter disponibilidades for the selected date
  const getAvailableTimeSlotsForDate = () => {
    if (!selectedDate) return []

    const dayOfWeek = selectedDate.getDay()
    return disponibilidades.filter(d => d.diaSemana === dayOfWeek && d.disponible !== false)
  }

  const availableTimeSlots = getAvailableTimeSlotsForDate()

  // Helper to get day name in Spanish
  const getDayName = (dayNum: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return days[dayNum]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reprogramar Reserva</DialogTitle>
          <DialogDescription>
            Cambia la fecha y horario de tu reserva. Solo se muestran horarios disponibles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Reservation Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Reserva actual:</p>
            <div className="text-sm text-muted-foreground">
              <p><strong>Cancha:</strong> {reserva.disponibilidad.cancha.nombre}</p>
              <p>
                <strong>Fecha/Hora:</strong>{' '}
                {format(new Date(reserva.fechaHora), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Nueva Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'PPP', { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <Label>Horario Disponible</Label>
            {loadingDisponibilidades ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : availableTimeSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 border rounded-md">
                {selectedDate
                  ? `No hay horarios disponibles para ${getDayName(selectedDate.getDay())}`
                  : 'Selecciona una fecha para ver horarios disponibles'}
              </p>
            ) : (
              <Select
                value={selectedDisponibilidadId}
                onValueChange={setSelectedDisponibilidadId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un horario" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((disp) => (
                    <SelectItem key={disp.id} value={disp.id}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {disp.horario.horaInicio} - {disp.horario.horaFin}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleReschedule} disabled={loading || !selectedDate || !selectedDisponibilidadId}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reprogramando...
              </>
            ) : (
              'Confirmar Cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

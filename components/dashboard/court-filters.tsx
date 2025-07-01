"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const sports = [
  { id: "futbol5", label: "Fútbol 5" },
  { id: "padel", label: "Pádel" },
  { id: "basquet", label: "Básquet" },
  { id: "tenis", label: "Tenis" },
]

const timeSlots = [
  { value: "morning", label: "Mañana (8:00 - 12:00)" },
  { value: "afternoon", label: "Tarde (12:00 - 18:00)" },
  { value: "evening", label: "Noche (18:00 - 24:00)" },
]

export function CourtFilters() {
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>()

  const handleSportChange = (sportId: string, checked: boolean) => {
    if (checked) {
      setSelectedSports([...selectedSports, sportId])
    } else {
      setSelectedSports(selectedSports.filter((id) => id !== sportId))
    }
  }

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sports Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">Deporte</Label>
          <div className="space-y-3">
            {sports.map((sport) => (
              <div key={sport.id} className="flex items-center space-x-2">
                <Checkbox
                  id={sport.id}
                  checked={selectedSports.includes(sport.id)}
                  onCheckedChange={(checked) => handleSportChange(sport.id, checked as boolean)}
                />
                <Label htmlFor={sport.id} className="text-sm font-normal cursor-pointer">
                  {sport.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal min-touch-target bg-transparent"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Slot Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">Horario</Label>
          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger className="min-touch-target">
              <SelectValue placeholder="Seleccionar horario" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 space-y-2">
          <Button className="w-full min-touch-target">Aplicar filtros</Button>
          <Button
            variant="outline"
            className="w-full min-touch-target bg-transparent"
            onClick={() => {
              setSelectedSports([])
              setSelectedDate(undefined)
              setSelectedTimeSlot(undefined)
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

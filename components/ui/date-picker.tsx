"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate, isDateDisabled } from "@/lib/date-utils"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disablePastDates?: boolean
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  disablePastDates = false,
  minDate,
  maxDate,
  disabledDates = []
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate)
    setOpen(false)
  }

  const isDateDisabledFn = (date: Date) => {
    return isDateDisabled(date, {
      minDate,
      maxDate,
      disabledDates,
      disablePastDates
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal min-w-[200px]",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date, 'DISPLAY') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-w-none" align="start" side="bottom">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={isDateDisabledFn}
          initialFocus
          weekStartsOn={1}
          className="rounded-lg border-0 shadow-none min-w-[320px]"
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateRangePicker({
  from,
  to,
  onDateRangeChange,
  className,
  disabled = false,
  placeholder = "Seleccionar rango de fechas"
}: {
  from?: Date
  to?: Date
  onDateRangeChange?: (range: DateRange | undefined) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)

  const handleRangeSelect = (range: DateRange | undefined) => {
    onDateRangeChange?.(range)
    if (range?.from && range?.to) {
      setOpen(false)
    }
  }

  const displayText = React.useMemo(() => {
    if (from && to) {
      return `${formatDate(from, 'DISPLAY')} - ${formatDate(to, 'DISPLAY')}`
    }
    if (from) {
      return formatDate(from, 'DISPLAY')
    }
    return placeholder
  }, [from, to, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !from && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={handleRangeSelect}
          numberOfMonths={2}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  )
}
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
      <PopoverContent className="w-auto p-4 max-w-none" align="start" side="bottom">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={isDateDisabledFn}
          initialFocus
          weekStartsOn={1}
          className="rounded-lg border-0 shadow-none"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4 w-full min-w-[280px]",
            caption: "flex justify-center pt-1 relative items-center mb-4",
            caption_label: "text-base font-semibold",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 border border-border rounded-md hover:bg-accent",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md w-10 h-10 font-medium text-sm flex items-center justify-center",
            row: "flex w-full mt-1",
            cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
            day_today: "bg-accent text-accent-foreground font-semibold rounded-md",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
          }}
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
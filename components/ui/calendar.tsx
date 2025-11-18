"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

import "react-day-picker/style.css"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  styles,
  showOutsideDays = true,
  locale = es,
  ...props
}: CalendarProps) {
  const calendarStyle: React.CSSProperties = {
    "--rdp-accent-color": "#00D9FF",
    "--rdp-accent-background-color": "rgba(0, 217, 255, 0.15)",
    "--rdp-background-color": "transparent",
    "--rdp-day-height": "2.25rem",
    "--rdp-day-width": "2.25rem",
    "--rdp-day_button-height": "2.25rem",
    "--rdp-day_button-width": "100%",
    "--rdp-day_button-border-radius": "9999px",
    "--rdp-outline": "2px solid rgba(99, 102, 241, 0.4)",
    "--rdp-selected-border": "2px solid rgba(0, 217, 255, 0.95)",
    "--rdp-disabled-opacity": "0.35",
    "--rdp-outside-opacity": "0.45",
    "--rdp-today-color": "#6366F1",
    "--rdp-weekday-opacity": "0.9",
    "--rdp-weekday-padding": "0.35rem 0",
    "--rdp-weekday-text-align": "center",
    "--rdp-weekday-text-transform": "capitalize",
  } as React.CSSProperties

  const baseClassNames: Partial<CalendarProps["classNames"]> = {
    root: "space-y-3 text-sm text-foreground dark:text-gray-100",
    months: "flex flex-col sm:flex-row sm:gap-6 gap-4",
    month: "space-y-4",
    month_caption: "flex items-center justify-center gap-2 pt-2 pb-1 relative",
    caption_label: "text-base font-semibold dark:text-gray-50",
    nav: "flex items-center gap-2",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "h-8 w-8 p-0 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-100 hover:bg-accent"
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "h-8 w-8 p-0 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-100 hover:bg-accent"
    ),
    month_grid: "w-full border-collapse table-fixed",
    weekdays: "text-muted-foreground dark:text-gray-400",
    weekday:
      "text-[0.75rem] font-semibold tracking-wide text-center uppercase dark:text-gray-300",
    weeks: "w-full",
    day: "p-0 text-center align-middle",
    day_button: cn(
      buttonVariants({ variant: "ghost" }),
      "h-9 w-full rounded-md p-0 font-medium transition-all duration-200 hover:bg-accent/50 dark:text-gray-200 dark:hover:text-gray-50"
    ),
    today: "text-secondary-foreground dark:text-cyan-300 font-bold",
    outside: "text-muted-foreground/70 dark:text-gray-600",
    disabled: "text-muted-foreground/40 dark:text-gray-700 cursor-not-allowed",
    hidden: "invisible",
    range_start: "rounded-l-md",
    range_middle: "bg-cyan-400/20 dark:bg-cyan-500/25 text-foreground dark:text-gray-100",
    range_end: "rounded-r-md",
    selected: "!bg-cyan-500 dark:!bg-cyan-600 !text-white !shadow-[0_0_15px_rgba(0,217,255,0.5)] dark:!shadow-[0_0_20px_rgba(0,217,255,0.7)] !ring-2 !ring-cyan-400 dark:!ring-cyan-300 scale-105 !opacity-100 rounded-full",
  }

  const mergedClassNames = {
    ...baseClassNames,
    ...classNames,
  }

  const mergedStyles = {
    ...styles,
    root: {
      ...calendarStyle,
      ...(styles?.root ? (styles.root as React.CSSProperties) : {}),
    },
  }

  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={mergedClassNames}
      styles={mergedStyles}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

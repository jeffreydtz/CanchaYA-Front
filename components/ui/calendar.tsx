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
    "--rdp-accent-background-color": "rgba(0, 217, 255, 0.12)",
    "--rdp-background-color": "transparent",
    "--rdp-day-height": "2.25rem",
    "--rdp-day-width": "2.25rem",
    "--rdp-day_button-height": "2.25rem",
    "--rdp-day_button-width": "100%",
    "--rdp-day_button-border-radius": "0.75rem",
    "--rdp-outline": "2px solid rgba(99, 102, 241, 0.35)",
    "--rdp-selected-border": "2px solid rgba(0, 217, 255, 0.85)",
    "--rdp-disabled-opacity": "0.35",
    "--rdp-outside-opacity": "0.45",
    "--rdp-today-color": "#6366F1",
    "--rdp-weekday-opacity": "0.9",
    "--rdp-weekday-padding": "0.35rem 0",
    "--rdp-weekday-text-align": "center",
    "--rdp-weekday-text-transform": "capitalize",
  } as React.CSSProperties

  const baseClassNames: Partial<CalendarProps["classNames"]> = {
    root: "space-y-3 text-sm text-foreground",
    months: "flex flex-col sm:flex-row sm:gap-6 gap-4",
    month: "space-y-4",
    month_caption: "flex items-center justify-center gap-2 pt-2 pb-1 relative",
    caption_label: "text-base font-semibold",
    nav: "flex items-center gap-2",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
    ),
    month_grid: "w-full border-collapse table-fixed",
    weekdays: "text-muted-foreground",
    weekday:
      "text-[0.75rem] font-semibold tracking-wide text-center uppercase",
    weeks: "w-full",
    day: "p-0 text-center align-middle",
    day_button: cn(
      buttonVariants({ variant: "ghost" }),
      "h-9 w-full rounded-md p-0 font-medium transition-all duration-200 hover:bg-accent/50 aria-selected:opacity-100 aria-selected:bg-cyan-500 dark:aria-selected:bg-cyan-600 aria-selected:text-white dark:aria-selected:text-white aria-selected:shadow-[0_0_15px_rgba(0,217,255,0.4)] aria-selected:ring-2 aria-selected:ring-cyan-400 dark:aria-selected:ring-cyan-500 aria-selected:scale-105"
    ),
    today: "text-secondary-foreground font-bold",
    outside: "text-muted-foreground/70",
    disabled: "text-muted-foreground/40 cursor-not-allowed",
    hidden: "invisible",
    range_start: "rounded-l-md",
    range_middle: "bg-cyan-400/20 text-foreground",
    range_end: "rounded-r-md",
    selected: "text-white",
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

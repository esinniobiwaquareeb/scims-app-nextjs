"use client"

import * as React from "react"
import { addDays, format, isSameDay, startOfDay, endOfDay } from "date-fns"
import { Calendar as CalendarIcon, X, CalendarDays } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "./utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Badge } from "./badge"

interface DatePickerWithRangeProps {
  className?: string
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  placeholder?: string
  showPresets?: boolean
}

const PRESET_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7' },
  { label: 'Last 30 days', value: 'last30' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'Last month', value: 'lastMonth' },
  { label: 'This year', value: 'thisYear' },
]

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
  placeholder = "Select date range",
  showPresets = true
}: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetSelect = (preset: string) => {
    const now = new Date()
    let newDateRange: DateRange | undefined

    switch (preset) {
      case 'today':
        newDateRange = {
          from: startOfDay(now),
          to: endOfDay(now)
        }
        break
      case 'yesterday':
        const yesterday = addDays(now, -1)
        newDateRange = {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday)
        }
        break
      case 'last7':
        newDateRange = {
          from: startOfDay(addDays(now, -7)),
          to: endOfDay(now)
        }
        break
      case 'last30':
        newDateRange = {
          from: startOfDay(addDays(now, -30)),
          to: endOfDay(now)
        }
        break
      case 'thisMonth':
        newDateRange = {
          from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
          to: endOfDay(now)
        }
        break
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        newDateRange = {
          from: startOfDay(lastMonth),
          to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0))
        }
        break
      case 'thisYear':
        newDateRange = {
          from: startOfDay(new Date(now.getFullYear(), 0, 1)),
          to: endOfDay(now)
        }
        break
    }

    if (newDateRange) {
      onDateChange(newDateRange)
      setIsOpen(false)
    }
  }

  const clearSelection = () => {
    onDateChange(undefined)
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder
    
    if (!range.to) {
      return format(range.from, "MMM dd, yyyy")
    }
    
    if (isSameDay(range.from, range.to)) {
      return format(range.from, "MMM dd, yyyy")
    }
    
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 justify-start text-left font-normal relative group",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{formatDateRange(date)}</span>
            
            {date && (
              <div
                className="ml-auto h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer hover:bg-muted rounded-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  clearSelection()
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    clearSelection()
                  }
                }}
              >
                <X className="h-3 w-3" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Quick Select</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_RANGES.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs justify-start"
                  onClick={() => handlePresetSelect(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            className="p-3"
          />
          
          {date && (
            <div className="p-3 border-t bg-muted/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Selected:</span>
                <Badge variant="secondary" className="font-mono">
                  {date.from && format(date.from, "MMM dd, yyyy")}
                  {date.to && date.to !== date.from && ` → ${format(date.to, "MMM dd, yyyy")}`}
                </Badge>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
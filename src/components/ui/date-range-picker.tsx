import * as React from "react"
import { cn } from "./utils"
import { Input } from "./input"
import { Calendar } from "lucide-react"

export interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date?: { from?: Date; to?: Date }
  onDateChange?: (date: { from?: Date; to?: Date }) => void
  placeholder?: string
}

const DatePickerWithRange = React.forwardRef<
  HTMLDivElement,
  DatePickerWithRangeProps
>(({ className, date, onDateChange, ...props }, ref) => {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(date?.from)
  const [toDate, setToDate] = React.useState<Date | undefined>(date?.to)

  React.useEffect(() => {
    if (date?.from) setFromDate(date.from)
    if (date?.to) setToDate(date.to)
  }, [date])

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined
    setFromDate(newDate)
    if (newDate && toDate && onDateChange) {
      onDateChange({ from: newDate, to: toDate })
    } else if (newDate && !toDate && onDateChange) {
      onDateChange({ from: newDate, to: undefined })
    }
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value + 'T23:59:59') : undefined
    setToDate(newDate)
    if (fromDate && newDate && onDateChange) {
      onDateChange({ from: fromDate, to: newDate })
    } else if (fromDate && !newDate && onDateChange) {
      onDateChange({ from: fromDate, to: undefined })
    }
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="date"
          value={formatDateForInput(fromDate)}
          onChange={handleFromChange}
          className="pl-10"
          placeholder="From"
        />
      </div>
      <span className="text-muted-foreground text-sm shrink-0">to</span>
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="date"
          value={formatDateForInput(toDate)}
          onChange={handleToChange}
          className="pl-10"
          placeholder="To"
        />
      </div>
    </div>
  )
})
DatePickerWithRange.displayName = "DatePickerWithRange"

export { DatePickerWithRange }

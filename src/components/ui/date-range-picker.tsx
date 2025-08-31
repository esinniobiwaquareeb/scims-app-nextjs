import * as React from "react"
import { cn } from "./utils"

export interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date?: { from: Date; to: Date }
  onDateChange?: (date: { from: Date; to: Date }) => void
  placeholder?: string
}

const DatePickerWithRange = React.forwardRef<
  HTMLDivElement,
  DatePickerWithRangeProps
>(({ className, date, onDateChange, placeholder, ...props }, ref) => {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(date?.from)
  const [toDate, setToDate] = React.useState<Date | undefined>(date?.to)

  React.useEffect(() => {
    if (date?.from) setFromDate(date.from)
    if (date?.to) setToDate(date.to)
  }, [date])

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined
    setFromDate(date)
    if (date && toDate && onDateChange) {
      onDateChange({ from: date, to: toDate })
    }
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined
    setToDate(date)
    if (fromDate && date && onDateChange) {
      onDateChange({ from: fromDate, to: date })
    }
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center space-x-2", className)}
      {...props}
    >
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">From</label>
        <input
          type="date"
          value={fromDate?.toISOString().split('T')[0] || ''}
          onChange={handleFromChange}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">To</label>
        <input
          type="date"
          value={toDate?.toISOString().split('T')[0] || ''}
          onChange={handleToChange}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    </div>
  )
})
DatePickerWithRange.displayName = "DatePickerWithRange"

export { DatePickerWithRange }

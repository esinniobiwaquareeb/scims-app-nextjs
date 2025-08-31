"use client";

import * as React from "react"
import { cn } from "./utils"

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextType>({
  open: false,
  onOpenChange: () => {},
})

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'onChange'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, value, defaultValue, onValueChange, disabled, children, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)
    const internalRef = React.useRef<HTMLDivElement>(null)
    const containerRef = (ref || internalRef) as React.RefObject<HTMLDivElement>

    const isControlled = value !== undefined
    const currentValue = isControlled ? value : uncontrolledValue

    const handleValueChange = React.useCallback((newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue)
      }
      onValueChange?.(newValue)
      setOpen(false)
    }, [isControlled, onValueChange])

    React.useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false)
        }
      }

      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('keydown', handleEscape)

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick)
        document.removeEventListener('keydown', handleEscape)
      }
    }, [containerRef])

    return (
      <SelectContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          open,
          onOpenChange: setOpen,
          disabled,
        }}
      >
        <div
          ref={containerRef}
          className={cn("relative inline-block w-full", className)}
          {...props}
        >
          {children}
        </div>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    placeholder?: string
  }
>(({ className, children, placeholder, ...props }, ref) => {
  const { open, onOpenChange, value, disabled } = React.useContext(SelectContext)

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => !disabled && onOpenChange(!open)}
      disabled={disabled}
      aria-expanded={open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2",
        "text-sm ring-offset-background",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="flex-1 text-left truncate">
        {value ? children : placeholder}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "h-4 w-4 opacity-50 transition-transform duration-200",
          open ? "rotate-180" : "rotate-0"
        )}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  )
})

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = React.useContext(SelectContext)

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
})
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, children, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      {children}
    </div>
  )
})

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("h-px -mx-1 my-1 bg-border", className)}
      {...props}
    />
  )
})

const SelectGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="group"
      className={cn("p-1 w-full", className)}
      {...props}
    >
      {children}
    </div>
  )
})

export interface SelectOptionProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const { value } = React.useContext(SelectContext)
  return (
    <span
      ref={ref}
      className={cn("block truncate", className)}
      {...props}
    >
      {value ? children : null}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

SelectTrigger.displayName = "SelectTrigger"
SelectItem.displayName = "SelectItem"
SelectSeparator.displayName = "SelectSeparator"
SelectGroup.displayName = "SelectGroup"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

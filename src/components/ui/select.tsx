"use client";

import * as React from "react"
import { cn } from "./utils"

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
  selectedText?: string
  setSelectedText?: (text: string) => void
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
    const [selectedText, setSelectedText] = React.useState<string>('')
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

    // Set initial selected text based on default value
    React.useEffect(() => {
      if (defaultValue && !selectedText) {
        // This will be handled by the SelectItem components
        setSelectedText(defaultValue)
      }
    }, [defaultValue, selectedText])

    return (
      <SelectContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          open,
          onOpenChange: setOpen,
          disabled,
          selectedText,
          setSelectedText,
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
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2",
        "text-sm",
        "placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "hover:border-gray-400 hover:bg-gray-50",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "transition-colors duration-200",
        className
      )}
      {...props}
    >
      <span className="flex-1 text-left truncate">
        {children}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "h-4 w-4 text-gray-500 transition-transform duration-200 flex-shrink-0",
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
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-900 shadow-lg",
        "top-full mt-1 left-0 right-0",
        "max-h-[200px] overflow-y-auto",
        "animate-in fade-in-0 zoom-in-95 duration-200",
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
  const { value: selectedValue, onValueChange, setSelectedText } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  // Set selected text when this item is selected
  React.useEffect(() => {
    if (isSelected && setSelectedText) {
      setSelectedText(children as string)
    }
  }, [isSelected, children, setSelectedText])

  const handleClick = () => {
    onValueChange?.(value)
    setSelectedText?.(children as string)
  }

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "hover:bg-gray-100 focus:bg-gray-100",
        "transition-colors duration-150",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected ? "bg-blue-50 text-blue-900 border-l-2 border-blue-500 font-medium" : "text-gray-900",
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
            className="h-4 w-4 text-blue-600"
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
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string;
  }
>(({ className, children, placeholder, ...props }, ref) => {
  const { value, selectedText } = React.useContext(SelectContext)
  const hasValue = value && value !== ""
  
  // Use selectedText if available, otherwise fall back to children or value
  const displayText = hasValue ? (selectedText || children || value) : placeholder
  
  return (
    <span
      ref={ref}
      className={cn("block truncate", hasValue ? "text-gray-900 font-medium" : "text-gray-500", className)}
      {...props}
    >
      {displayText}
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

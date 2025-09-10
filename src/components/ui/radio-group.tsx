/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { cn } from "./utils"

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  disabled?: boolean
  children: React.ReactNode
}

interface RadioGroupItemProps {
  value: string
  id?: string
  className?: string
  disabled?: boolean
  checked?: boolean
  onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, disabled, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<RadioGroupItemProps>(child)) {
            return React.cloneElement(child, {
              ...child.props,
              checked: child.props.value === value,
              onValueChange,
              disabled: disabled || child.props.disabled,
            })
          }
          return child
        })}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, disabled, ...props }, ref) => {
    const { checked, onValueChange } = props as any

    return (
      <input
        ref={ref}
        type="radio"
        id={id}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.checked && onValueChange) {
            onValueChange(value)
          }
        }}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

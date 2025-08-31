"use client";

import * as React from "react"
import { cn } from "./utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, onCheckedChange, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(event.target.checked);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer sr-only",
          className
        )}
        onChange={handleChange}
        {...props}
      />
      <div className={cn(
        "relative h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-600",
        "bg-white dark:bg-gray-800",
        "transition-all duration-200 ease-in-out",
        "peer-checked:bg-[#A969A7] peer-checked:border-[#A969A7]",
        "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#A969A7]/20 peer-focus:ring-offset-2",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "peer-disabled:pointer-events-none"
      )}>
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "opacity-0 peer-checked:opacity-100",
          "transition-opacity duration-200"
        )}>
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </div>
      </div>
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox } 

"use client";

import * as React from "react"
import { cn } from "./utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
  variant?: 'default' | 'success' | 'warning' | 'error';
  checked?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, variant = 'default', checked = false, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    const getVariantColors = () => {
      switch (variant) {
        case 'success':
          return checked ? 'bg-green-500 border-green-500' : 'bg-gray-200 dark:bg-gray-700';
        case 'warning':
          return checked ? 'bg-yellow-500 border-yellow-500' : 'bg-gray-200 dark:bg-gray-700';
        case 'error':
          return checked ? 'bg-red-500 border-red-500' : 'bg-gray-200 dark:bg-gray-700';
        default:
          return checked ? 'bg-[#A969A7] border-[#A969A7]' : 'bg-gray-200 dark:bg-gray-700';
      }
    };

    const getFocusRingColor = () => {
      switch (variant) {
        case 'success':
          return 'focus:ring-green-500/20';
        case 'warning':
          return 'focus:ring-yellow-500/20';
        case 'error':
          return 'focus:ring-red-500/20';
        default:
          return 'focus:ring-[#A969A7]/20';
      }
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          className={cn(
            "peer sr-only",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        <div className={cn(
          "relative h-6 w-11 cursor-pointer rounded-full border-2 border-transparent",
          "transition-all duration-200 ease-in-out",
          getVariantColors(),
          "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2",
          getFocusRingColor(),
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          "peer-disabled:pointer-events-none"
        )}>
          <div className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full",
            "bg-white dark:bg-gray-300",
            "shadow-sm transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0",
            "peer-checked:bg-white"
          )} />
        </div>
      </div>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }

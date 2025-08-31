"use client";

import * as React from "react"
import { cn } from "./utils"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-gray-900 dark:text-gray-100",
      "select-none cursor-pointer",
      "transition-colors duration-200",
      "hover:text-gray-700 dark:hover:text-gray-200",
      "focus-within:text-brand-primary dark:focus-within:text-brand-primary",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      "peer-disabled:pointer-events-none",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }

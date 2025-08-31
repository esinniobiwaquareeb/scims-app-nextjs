"use client";

import * as React from "react"
import { cn } from "./utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border-2 border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
        "px-3 py-2 text-sm leading-relaxed",
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "focus:outline-none focus:border-[#A969A7] focus:ring-2 focus:ring-[#A969A7]/20",
        "transition-all duration-200 ease-in-out",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900",
        "resize-vertical",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

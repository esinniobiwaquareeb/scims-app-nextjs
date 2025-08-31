"use client";

import * as React from "react"
import { cn } from "./utils"

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'vertical' | 'horizontal' | 'both';
  }
>(({ className, children, orientation = 'vertical', ...props }, ref) => {
  const getOrientationClasses = () => {
    switch (orientation) {
      case 'horizontal':
        return 'overflow-x-auto overflow-y-hidden';
      case 'both':
        return 'overflow-auto';
      default:
        return 'overflow-y-auto overflow-x-hidden';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative",
        getOrientationClasses(),
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
        "hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500",
        "transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }

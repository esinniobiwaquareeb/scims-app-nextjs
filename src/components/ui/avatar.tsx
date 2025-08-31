"use client";

import * as React from "react"
import { cn } from "./utils"

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      "border-2 border-gray-200 dark:border-gray-700",
      "shadow-sm hover:shadow-md transition-shadow duration-200",
      "bg-white dark:bg-gray-800",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, alt = "", ...props }, ref) => (
  <img
    ref={ref}
    src={src}
    alt={alt}
    className={cn(
      "aspect-square h-full w-full object-cover",
      "transition-transform duration-200 hover:scale-105",
      className
    )}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full",
      "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800",
      "text-gray-600 dark:text-gray-300 font-medium text-sm",
      "border border-gray-200 dark:border-gray-600",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }

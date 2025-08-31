import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
    "gap-x-2"
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-blue-600 text-white",
          "hover:bg-blue-700",
          "focus-visible:ring-blue-600",
          "dark:bg-blue-500 dark:hover:bg-blue-600"
        ].join(" "),
        destructive: [
          "bg-red-600 text-white",
          "hover:bg-red-700",
          "focus-visible:ring-red-600",
          "dark:bg-red-500 dark:hover:bg-red-600"
        ].join(" "),
        success: [
          "bg-green-600 text-white",
          "hover:bg-green-700",
          "focus-visible:ring-green-600",
          "dark:bg-green-500 dark:hover:bg-green-600"
        ].join(" "),
        outline: [
          "border-2 border-gray-200 bg-transparent text-gray-900",
          "hover:bg-gray-100 hover:text-gray-900",
          "focus-visible:ring-gray-300",
          "dark:border-gray-700 dark:text-gray-100",
          "dark:hover:bg-gray-800 dark:hover:text-gray-100"
        ].join(" "),
        secondary: [
          "bg-gray-100 text-gray-900",
          "hover:bg-gray-200",
          "focus-visible:ring-gray-300",
          "dark:bg-gray-800 dark:text-gray-100",
          "dark:hover:bg-gray-700"
        ].join(" "),
        ghost: [
          "text-gray-900",
          "hover:bg-gray-100 hover:text-gray-900",
          "focus-visible:ring-gray-300",
          "dark:text-gray-100",
          "dark:hover:bg-gray-800 dark:hover:text-gray-100"
        ].join(" "),
        link: [
          "text-blue-600 underline-offset-4",
          "hover:text-blue-700 hover:underline",
          "dark:text-blue-500 dark:hover:text-blue-400"
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 rounded px-2 text-xs",
        sm: "h-9 rounded px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-9 w-9 p-0",
        "icon-xs": "h-7 w-7 p-0",
      },
      isLoading: {
        true: "relative text-transparent transition-none hover:text-transparent disabled:cursor-wait",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      isLoading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, isLoading, className }))}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className="absolute h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

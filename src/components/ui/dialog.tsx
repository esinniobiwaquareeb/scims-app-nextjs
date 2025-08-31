"use client";

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "./utils"

interface DialogContextType {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType>({})

export interface DialogProps
  extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, open = false, onOpenChange, children, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false)
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      setMounted(true)
      return () => setMounted(false)
    }, [])

    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
        contentRef.current?.focus()
      } else {
        document.body.style.overflow = ''
      }
      return () => {
        document.body.style.overflow = ''
      }
    }, [open])

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onOpenChange?.(false)
        }
      }
      if (open) {
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
      }
    }, [open, onOpenChange])

    const handleOutsideClick = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          onOpenChange?.(false)
        }
      },
      [onOpenChange]
    )

    // Only render dialog content when mounted on client-side
    return (
      <DialogContext.Provider value={{ open, onOpenChange }}>
        {mounted && open ? createPortal(
          <div
            ref={ref}
            className={cn(
              "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
              "animate-in fade-in-0 data-[state=open]:duration-300",
              className
            )}
            aria-hidden={!open}
            data-state={open ? "open" : "closed"}
            onClick={handleOutsideClick}
            {...props}
          >
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                ref={contentRef}
                tabIndex={-1}
                className={cn(
                  "relative w-full max-h-[90vh] overflow-y-auto",
                  "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
                  "duration-200"
                )}
              >
                {children}
              </div>
            </div>
          </div>,
          document.body
        ) : null}
      </DialogContext.Provider>
    )
  }
)
Dialog.displayName = "Dialog"

interface DialogTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<
  HTMLElement,
  DialogTriggerProps
>(({ className, children, asChild = false, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext)

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    onOpenChange?.(true)
    if (props.onClick) {
      props.onClick(e)
    }
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement(child, {
      ...props,
      onClick: handleClick,
      className: cn(child.props?.className, className),
    });
  }

  return (
    <div
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    showCloseButton?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  }
>(({ className, children, showCloseButton = true, size = 'md', ...props }, ref) => {
  const dialogContext = React.useContext(DialogContext)
  const { open } = dialogContext
  
  // Only render content when dialog is open
  if (!open) return null

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case 'full':
        return 'max-w-[95vw]';
      default:
        return 'max-w-md';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full mx-auto",
        "bg-white dark:bg-gray-800",
        "border border-gray-200 dark:border-gray-700",
        "shadow-2xl",
        "rounded-xl",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        "duration-200",
        getSizeClasses(),
        className
      )}
      role="dialog"
      aria-modal="true"
      {...props}
    >
      {showCloseButton && (
        <button
          onClick={() => dialogContext.onOpenChange?.(false)}
          className={cn(
            "absolute right-4 top-4 z-10 rounded-full p-1.5",
            "bg-gray-100 dark:bg-gray-700",
            "opacity-70 ring-offset-background",
            "transition-all duration-200 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2",
            "disabled:pointer-events-none",
            "text-gray-500 dark:text-gray-400"
          )}
        >
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
            className="h-4 w-4"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span className="sr-only">Close</span>
        </button>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
      className
    )}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 mt-6",
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      "text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-gray-500 dark:text-gray-400",
      "leading-relaxed",
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}

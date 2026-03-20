/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[11px] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-sand",
  {
    variants: {
      variant: {
        default:
          "bg-[#0f172a] text-white hover:bg-[var(--accent-color)] hover:shadow-[0_14px_30px_var(--accent-glow)]",
        outline:
          "border border-[#cbd5e1] bg-white text-ink hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]",
        ghost: "text-ink hover:bg-fog",
        muted:
          "bg-[var(--accent-soft)] text-[var(--accent-color)] hover:bg-[var(--accent-soft-strong)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[10px] px-3",
        lg: "h-11 rounded-[11px] px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
      variant === "default" && "bg-[#dbeafe] text-[#1d4ed8]",
      variant === "outline" && "border border-[#bfdbfe] bg-white text-[#475569]",
      variant === "success" && "bg-[#dbeafe] text-[#1d4ed8]",
      className
    )}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge }

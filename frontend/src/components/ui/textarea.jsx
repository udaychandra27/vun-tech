import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[140px] w-full rounded-[12px] border border-[#cbd5e1] bg-white px-4 py-3 text-[14px] text-[#0f172a] placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-sand",
      className
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export { Textarea }

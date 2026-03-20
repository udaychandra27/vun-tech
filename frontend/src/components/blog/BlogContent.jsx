import { cn } from "@/lib/utils"

export function BlogContent({ html, className = "" }) {
  return (
    <div
      className={cn(
        "blog-content prose prose-slate max-w-none prose-lg prose-headings:font-display prose-headings:text-ink prose-p:text-slate prose-a:text-moss prose-strong:text-ink prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-pre:overflow-x-auto prose-pre:rounded-2xl prose-pre:bg-[#09111e] prose-pre:text-sand prose-blockquote:border-l-4 prose-blockquote:border-moss prose-blockquote:bg-moss/5 prose-blockquote:px-6 prose-blockquote:py-3 prose-li:text-slate",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

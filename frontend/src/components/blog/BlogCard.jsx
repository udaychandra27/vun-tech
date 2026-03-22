import { Link } from "react-router-dom"
import { CalendarDays, Clock3, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { OptimizedImage } from "@/components/OptimizedImage"
import { formatBlogDate, resolveMediaUrl } from "@/lib/blog"

export function BlogCard({ post }) {
  return (
    <Card className="group overflow-hidden rounded-[18px] border-fog bg-white shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1">
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        {post.featuredImage ? (
          <OptimizedImage
            src={resolveMediaUrl(post.featuredImage)}
            alt={post.title}
            width={960}
            height={600}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#2563eb] text-sm text-white/85">
            No featured image
          </div>
        )}
      </div>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatBlogDate(post.publishedAt || post.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {post.readTime || 1} min read
          </span>
          <span>{post.author}</span>
        </div>

        <div>
          <Link to={`/blog/${post.slug}`} className="block">
            <h2 className="text-[28px] font-semibold text-ink transition-colors group-hover:text-moss">
              {post.title}
            </h2>
          </Link>
          <p className="mt-3 text-[14px] leading-7 text-slate">{post.excerpt}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.category ? (
            <Badge variant="secondary" className="bg-[#dbeafe] text-[#1d4ed8]">
              {post.category}
            </Badge>
          ) : null}
          {(post.tags || []).slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="inline-flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>

        <Button
          asChild
          className="h-auto w-full justify-start whitespace-normal py-3 text-left leading-6"
        >
          <Link to={`/blog/${post.slug}`}>Read article: {post.title}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

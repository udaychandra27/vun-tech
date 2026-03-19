import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { CalendarDays, Clock3, Copy, Facebook, Linkedin, Share2 } from "lucide-react"
import { Container } from "@/components/layout/Container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlogCard } from "@/components/blog/BlogCard"
import { BlogContent } from "@/components/blog/BlogContent"
import { OptimizedImage } from "@/components/OptimizedImage"
import { Seo } from "@/components/seo/Seo"
import { apiFetch } from "@/lib/api"
import {
  decorateBlogHtml,
  formatBlogDate,
  getShareLinks,
  resolveMediaUrl,
} from "@/lib/blog"

function ShareButton({ href, label, icon, onClick }) {
  if (onClick) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={onClick}>
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
      </Button>
    )
  }

  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
        {icon}
        {label}
      </a>
    </Button>
  )
}

export function BlogDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    apiFetch(`/api/blog/${slug}`)
      .then((data) => setPost(data))
      .finally(() => setLoading(false))
  }, [slug])

  const decorated = useMemo(() => decorateBlogHtml(post?.content || ""), [post?.content])
  const shareLinks = useMemo(() => getShareLinks(post?.slug || slug), [post?.slug, slug])

  if (loading) {
    return (
      <Container className="py-16">
        <div className="h-[520px] animate-pulse rounded-[2rem] border border-fog bg-white" />
      </Container>
    )
  }

  if (!post) {
    return (
      <Container className="py-16">
        <div className="rounded-[2rem] border border-dashed border-fog bg-white p-10">
          <h1 className="text-3xl font-semibold">Post not found</h1>
          <p className="mt-3 text-slate">The article may have moved or is no longer published.</p>
          <Button asChild className="mt-6">
            <Link to="/blog">Back to blog</Link>
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <div className="bg-sand">
      <Seo
        title={`${post.meta?.title || post.title} | VUN Tech`}
        description={post.meta?.description || post.excerpt}
        image={resolveMediaUrl(post.meta?.ogImage || post.featuredImage)}
        type="article"
        structuredData={post.structuredData}
      />

      <section className="border-b border-fog bg-white">
        <Container className="grid gap-10 py-14 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {post.category ? <Badge>{post.category}</Badge> : null}
              {(post.tags || []).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate">
              <span>{post.author}</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {formatBlogDate(post.publishedAt || post.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4" />
                {post.readTime} min read
              </span>
            </div>
            <p className="max-w-3xl text-lg text-slate">{post.excerpt}</p>
          </div>

          <aside className="space-y-5 rounded-[2rem] border border-fog bg-sand p-5">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60">
                In this article
              </div>
              <div className="mt-4 space-y-3">
                {(decorated.headings || []).map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block text-sm text-slate transition hover:text-moss ${
                      heading.level >= 3 ? "pl-4" : ""
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </div>
            </div>

            <div className="border-t border-fog pt-5">
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink/60">
                Share
              </div>
              <div className="flex flex-wrap gap-2">
                <ShareButton href={shareLinks.x} label="X" icon={<Share2 className="h-4 w-4" />} />
                <ShareButton
                  href={shareLinks.linkedin}
                  label="LinkedIn"
                  icon={<Linkedin className="h-4 w-4" />}
                />
                <ShareButton
                  href={shareLinks.facebook}
                  label="Facebook"
                  icon={<Facebook className="h-4 w-4" />}
                />
                <ShareButton
                  label={copied ? "Copied" : "Copy link"}
                  icon={<Copy className="h-4 w-4" />}
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareLinks.copy)
                    setCopied(true)
                    window.setTimeout(() => setCopied(false), 1600)
                  }}
                />
              </div>
            </div>
          </aside>
        </Container>
      </section>

      {post.featuredImage ? (
        <section className="border-b border-fog bg-sand">
          <Container className="py-8">
            <div className="overflow-hidden rounded-[2rem] border border-fog bg-white">
              <OptimizedImage
                src={resolveMediaUrl(post.featuredImage)}
                alt={post.title}
                width={1600}
                height={900}
                priority
                className="h-full w-full object-cover"
              />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-sand">
        <Container className="py-10">
          <BlogContent html={decorated.html || ""} />
        </Container>
      </section>

      {post.relatedPosts?.length ? (
        <section className="border-t border-fog bg-white">
          <Container className="py-14">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold">Related posts</h2>
                <p className="text-slate">Keep exploring adjacent ideas and implementation notes.</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/blog">View all posts</Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {post.relatedPosts.map((item) => (
                <BlogCard key={item._id} post={item} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Container } from "@/components/layout/Container"
import { BlogCard } from "@/components/blog/BlogCard"
import { Seo } from "@/components/seo/Seo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/lib/api"

export function BlogList() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ tags: [], categories: [] })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [activeTag, setActiveTag] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const [loading, setLoading] = useState(true)

  const loadPosts = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "6",
      })
      if (appliedSearch) params.set("search", appliedSearch)
      if (activeTag) params.set("tag", activeTag)
      if (activeCategory) params.set("category", activeCategory)

      const data = await apiFetch(`/api/blog?${params.toString()}`)
      setItems(data.items || [])
      setFilters(data.filters || { tags: [], categories: [] })
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } finally {
      setLoading(false)
    }
  }, [activeCategory, activeTag, appliedSearch])

  useEffect(() => {
    loadPosts(1)
  }, [loadPosts])

  const emptyState = useMemo(() => !loading && items.length === 0, [items.length, loading])

  return (
    <div className="bg-sand">
      <Seo
        title="Blog | VUN Tech"
        description="Insights on product engineering, security, automation, and digital delivery."
        type="website"
      />

      <section className="border-b border-fog bg-white">
        <Container className="py-16">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex rounded-full border border-fog bg-sand px-4 py-1 text-xs uppercase tracking-[0.22em] text-ink/70">
              Insights & field notes
            </div>
            <h1 className="text-4xl font-semibold md:text-5xl">
              Practical writing for teams shipping real software.
            </h1>
            <p className="text-lg text-slate">
              Ideas, case studies, and implementation notes across engineering, AI,
              cybersecurity, and growth systems.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-fog bg-sand">
        <Container className="py-8">
          <div className="grid gap-4 rounded-[2rem] border border-fog bg-white p-5 shadow-sm md:grid-cols-[1.3fr_0.7fr]">
            <form
              className="relative"
              onSubmit={(event) => {
                event.preventDefault()
                setAppliedSearch(search.trim())
              }}
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 rounded-2xl pl-11"
                placeholder="Search posts, authors, or tags"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <select
                className="h-12 rounded-2xl border border-fog bg-sand px-4 text-sm"
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {filters.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={() => loadPosts(1)}>
                Refresh
              </Button>
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  role="button"
                  className={activeTag ? "cursor-pointer" : "cursor-pointer bg-ink text-sand"}
                  onClick={() => setActiveTag("")}
                >
                  All tags
                </Badge>
                {filters.tags.map((tag) => (
                  <Badge
                    key={tag}
                    role="button"
                    variant={activeTag === tag ? "default" : "outline"}
                    className={activeTag === tag ? "cursor-pointer bg-ink text-sand" : "cursor-pointer"}
                    onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-sand">
        <Container className="py-10">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[420px] animate-pulse rounded-[2rem] border border-fog bg-white" />
              ))}
            </div>
          ) : null}

          {emptyState ? (
            <div className="rounded-[2rem] border border-dashed border-fog bg-white p-10 text-center">
              <h2 className="text-2xl font-semibold text-ink">No posts matched that filter.</h2>
              <p className="mt-2 text-slate">Try a different tag, category, or search query.</p>
            </div>
          ) : null}

          {!loading && items.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-sm text-slate">{pagination.total} posts found</p>
                <p className="text-sm text-slate">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => loadPosts(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadPosts(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          ) : null}
        </Container>
      </section>
    </div>
  )
}

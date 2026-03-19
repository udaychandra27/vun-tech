import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import { Container } from "@/components/layout/Container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"
import { formatBlogDate } from "@/lib/blog"

export function AdminBlogManager() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState("newest")
  const [loading, setLoading] = useState(true)

  const loadPosts = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        sort,
      })
      if (status) params.set("status", status)
      if (appliedSearch) params.set("search", appliedSearch)
      const data = await apiFetch(`/api/admin/blog?${params.toString()}`)
      setItems(data.items || [])
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 })
    } finally {
      setLoading(false)
    }
  }, [appliedSearch, sort, status])

  useEffect(() => {
    loadPosts(1)
  }, [loadPosts])

  const stats = useMemo(
    () => ({
      total: pagination.total,
      published: items.filter((item) => item.status === "published").length,
      drafts: items.filter((item) => item.status === "draft").length,
    }),
    [items, pagination.total]
  )

  return (
    <div className="min-h-screen bg-sand">
      <Container className="py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-ink/60">Admin blog manager</div>
            <h1 className="mt-2 text-4xl font-semibold">Publish and maintain your content system.</h1>
            <p className="mt-3 max-w-2xl text-slate">
              Search posts, switch statuses, and open the full editor for drafts and live articles.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
              Back to dashboard
            </Button>
            <Button asChild>
              <Link to="/admin/blog/new">
                <Plus className="mr-2 h-4 w-4" />
                New post
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-5"><div className="text-sm text-slate">Total posts</div><div className="mt-2 text-3xl font-semibold">{stats.total}</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-sm text-slate">Visible now</div><div className="mt-2 text-3xl font-semibold">{stats.published}</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-sm text-slate">Drafts on this page</div><div className="mt-2 text-3xl font-semibold">{stats.drafts}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="gap-4">
            <CardTitle>Posts</CardTitle>
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px_auto]">
              <form
                className="relative"
                onSubmit={(event) => {
                  event.preventDefault()
                  setAppliedSearch(search.trim())
                }}
              >
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <Input
                  className="pl-11"
                  placeholder="Search title, tags, author"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </form>
              <select
                className="rounded-md border border-fog bg-white px-3 text-sm"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <select
                className="rounded-md border border-fog bg-white px-3 text-sm"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <Button variant="outline" onClick={() => loadPosts(pagination.page)}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-fog text-slate">
                    <th className="px-3 py-3 font-medium">Title</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Published</th>
                    <th className="px-3 py-3 font-medium">Read time</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-10 text-center text-slate">
                        Loading posts...
                      </td>
                    </tr>
                  ) : null}
                  {!loading && items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-10 text-center text-slate">
                        No posts found for this filter.
                      </td>
                    </tr>
                  ) : null}
                  {!loading &&
                    items.map((post) => (
                      <tr key={post._id} className="border-b border-fog/70 align-top">
                        <td className="px-3 py-4">
                          <div className="font-medium text-ink">{post.title}</div>
                          <div className="mt-1 text-xs text-slate">/{post.slug}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {post.category ? <Badge>{post.category}</Badge> : null}
                            {(post.tags || []).slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <Badge
                            variant={post.status === "published" ? "success" : "outline"}
                            className={post.status === "published" ? "" : "text-ink"}
                          >
                            {post.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 text-slate">
                          {formatBlogDate(post.publishedAt || post.createdAt)}
                        </td>
                        <td className="px-3 py-4 text-slate">{post.readTime} min</td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/admin/blog/${post._id}/edit`}>Edit</Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await apiFetch(`/api/blog/${post._id}`, {
                                  method: "PUT",
                                  body: JSON.stringify({
                                    ...post,
                                    status: post.status === "published" ? "draft" : "published",
                                  }),
                                })
                                loadPosts(pagination.page)
                              }}
                            >
                              {post.status === "published" ? "Unpublish" : "Publish"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await apiFetch(`/api/blog/${post._id}`, { method: "DELETE" })
                                loadPosts(pagination.page)
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-slate">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
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
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}

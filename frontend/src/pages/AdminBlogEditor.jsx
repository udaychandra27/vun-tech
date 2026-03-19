import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Eye, LoaderCircle, Save, SendHorizonal } from "lucide-react"
import { Container } from "@/components/layout/Container"
import { BlogContent } from "@/components/blog/BlogContent"
import { BlogEditor } from "@/components/blog/BlogEditor"
import { Seo } from "@/components/seo/Seo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/api"
import {
  DEFAULT_BLOG_CATEGORIES,
  decorateBlogHtml,
  formatBlogDate,
  resolveMediaUrl,
  slugify,
} from "@/lib/blog"
import { OptimizedImage } from "@/components/OptimizedImage"

const emptyForm = {
  title: "",
  slug: "",
  featuredImage: "",
  excerpt: "",
  category: DEFAULT_BLOG_CATEGORIES[0],
  tags: [],
  tagInput: "",
  author: "VUN Tech",
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
  content: "<h1>Start writing</h1><p>Use this editor to draft, format, and preview the post.</p>",
  status: "draft",
}

function toInputDate(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 16)
}

export function AdminBlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [postId, setPostId] = useState(id || null)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [message, setMessage] = useState("")
  const slugTouchedRef = useRef(false)

  useEffect(() => {
    if (!isEditing) return
    apiFetch(`/api/admin/blog/${id}`)
      .then((data) => {
        setPostId(data._id)
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          featuredImage: data.featuredImage || "",
          excerpt: data.excerpt || "",
          category: data.category || DEFAULT_BLOG_CATEGORIES[0],
          tags: data.tags || [],
          tagInput: "",
          author: data.author || "VUN Tech",
          publishedAt: toInputDate(data.publishedAt),
          seoTitle: data.seoTitle || "",
          seoDescription: data.seoDescription || "",
          content: data.content || emptyForm.content,
          status: data.status || "draft",
        })
      })
      .finally(() => setLoading(false))
  }, [id, isEditing])

  useEffect(() => {
    if (!form.title || slugTouchedRef.current) return
    setForm((prev) => ({ ...prev, slug: slugify(prev.title) }))
  }, [form.title])

  const decoratedPreview = useMemo(() => decorateBlogHtml(form.content), [form.content])

  const uploadImage = async (file) => {
    const data = new FormData()
    data.append("image", file)
    const response = await apiFetch("/api/blog/upload", {
      method: "POST",
      body: data,
    })
    return response.imageUrl
  }

  const savePost = useCallback(async (nextStatus = form.status, silent = false) => {
    if (!form.title.trim() || !form.content.trim()) return null
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        featuredImage: form.featuredImage,
        excerpt: form.excerpt,
        category: form.category,
        tags: form.tags,
        author: form.author,
        publishedAt: form.publishedAt || null,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        content: form.content,
        status: nextStatus,
      }
      const data = postId
        ? await apiFetch(`/api/blog/${postId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiFetch("/api/blog", {
            method: "POST",
            body: JSON.stringify(payload),
          })
      setPostId(data._id)
      setForm((prev) => ({
        ...prev,
        status: data.status,
        excerpt: data.excerpt || prev.excerpt,
        seoTitle: data.seoTitle || prev.seoTitle,
        seoDescription: data.seoDescription || prev.seoDescription,
        publishedAt: toInputDate(data.publishedAt),
      }))
      if (!silent) {
        setMessage(nextStatus === "published" ? "Post published." : "Draft saved.")
      }
      if (!postId) {
        navigate(`/admin/blog/${data._id}/edit`, { replace: true })
      }
      return data
    } finally {
      setSaving(false)
    }
  }, [form, navigate, postId])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (form.status === "draft" && (form.title.trim() || form.content.trim())) {
        savePost("draft", true).catch(() => {})
      }
    }, 30000)
    return () => window.clearInterval(timer)
  }, [form, savePost])

  if (loading) {
    return (
      <Container className="py-16">
        <div className="rounded-[2rem] border border-fog bg-white p-10 text-slate">Loading post...</div>
      </Container>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      <Seo title={isEditing ? "Edit Blog Post | VUN Tech Admin" : "New Blog Post | VUN Tech Admin"} />
      <Container className="py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-ink/60">Admin editor</div>
            <h1 className="mt-2 text-4xl font-semibold">
              {isEditing ? "Edit blog post" : "Create a new blog post"}
            </h1>
            <p className="mt-3 text-slate">
              Drafts auto-save every 30 seconds. You can preview before publishing and switch a live post back to draft at any time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/blog">Back to list</Link>
            </Button>
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" onClick={() => savePost("draft")}>
              {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save draft
            </Button>
            <Button onClick={() => savePost("published")}>
              <SendHorizonal className="mr-2 h-4 w-4" />
              {form.status === "published" ? "Update published post" : "Publish"}
            </Button>
          </div>
        </div>

        {message ? (
          <div className="mb-6 rounded-2xl border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-ink">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
                <Input
                  placeholder="SEO friendly slug"
                  value={form.slug}
                  onChange={(event) => {
                    slugTouchedRef.current = true
                    setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))
                  }}
                />
                <BlogEditor
                  value={form.content}
                  onChange={(content) => setForm((prev) => ({ ...prev, content }))}
                  onUploadImage={uploadImage}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={form.status === "published" ? "success" : "outline"} className="text-ink">
                    {form.status}
                  </Badge>
                  <span className="text-sm text-slate">
                    {form.publishedAt ? formatBlogDate(form.publishedAt) : "Not scheduled yet"}
                  </span>
                </div>
                <label className="grid gap-2 text-sm text-slate">
                  Publish date
                  <Input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, publishedAt: event.target.value }))
                    }
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate">
                  Author name
                  <Input
                    value={form.author}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, author: event.target.value }))
                    }
                  />
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="grid gap-2 text-sm text-slate">
                  Category
                  <select
                    className="h-10 rounded-md border border-fog bg-white px-3 text-sm"
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, category: event.target.value }))
                    }
                  >
                    {[...new Set([...DEFAULT_BLOG_CATEGORIES, form.category].filter(Boolean))].map(
                      (category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </label>
                <div className="grid gap-2">
                  <label className="text-sm text-slate">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <Badge
                        key={tag}
                        role="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((item) => item !== tag),
                          }))
                        }
                        className="cursor-pointer"
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag"
                      value={form.tagInput}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, tagInput: event.target.value }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          const tag = form.tagInput.trim()
                          if (!tag || form.tags.includes(tag)) return
                          setForm((prev) => ({
                            ...prev,
                            tags: [...prev.tags, tag],
                            tagInput: "",
                          }))
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const tag = form.tagInput.trim()
                        if (!tag || form.tags.includes(tag)) return
                        setForm((prev) => ({
                          ...prev,
                          tags: [...prev.tags, tag],
                          tagInput: "",
                        }))
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <label className="grid gap-2 text-sm text-slate">
                  Excerpt
                  <Textarea
                    rows={4}
                    value={form.excerpt}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, excerpt: event.target.value }))
                    }
                    placeholder="Leave blank to auto-generate from the content"
                  />
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured image & SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-fog bg-sand">
                  {form.featuredImage ? (
                    <OptimizedImage
                      src={resolveMediaUrl(form.featuredImage)}
                      alt={form.title || "Featured image"}
                      width={1200}
                      height={675}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-slate">
                      No featured image selected
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Featured image URL"
                    value={form.featuredImage}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, featuredImage: event.target.value }))
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = async () => {
                        const file = input.files?.[0]
                        if (!file) return
                        const imageUrl = await uploadImage(file)
                        setForm((prev) => ({ ...prev, featuredImage: imageUrl }))
                      }
                      input.click()
                    }}
                  >
                    Upload
                  </Button>
                </div>
                <Input
                  placeholder="SEO title"
                  value={form.seoTitle}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, seoTitle: event.target.value }))
                  }
                />
                <Textarea
                  rows={4}
                  placeholder="SEO description"
                  value={form.seoDescription}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, seoDescription: event.target.value }))
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {form.category ? <Badge>{form.category}</Badge> : null}
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h2 className="text-4xl font-semibold">{form.title || "Untitled post"}</h2>
              <div className="text-sm text-slate">
                {form.author} · {form.publishedAt ? formatBlogDate(form.publishedAt) : "Draft preview"}
              </div>
              {form.featuredImage ? (
                <div className="overflow-hidden rounded-2xl">
                  <OptimizedImage
                    src={resolveMediaUrl(form.featuredImage)}
                    alt={form.title || "Preview image"}
                    width={1200}
                    height={675}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
            <BlogContent html={decoratedPreview.html || ""} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

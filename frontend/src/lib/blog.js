import DOMPurify from "dompurify"
import { API_URL } from "@/lib/api"

export const DEFAULT_BLOG_CATEGORIES = [
  "Engineering",
  "Cybersecurity",
  "Automation",
  "AI",
  "Strategy",
  "Case Studies",
]

export function resolveMediaUrl(url = "") {
  if (!url) return ""
  if (url.startsWith("http") || url.startsWith("data:")) return url
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`
  return url
}

export function formatBlogDate(value) {
  if (!value) return "Unscheduled"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unscheduled"
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function slugify(value = "") {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200)
}

export function sanitizeClientHtml(value = "") {
  return DOMPurify.sanitize(value, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel", "loading", "decoding", "data-caption", "data-callout"],
  })
}

export function decorateBlogHtml(value = "") {
  if (typeof window === "undefined") {
    return sanitizeClientHtml(value)
  }

  const parser = new window.DOMParser()
  const doc = parser.parseFromString(sanitizeClientHtml(value), "text/html")
  const headings = []

  doc.querySelectorAll("h1, h2, h3, h4").forEach((heading, index) => {
    const text = heading.textContent?.trim() || `section-${index + 1}`
    const id = slugify(text) || `section-${index + 1}`
    heading.id = id
    headings.push({
      id,
      text,
      level: Number(heading.tagName.slice(1)),
    })
  })

  doc.querySelectorAll("img[data-caption]").forEach((image) => {
    const caption = image.getAttribute("data-caption")?.trim()
    if (!caption || image.parentElement?.tagName === "FIGURE") return

    const figure = doc.createElement("figure")
    figure.setAttribute("data-type", "blog-image")
    figure.className = "blog-figure"
    image.replaceWith(figure)
    figure.appendChild(image)

    const figcaption = doc.createElement("figcaption")
    figcaption.textContent = caption
    figure.appendChild(figcaption)
  })

  return {
    html: doc.body.innerHTML,
    headings,
  }
}

export function stripHtml(value = "") {
  if (typeof window === "undefined") {
    return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  }
  const parser = new window.DOMParser()
  const doc = parser.parseFromString(value, "text/html")
  return doc.body.textContent?.replace(/\s+/g, " ").trim() || ""
}

export function getShareLinks(slug) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${slug}`
      : `/blog/${slug}`

  return {
    copy: url,
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  }
}

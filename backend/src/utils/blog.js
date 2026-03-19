import sanitizeHtml from "sanitize-html"

export function slugifyBlogTitle(value = "") {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200)
}

export function stripHtml(value = "") {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

export function calculateReadTime(content = "") {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function buildExcerpt(content = "", providedExcerpt = "") {
  const cleanedExcerpt = stripHtml(providedExcerpt)
  if (cleanedExcerpt) {
    return cleanedExcerpt.slice(0, 220)
  }
  return stripHtml(content).slice(0, 220)
}

export function sanitizeBlogHtml(content = "") {
  return sanitizeHtml(content, {
    allowedTags: [
      "p",
      "br",
      "h1",
      "h2",
      "h3",
      "h4",
      "strong",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "code",
      "pre",
      "img",
      "figure",
      "figcaption",
      "hr",
      "div",
      "span",
      "iframe",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding", "data-caption"],
      figure: ["data-type", "class"],
      div: ["data-callout", "class", "style", "data-align"],
      span: ["style"],
      iframe: [
        "src",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "frameborder",
        "title",
      ],
      code: ["class"],
      pre: ["class"],
      "*": ["id"],
    },
    allowedStyles: {
      div: {
        "text-align": [/^left$/, /^center$/, /^right$/, /^justify$/],
      },
      span: {
        "text-align": [/^left$/, /^center$/, /^right$/, /^justify$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          loading: "lazy",
          decoding: "async",
        },
      }),
    },
  })
}

export function buildBlogMeta(post) {
  const seoTitle = post.seoTitle || post.title
  const seoDescription = post.seoDescription || post.excerpt
  return {
    title: seoTitle,
    description: seoDescription,
    ogImage: post.featuredImage || "",
  }
}

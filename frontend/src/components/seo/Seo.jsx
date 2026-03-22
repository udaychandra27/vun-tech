import { useEffect } from "react"

function applyHeadValue({
  selector,
  tagName,
  attributes,
  value,
  cleanup,
  property = "content",
}) {
  if (typeof document === "undefined") return

  let element = document.head.querySelector(selector)
  let created = false

  if (!element && value) {
    element = document.createElement(tagName)
    Object.entries(attributes).forEach(([key, attributeValue]) => {
      element.setAttribute(key, attributeValue)
    })
    element.dataset.seoManaged = "true"
    document.head.appendChild(element)
    created = true
  }

  if (!element) return

  const hadAttribute = element.hasAttribute(property)
  const previousValue = element.getAttribute(property)

  cleanup.push(() => {
    if (created) {
      element.remove()
      return
    }

    if (hadAttribute) {
      element.setAttribute(property, previousValue ?? "")
    } else {
      element.removeAttribute(property)
    }
  })

  if (value) {
    element.setAttribute(property, value)
  } else if (created) {
    element.remove()
  } else {
    element.removeAttribute(property)
  }
}

export function Seo({
  title,
  description,
  image,
  type = "website",
  structuredData,
}) {
  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined
    }

    const cleanup = []
    const canonicalUrl = window.location.href
    const previousTitle = document.title

    if (title) {
      document.title = title
      cleanup.push(() => {
        document.title = previousTitle
      })
    }

    applyHeadValue({
      selector: 'meta[name="description"]',
      tagName: "meta",
      attributes: { name: "description" },
      value: description,
      cleanup,
    })
    applyHeadValue({
      selector: 'link[rel="canonical"]',
      tagName: "link",
      attributes: { rel: "canonical" },
      value: canonicalUrl,
      cleanup,
      property: "href",
    })
    applyHeadValue({
      selector: 'meta[property="og:title"]',
      tagName: "meta",
      attributes: { property: "og:title" },
      value: title,
      cleanup,
    })
    applyHeadValue({
      selector: 'meta[property="og:description"]',
      tagName: "meta",
      attributes: { property: "og:description" },
      value: description,
      cleanup,
    })
    applyHeadValue({
      selector: 'meta[property="og:image"]',
      tagName: "meta",
      attributes: { property: "og:image" },
      value: image,
      cleanup,
    })
    applyHeadValue({
      selector: 'meta[property="og:url"]',
      tagName: "meta",
      attributes: { property: "og:url" },
      value: canonicalUrl,
      cleanup,
    })
    applyHeadValue({
      selector: 'meta[property="og:type"]',
      tagName: "meta",
      attributes: { property: "og:type" },
      value: type,
      cleanup,
    })
    applyHeadValue({
      selector: 'meta[name="twitter:card"]',
      tagName: "meta",
      attributes: { name: "twitter:card" },
      value: "summary_large_image",
      cleanup,
    })
    applyHeadValue({
      selector: 'meta[name="twitter:title"]',
      tagName: "meta",
      attributes: { name: "twitter:title" },
      value: title,
      cleanup,
    })
    applyHeadValue({
      selector: 'meta[name="twitter:description"]',
      tagName: "meta",
      attributes: { name: "twitter:description" },
      value: description,
      cleanup,
    })
    applyHeadValue({
      selector: 'meta[name="twitter:image"]',
      tagName: "meta",
      attributes: { name: "twitter:image" },
      value: image,
      cleanup,
    })

    if (structuredData) {
      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.dataset.seoManaged = "true"
      script.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script)
      cleanup.push(() => script.remove())
    }

    return () => {
      cleanup
        .slice()
        .reverse()
        .forEach((callback) => callback())
    }
  }, [description, image, structuredData, title, type])

  return null
}

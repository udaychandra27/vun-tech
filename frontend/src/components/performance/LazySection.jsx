import { Suspense, useEffect, useRef, useState } from "react"

export function LazySection({
  children,
  fallback = null,
  rootMargin = "320px 0px",
  containIntrinsicSize = "900px",
}) {
  const hostRef = useRef(null)
  const [shouldRender, setShouldRender] = useState(
    () => typeof window !== "undefined" && typeof IntersectionObserver === "undefined"
  )

  useEffect(() => {
    if (shouldRender) return undefined

    const node = hostRef.current
    if (!node) return undefined

    if (typeof IntersectionObserver === "undefined") return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold: 0.01 }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [rootMargin, shouldRender])

  return (
    <div
      ref={hostRef}
      style={
        shouldRender
          ? undefined
          : {
              contentVisibility: "auto",
              containIntrinsicSize,
            }
      }
    >
      {shouldRender ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  )
}

function isUnsplashUrl(src = "") {
  return /images\.unsplash\.com/i.test(src)
}

function isCloudinaryUrl(src = "") {
  return /res\.cloudinary\.com/i.test(src)
}

function updateSearchParam(src, key, value) {
  try {
    const url = new URL(src)
    url.searchParams.set(key, value)
    return url.toString()
  } catch {
    return src
  }
}

function buildUnsplashVariant(src, width, format) {
  let next = updateSearchParam(src, "w", width)
  next = updateSearchParam(next, "q", format === "avif" ? "55" : "60")
  next = updateSearchParam(next, "fit", "crop")
  next = updateSearchParam(next, "auto", `format,compress`)
  if (format) {
    next = updateSearchParam(next, "fm", format)
  }
  return next
}

function buildCloudinaryVariant(src, width, format) {
  const delivery = `f_${format},q_auto,w_${width},c_limit`
  return src.replace("/upload/", `/upload/${delivery}/`)
}

function buildResponsiveSources(src, responsiveWidths = []) {
  if (!src || responsiveWidths.length === 0) {
    return { avifSrcSet: undefined, webpSrcSet: undefined, defaultSrcSet: undefined }
  }

  if (isUnsplashUrl(src)) {
    const defaultSrcSet = responsiveWidths
      .map((width) => `${buildUnsplashVariant(src, width)} ${width}w`)
      .join(", ")
    const webpSrcSet = responsiveWidths
      .map((width) => `${buildUnsplashVariant(src, width, "webp")} ${width}w`)
      .join(", ")
    const avifSrcSet = responsiveWidths
      .map((width) => `${buildUnsplashVariant(src, width, "avif")} ${width}w`)
      .join(", ")

    return { avifSrcSet, webpSrcSet, defaultSrcSet }
  }

  if (isCloudinaryUrl(src)) {
    const defaultSrcSet = responsiveWidths
      .map((width) => `${buildCloudinaryVariant(src, width, "auto")} ${width}w`)
      .join(", ")
    const webpSrcSet = responsiveWidths
      .map((width) => `${buildCloudinaryVariant(src, width, "webp")} ${width}w`)
      .join(", ")
    const avifSrcSet = responsiveWidths
      .map((width) => `${buildCloudinaryVariant(src, width, "avif")} ${width}w`)
      .join(", ")

    return { avifSrcSet, webpSrcSet, defaultSrcSet }
  }

  return { avifSrcSet: undefined, webpSrcSet: undefined, defaultSrcSet: undefined }
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  className = "",
  width,
  height,
  sizes = "100vw",
  fetchPriority,
  responsiveWidths,
  ...props
}) {
  const candidateWidths =
    responsiveWidths ||
    [320, 480, 640, 768, 960, 1200, 1600].filter((candidate) => !width || candidate <= width)

  const { avifSrcSet, webpSrcSet, defaultSrcSet } = buildResponsiveSources(
    src,
    candidateWidths
  )

  return (
    <picture>
      {avifSrcSet ? <source srcSet={avifSrcSet} sizes={sizes} type="image/avif" /> : null}
      {webpSrcSet ? <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" /> : null}
      <img
        src={src}
        srcSet={defaultSrcSet}
        sizes={defaultSrcSet ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={fetchPriority || (priority ? "high" : "auto")}
        decoding={priority ? "sync" : "async"}
        style={{ maxWidth: "100%", height: "auto" }}
        className={className}
        {...props}
      />
    </picture>
  )
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  className = "",
  ...props
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{ maxWidth: "100%", height: "auto" }}
      className={className}
      {...props}
    />
  )
}

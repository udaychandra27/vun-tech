export function OptimizedImage({
  src,
  alt,
  priority = false,
  className = "",
  width,
  height,
  ...props
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{ maxWidth: "100%", height: "auto" }}
      className={className}
      {...props}
    />
  )
}

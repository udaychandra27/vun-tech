import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import viteImagemin from "vite-plugin-imagemin"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PRODUCTION_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' https://checkout.razorpay.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https://vun-tech-jtvr.onrender.com https://cloudflareinsights.com https://api.razorpay.com https://checkout.razorpay.com",
  "frame-src 'self' https://checkout.razorpay.com",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ")

export default defineConfig(({ mode }) => {
  loadEnv(mode, __dirname, "")

  return {
    plugins: [
      react(),
      viteImagemin({
        gifsicle: { optimizationLevel: 7 },
        optipng: { optimizationLevel: 5 },
        mozjpeg: { quality: 75 },
        pngquant: { quality: [0.65, 0.9], speed: 4 },
        webp: { quality: 75 },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      minify: "terser",
      target: "es2018",
      cssMinify: true,
      cssCodeSplit: true,
      sourcemap: false,
      reportCompressedSize: true,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2,
          pure_funcs: ["console.log", "console.info", "console.warn"],
        },
        mangle: true,
        format: { comments: false },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules/")) {
              return undefined
            }

            if (
              id.includes("node_modules/react-router") ||
              id.includes("node_modules/react-router-dom") ||
              id.includes("node_modules/@remix-run/router")
            ) {
              return "vendor-router"
            }

            if (
              id.includes("@tiptap") ||
              id.includes("prosemirror") ||
              id.includes("linkifyjs") ||
              id.includes("orderedmap") ||
              id.includes("rope-sequence") ||
              id.includes("w3c-keyname")
            ) {
              return "vendor-editor"
            }

            if (id.includes("react-easy-crop")) {
              return "vendor-media"
            }

            if (id.includes("lucide-react")) {
              return "vendor-icons"
            }

            if (id.includes("dompurify")) {
              return "vendor-blog"
            }

            if (
              id.includes("@radix-ui/react-dialog") ||
              id.includes("@radix-ui/react-dropdown-menu") ||
              id.includes("@radix-ui/") ||
              id.includes("react-remove-scroll") ||
              id.includes("react-remove-scroll-bar") ||
              id.includes("react-style-singleton") ||
              id.includes("aria-hidden") ||
              id.includes("use-callback-ref") ||
              id.includes("use-sidecar")
            ) {
              return "vendor-radix"
            }

            if (
              id.includes("node_modules/clsx") ||
              id.includes("node_modules/tailwind-merge")
            ) {
              return "vendor-utils"
            }

            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/scheduler") ||
              id.includes("node_modules/loose-envify") ||
              id.includes("node_modules/js-tokens")
            ) {
              return "vendor-react"
            }

            return undefined
          },
        },
      },
    },
  }
})

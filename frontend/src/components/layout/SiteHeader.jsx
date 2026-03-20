import { NavLink, Link } from "react-router-dom"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { OptimizedImage } from "@/components/OptimizedImage"

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Work", to: "/work" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-fog bg-white/95 backdrop-blur">
      <Container className="flex h-18 items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-fog p-2 lg:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
            <OptimizedImage
              src="/vun-logo.png"
              alt="VUN Tech logo"
              width={160}
              height={160}
              className="-my-2 h-16 w-16 shrink-0 rounded-md object-contain sm:h-[4.5rem] sm:w-[4.5rem] md:h-20 md:w-20"
            />
            <div className="leading-tight">
              <div className="brand-wordmark text-lg font-semibold tracking-[0.2em] text-ink sm:text-2xl">
                VUN Tech
              </div>
              <div className="brand-tagline hidden text-[10px] font-semibold tracking-[0.35em] text-slate sm:block">
                INNOVATE. SECURE. ADVANCE.
              </div>
            </div>
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-[14px] lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-moss" : "text-ink/80 hover:text-moss"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            asChild
            size="sm"
            className="hidden rounded-[10px] bg-[#0f172a] px-4 text-white hover:bg-[#1e293b] sm:inline-flex"
          >
            <Link to="/contact">Get Quote &rarr;</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-[10px] sm:hidden">
            <Link to="/contact">Contact</Link>
          </Button>
        </div>
      </Container>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-solid-ink shadow-xl transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4" />
        <button
          type="button"
          className="absolute left-4 top-4 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/10 p-2 text-sand"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="px-4 py-6">
          <div className="rounded-2xl bg-white text-black p-4">
            <div className="flex flex-col gap-4 text-sm text-ink">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? "text-ink" : "text-ink/80 hover:text-ink"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

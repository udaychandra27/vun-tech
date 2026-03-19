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
  { label: "Blog", to: "/blog" },
  { label: "Trending", to: "/trending" },
  { label: "Work", to: "/work" },
  { label: "Contact", to: "/contact" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-fog/80 bg-white/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-fog p-2 xl:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
            <OptimizedImage
              src="/vun-logo.png"
              alt="VUN Tech logo"
              width={64}
              height={64}
              className="h-12 w-12 shrink-0 rounded-md object-cover sm:h-14 sm:w-14 md:h-16 md:w-16"
            />
            <div className="leading-tight">
              <div className="text-lg font-semibold tracking-[0.2em] text-ink sm:text-2xl" style={{ fontFamily: "Fraunces, serif" }}>
                VUN Tech
              </div>
              <div className="hidden text-[10px] font-semibold tracking-[0.35em] text-slate sm:block">
                INNOVATE. SECURE. ADVANCE.
              </div>
            </div>
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-sm xl:flex">
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
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/contact">Get Quote</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="sm:hidden">
            <Link to="/contact">Contact</Link>
          </Button>
        </div>
      </Container>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity xl:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-solid-ink shadow-xl transition-transform xl:hidden ${
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

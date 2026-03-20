import { Link } from "react-router-dom"
import { Container } from "@/components/layout/Container"

export function SiteFooter() {
  return (
    <footer className="border-t border-fog bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
      <Container className="flex flex-col gap-5 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="brand-wordmark text-[15px] font-semibold text-[#0f172a]">VUN Tech</div>
          <div className="mt-1 text-[12px] text-[#64748b]">
            Reliable software delivery for teams that value clarity.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#64748b]">
          <Link to="/blog">Blog</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/about">About</Link>
          <Link to="/trending">Trending</Link>
        </div>
      </Container>
    </footer>
  )
}

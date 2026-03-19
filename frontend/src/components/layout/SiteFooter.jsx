import { Link } from "react-router-dom"
import { Container } from "@/components/layout/Container"

export function SiteFooter() {
  return (
    <footer className="border-t border-fog bg-white/80">
      <Container className="flex flex-col gap-4 py-8 text-sm text-slate md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-ink">VUN Tech</div>
          <div>Reliable software delivery for teams that value clarity.</div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/blog">Blog</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </Container>
    </footer>
  )
}

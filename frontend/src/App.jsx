import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Suspense, lazy } from "react"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { RequireAuth } from "@/routes/RequireAuth"
import { Home } from "@/pages/Home"
import { ChatWidget } from "@/components/ChatWidget"
const Services = lazy(() =>
  import("@/pages/Services").then((m) => ({ default: m.Services }))
)
const Work = lazy(() => import("@/pages/Work").then((m) => ({ default: m.Work })))
const Trending = lazy(() =>
  import("@/pages/Trending").then((m) => ({ default: m.Trending }))
)
const About = lazy(() =>
  import("@/pages/About").then((m) => ({ default: m.About }))
)
const Contact = lazy(() =>
  import("@/pages/Contact").then((m) => ({ default: m.Contact }))
)
const Privacy = lazy(() =>
  import("@/pages/Privacy").then((m) => ({ default: m.Privacy }))
)
const Terms = lazy(() => import("@/pages/Terms").then((m) => ({ default: m.Terms })))
const AdminLogin = lazy(() =>
  import("@/pages/AdminLogin").then((m) => ({ default: m.AdminLogin }))
)
const AdminDashboard = lazy(() =>
  import("@/pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
)
const BlogList = lazy(() =>
  import("@/pages/BlogList").then((m) => ({ default: m.BlogList }))
)
const BlogDetail = lazy(() =>
  import("@/pages/BlogDetail").then((m) => ({ default: m.BlogDetail }))
)
const AdminBlogManager = lazy(() =>
  import("@/pages/AdminBlogManager").then((m) => ({ default: m.AdminBlogManager }))
)
const AdminBlogEditor = lazy(() =>
  import("@/pages/AdminBlogEditor").then((m) => ({ default: m.AdminBlogEditor }))
)

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-white">
        <SiteHeader />
        <main className="flex-1">
          <Suspense fallback={<div className="px-6 py-10 text-sm text-slate">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/work" element={<Work />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <RequireAuth>
                    <AdminDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/blog"
                element={
                  <RequireAuth>
                    <AdminBlogManager />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/blog/new"
                element={
                  <RequireAuth>
                    <AdminBlogEditor />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/blog/:id/edit"
                element={
                  <RequireAuth>
                    <AdminBlogEditor />
                  </RequireAuth>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <SiteFooter />
        <ChatWidget />
      </div>
    </BrowserRouter>
  )
}

export default App

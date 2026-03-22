import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Cloud,
  Globe,
  LayoutPanelTop,
  Monitor,
  PenTool,
  ScanSearch,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react"
import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionBadge, GradientOrbs } from "@/components/Decorations"
import { apiFetch } from "@/lib/api"
import { defaultProjects } from "@/data/content"
import { PageSkeleton } from "@/components/PageSkeleton"

const iconMap = {
  Monitor,
  ShieldCheck,
  PenTool,
  Cloud,
  Workflow,
  Sparkles,
  ScanSearch,
  LayoutPanelTop,
  ServerCog,
  Globe,
}

const accentMap = {
  blue: {
    strip: "bg-[#2563eb]",
    iconWrap: "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]",
    badge: "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]",
    dot: "bg-[#2563eb]",
    outcome: "border-[#dcfce7] bg-[#f0fdf4] text-[#166534]",
  },
  green: {
    strip: "bg-[#10b981]",
    iconWrap: "border-[#bbf7d0] bg-[#f0fdf4] text-[#059669]",
    badge: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]",
    dot: "bg-[#059669]",
    outcome: "border-[#dcfce7] bg-[#f0fdf4] text-[#166534]",
  },
  amber: {
    strip: "bg-[#d97706]",
    iconWrap: "border-[#fcd34d] bg-[#fff7ed] text-[#d97706]",
    badge: "border-[#fcd34d] bg-[#fff7ed] text-[#b45309]",
    dot: "bg-[#d97706]",
    outcome: "border-[#dcfce7] bg-[#f0fdf4] text-[#166534]",
  },
  purple: {
    strip: "bg-[#7c3aed]",
    iconWrap: "border-[#ddd6fe] bg-[#f5f3ff] text-[#7c3aed]",
    badge: "border-[#ddd6fe] bg-[#f5f3ff] text-[#6d28d9]",
    dot: "bg-[#7c3aed]",
    outcome: "border-[#dcfce7] bg-[#f0fdf4] text-[#166534]",
  },
  pink: {
    strip: "bg-[#db2777]",
    iconWrap: "border-[#fbcfe8] bg-[#fdf2f8] text-[#db2777]",
    badge: "border-[#fbcfe8] bg-[#fdf2f8] text-[#be185d]",
    dot: "bg-[#db2777]",
    outcome: "border-[#dcfce7] bg-[#f0fdf4] text-[#166534]",
  },
}

const fallbackContent = {
  heroTitle: "Case-ready work, no hype",
  heroSubtitle:
    "A sample of recent delivery across product, operations, and internal tooling. Each engagement focuses on clarity and long-term stability.",
  allProjectsLabel: "All projects",
  ctaTitle: "Want to be our next case study?",
  ctaSubtitle: "Every project starts with a scoping conversation. No commitment required.",
  primaryCtaLabel: "Start a project",
  primaryCtaUrl: "/contact",
  secondaryCtaLabel: "View services",
  secondaryCtaUrl: "/services",
}

function normalizeProject(project) {
  return {
    ...project,
    domain: project.domain || project.industry || "Product Engineering",
    badgeLabel: project.badgeLabel || "Case Study",
    accent: accentMap[project.accent] ? project.accent : "blue",
    icon: project.icon || "Monitor",
    summary: project.summary || project.description,
    includes: Array.isArray(project.includes) ? project.includes : [],
    idealFor: project.idealFor || "Teams that want clear scope and measurable outcomes",
    stack: Array.isArray(project.stack) ? project.stack : [],
  }
}

export function Work() {
  const [projects, setProjects] = useState([])
  const [content, setContent] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    Promise.allSettled([apiFetch("/api/projects"), apiFetch("/api/content/work")])
      .then(([projectsResult, contentResult]) => {
        if (!mounted) return

        if (projectsResult.status === "fulfilled" && Array.isArray(projectsResult.value) && projectsResult.value.length > 0) {
          setProjects(projectsResult.value)
        } else {
          setProjects(defaultProjects)
        }

        if (contentResult.status === "fulfilled" && contentResult.value) {
          setContent({ ...fallbackContent, ...contentResult.value })
        } else {
          setContent(fallbackContent)
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const normalizedProjects = useMemo(
    () => projects.map((project) => normalizeProject(project)),
    [projects]
  )

  const filters = useMemo(() => {
    const labels = normalizedProjects.map((project) => project.domain).filter(Boolean)
    return Array.from(new Set(labels))
  }, [normalizedProjects])

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return normalizedProjects
    return normalizedProjects.filter((project) => project.domain === activeFilter)
  }, [activeFilter, normalizedProjects])

  if (loading || !content) {
    return (
      <PageSkeleton
        badge="Work"
        titleWidth="max-w-[520px]"
        filterCount={4}
        cardCount={3}
        showFooterCta
      />
    )
  }

  return (
    <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_34%,#f4f8ff_100%)]">
      <section className="relative border-b border-fog bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] bg-grid">
        <GradientOrbs />
        <Container className="py-16">
          <SectionBadge>Work</SectionBadge>
          <h1 className="mt-5 max-w-4xl text-[42px] font-semibold tracking-[-0.05em] text-ink md:text-[64px]">
            {content.heroTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-[18px] leading-8 text-slate">
            {content.heroSubtitle}
          </p>
        </Container>
      </section>

      <section className="border-b border-fog bg-white">
        <Container className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-full border px-5 py-2.5 text-[14px] font-medium transition-colors ${
                activeFilter === "all"
                  ? "border-[#0f172a] bg-[#0f172a] text-white"
                  : "border-[#cbd5e1] bg-white text-slate hover:border-[#94a3b8] hover:text-ink"
              }`}
            >
              {content.allProjectsLabel || fallbackContent.allProjectsLabel}
            </button>
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-5 py-2.5 text-[14px] font-medium transition-colors ${
                  activeFilter === filter
                    ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                    : "border-[#cbd5e1] bg-white text-slate hover:border-[#94a3b8] hover:text-ink"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="text-[14px] text-slate">
            Showing {filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"}
          </div>
        </Container>
      </section>

      <section className="bg-[#f6f9ff] py-10">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const accent = accentMap[project.accent] || accentMap.blue
              const Icon = iconMap[project.icon] || Monitor

              return (
                <Card
                  key={project._id || project.name}
                  className="overflow-hidden rounded-[20px] border-[#d8e4f5] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                >
                  <div className={`h-1 w-full ${accent.strip}`} />
                  <CardHeader className="pb-1 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748b]">
                        {project.domain}
                      </div>
                      <div
                        className={`rounded-[10px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${accent.badge}`}
                      >
                        {project.badgeLabel}
                      </div>
                    </div>
                    <div
                      className={`mt-3 flex h-10 w-10 items-center justify-center rounded-[13px] border ${accent.iconWrap}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <CardTitle className="mt-3 text-[18px] leading-[1.12] tracking-[-0.03em] text-ink">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3.5 pb-4 text-slate">
                    <p className="text-[14px] leading-6">{project.summary}</p>

                    {project.includes.length > 0 ? (
                      <div className="border-t border-[#e2e8f0] pt-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#64748b]">
                          Includes
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {project.includes.map((item) => (
                            <div key={item} className="flex items-center gap-2.5 text-[13px] text-ink">
                              <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {project.stack.length > 0 ? (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#64748b]">
                          Stack
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {project.stack.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-[#d7e2f0] bg-[#f8fbff] px-2.5 py-1 text-[11px] text-slate"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {project.outcome ? (
                      <div className={`rounded-[14px] border px-3.5 py-3 ${accent.outcome}`}>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                          Outcome
                        </div>
                        <p className="mt-1 text-[13px] leading-5.5">{project.outcome}</p>
                      </div>
                    ) : null}

                    <div className="rounded-[14px] bg-[#f8fbff] px-3.5 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                        Ideal for
                      </div>
                      <p className="mt-1 text-[13px] leading-5.5 text-slate">
                        {project.idealFor}
                      </p>
                    </div>

                    {project.link ? (
                      <a
                        href={project.link}
                        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#2563eb]"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit project case study <ArrowRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-[14px] font-medium text-[#1d4ed8]">
                        Project details unavailable <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Container>
      </section>

      <section className="border-t border-[#d8e4f5] bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_100%)]">
        <Container className="flex flex-col gap-5 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[34px] font-semibold tracking-[-0.04em] text-ink">
              {content.ctaTitle}
            </h2>
            <p className="mt-3 text-[17px] leading-8 text-slate">
              {content.ctaSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={content.primaryCtaUrl || fallbackContent.primaryCtaUrl}
              className="inline-flex items-center gap-2 rounded-[14px] border border-[#2563eb] bg-[#2563eb] px-6 py-3 text-[16px] font-medium text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] transition-colors hover:bg-[#1d4ed8]"
            >
              {content.primaryCtaLabel || fallbackContent.primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={content.secondaryCtaUrl || fallbackContent.secondaryCtaUrl}
              className="inline-flex items-center gap-2 rounded-[14px] border border-[#c9d9ee] bg-white px-6 py-3 text-[16px] font-medium text-ink transition-colors hover:border-[#94a3b8] hover:bg-[#f8fbff]"
            >
              {content.secondaryCtaLabel || fallbackContent.secondaryCtaLabel}
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}

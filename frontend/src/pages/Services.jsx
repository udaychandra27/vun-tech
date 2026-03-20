import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Check,
  Cloud,
  Code2,
  Globe,
  LayoutPanelTop,
  Lock,
  Monitor,
  PenTool,
  ScanSearch,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
} from "lucide-react"
import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog"
import { featuredServices } from "@/data/content"
import { apiFetch } from "@/lib/api"
import { GradientOrbs, SectionBadge } from "@/components/Decorations"

const iconMap = {
  Monitor,
  ShieldCheck,
  PenTool,
  Cloud,
  Code2,
  Workflow,
  Sparkles,
  Lock,
  ScanSearch,
  LayoutPanelTop,
  ServerCog,
  Globe,
}

const tabIconMap = [Monitor, Workflow, Sparkles]
const serviceDetailSections = ["Included", "Process", "Deliverables"]

const themePresets = {
  blue: {
    accent: "bg-[#2563eb]",
    accentSoft: "bg-[#eff6ff]",
    accentBorder: "border-[#93c5fd]",
    iconWrap: "bg-[#dbeafe] text-[#2563eb]",
    dot: "bg-[#2563eb]",
    pill: "bg-[#dbeafe] text-[#1d4ed8]",
    badge: "bg-[#dbeafe] text-[#1d4ed8]",
    hover: "hover:border-[#60a5fa]",
    modalSurface: "bg-[#f8fbff]",
  },
  "blue-featured": {
    accent: "bg-[#1d4ed8]",
    accentSoft: "bg-[#eef4ff]",
    accentBorder: "border-[#60a5fa]",
    iconWrap: "bg-[#dbeafe] text-[#1d4ed8]",
    dot: "bg-[#1d4ed8]",
    pill: "bg-[#dbeafe] text-[#1d4ed8]",
    badge: "bg-[#1d4ed8] text-white",
    hover: "hover:border-[#3b82f6]",
    modalSurface: "bg-[#f5f9ff]",
  },
  teal: {
    accent: "bg-[#0f766e]",
    accentSoft: "bg-[#ecfeff]",
    accentBorder: "border-[#5eead4]",
    iconWrap: "bg-[#ccfbf1] text-[#0f766e]",
    dot: "bg-[#0f766e]",
    pill: "bg-[#ccfbf1] text-[#0f766e]",
    badge: "bg-[#ccfbf1] text-[#0f766e]",
    hover: "hover:border-[#2dd4bf]",
    modalSurface: "bg-[#f0fdfa]",
  },
  amber: {
    accent: "bg-[#f59e0b]",
    accentSoft: "bg-[#fff7ed]",
    accentBorder: "border-[#fcd34d]",
    iconWrap: "bg-[#fef3c7] text-[#d97706]",
    dot: "bg-[#d97706]",
    pill: "bg-[#fef3c7] text-[#b45309]",
    badge: "bg-[#fff7ed] text-[#b45309]",
    hover: "hover:border-[#f59e0b]",
    modalSurface: "bg-[#fffaf2]",
  },
}

const fallbackServiceConfig = {
  "Web & App Dev": {
    icon: "Monitor",
    theme: "blue",
    eyebrow: "Product Engineering",
    badgeLabel: "Core",
    tags: [],
    detailTabs: [
      {
        title: "Included",
        items: [
          "React UI delivery for responsive, production-ready interfaces",
          "Backend APIs and database integration for core product workflows",
          "Authentication, access control, and protected admin flows",
          "Dashboards and operational screens tailored to team workflows",
          "QA coverage across forms, user journeys, and edge cases",
          "Deployment-ready environments and release configuration",
        ],
      },
      {
        title: "Process",
        items: [
          "Discovery sessions to clarify goals, scope, and technical risks",
          "UX planning and solution design before build work starts",
          "Milestone-based implementation with visible weekly progress",
          "Review checkpoints for feedback, refinements, and approvals",
          "Staging validation before production launch",
          "Structured deployment and post-release handoff",
        ],
      },
      {
        title: "Deliverables",
        items: [
          "Production-ready web app or product module",
          "Clean source code with reusable components and structure",
          "Deployment setup across hosting, environment variables, and domains",
          "Project documentation for onboarding and future changes",
          "Launch checklist and verification notes",
          "Short-term support window after go-live",
        ],
      },
    ],
  },
  Cybersecurity: {
    icon: "ShieldCheck",
    theme: "blue-featured",
    eyebrow: "Security & Compliance",
    badgeLabel: "Featured",
    tags: [],
    detailTabs: [
      {
        title: "Included",
        items: [
          "Access control reviews across admin, user, and internal roles",
          "Authentication and session hardening recommendations",
          "Configuration review for cloud, domain, and hosting exposure",
          "Vulnerability discovery across common application attack paths",
          "Third-party risk review for integrations and SaaS dependencies",
          "Prioritized remediation guidance mapped to business risk",
        ],
      },
      {
        title: "Process",
        items: [
          "Gap analysis against client or enterprise security expectations",
          "Security documentation support for vendor onboarding workflows",
          "Control mapping for policy, process, and implementation coverage",
          "Audit preparation support with evidence planning",
          "Basic governance workflows for reviews, approvals, and access",
          "Communication-ready summaries for leadership and clients",
        ],
      },
      {
        title: "Deliverables",
        items: [
          "Prioritized security findings with business impact context",
          "Remediation roadmap for engineering and operations teams",
          "Policy, checklist, or evidence templates where needed",
          "Incident response guidance for practical team adoption",
          "Monitoring and logging recommendations by priority",
          "Leadership-ready summary for internal or client review",
        ],
      },
    ],
  },
  "UI/UX Design": {
    icon: "PenTool",
    theme: "teal",
    eyebrow: "Experience Design",
    badgeLabel: "Design",
    tags: [],
    detailTabs: [
      {
        title: "Included",
        items: [
          "Journey mapping to uncover friction across high-value flows",
          "Information architecture for clearer navigation and hierarchy",
          "Wireframes that align user goals with business priorities",
          "Conversion-focused flow improvements for signup and enquiry paths",
          "Usability fixes based on clarity, speed, and readability",
          "Experience planning for desktop and mobile responsiveness",
        ],
      },
      {
        title: "Process",
        items: [
          "Visual direction setting with purposeful color and typography",
          "Component styling for consistency across product surfaces",
          "State design for empty, loading, error, and success moments",
          "Design tokens for spacing, borders, and interaction patterns",
          "Card, dashboard, and page layout refinements for cleaner rhythm",
          "Handoff-ready specs developers can implement with confidence",
        ],
      },
      {
        title: "Deliverables",
        items: [
          "Wireframes and polished UI screens for key flows",
          "Design directions with usable type, color, and spacing rules",
          "Developer-ready handoff notes for implementation clarity",
          "Responsive behavior guidance across breakpoints",
          "Accessibility and usability recommendations",
          "Revision-ready source files for the approved design set",
        ],
      },
    ],
  },
  "Cloud Modernization": {
    icon: "Cloud",
    theme: "amber",
    eyebrow: "Infrastructure & Scale",
    badgeLabel: "Migration",
    tags: ["Architecture", "Migration", "Optimization"],
    detailTabs: [
      {
        title: "Included",
        items: [
          "Current stack assessment across hosting, storage, and deployment flow",
          "Architecture recommendations for performance and resilience",
          "Dependency and environment mapping before migration work begins",
          "Risk analysis for downtime, data handling, and rollout sequencing",
          "Scalability planning for traffic spikes and long-term growth",
          "Technical debt review to reduce operational friction",
        ],
      },
      {
        title: "Process",
        items: [
          "Incremental migration roadmap with lower business disruption",
          "Environment setup for staging, production, and rollback paths",
          "Deployment workflow refinement for predictable releases",
          "Service separation planning where monoliths need untangling",
          "Data transition support with validation checkpoints",
          "Cross-team rollout planning with clear owners and timing",
        ],
      },
      {
        title: "Deliverables",
        items: [
          "Migration roadmap with rollout and rollback guidance",
          "Updated environments or infrastructure configuration",
          "Performance and cost optimization recommendations",
          "Monitoring, alerting, and recovery notes",
          "Deployment and operations documentation",
          "Stabilization support after the transition window",
        ],
      },
    ],
  },
}

function normalizeDetailTabs(detailTabs = [], fallbackTabs = []) {
  return serviceDetailSections.map((title, index) => {
    const existingTab = detailTabs[index]
    const fallbackTab = fallbackTabs[index]
    return {
      title,
      items:
        Array.isArray(existingTab?.items) && existingTab.items.length > 0
          ? existingTab.items
          : Array.isArray(fallbackTab?.items)
            ? fallbackTab.items
            : [],
    }
  })
}

function normalizeService(service) {
  const fallback = fallbackServiceConfig[service.title] || fallbackServiceConfig["Web & App Dev"]
  const theme = themePresets[service.theme] ? service.theme : fallback.theme
  return {
    ...service,
    icon: service.icon || fallback.icon,
    theme,
    eyebrow: service.eyebrow || fallback.eyebrow,
    badgeLabel: service.badgeLabel || fallback.badgeLabel,
    tags: Array.isArray(service.tags) && service.tags.length > 0 ? service.tags : fallback.tags,
    detailTabs: normalizeDetailTabs(service.detailTabs, fallback.detailTabs),
  }
}

export function Services() {
  const [services, setServices] = useState(featuredServices)
  const normalizedServices = useMemo(
    () => services.map((service) => normalizeService(service)),
    [services]
  )
  const [activeService, setActiveService] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    apiFetch("/api/services")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setServices(data)
      })
      .catch(() => {})
  }, [])

  const openService = (service) => {
    setActiveService(service)
    setActiveTab(0)
    setOpen(true)
  }

  const currentTab = activeService?.detailTabs?.[activeTab]
  const currentTheme = activeService ? themePresets[activeService.theme] : themePresets.blue

  return (
    <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_55%,#ffffff_100%)]">
      <section className="relative border-b border-fog bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] bg-grid">
        <GradientOrbs />
        <Container className="py-16">
          <SectionBadge>Services</SectionBadge>
          <h1 className="mt-5 text-[40px] font-semibold tracking-[-0.04em] text-ink md:text-[56px]">
            Clear, focused delivery
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] leading-8 text-slate">
            We keep the service list tight so you know exactly what to expect.
            Each engagement starts with clarity on scope, timeline, and outcomes.
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-14">
          <div className="grid gap-6 md:grid-cols-3">
            {normalizedServices.map((service) => {
              const theme = themePresets[service.theme]
              const Icon = iconMap[service.icon] || Monitor

              return (
                <Card
                  key={service._id || service.title}
                  className={`group flex h-full min-h-[500px] cursor-pointer flex-col overflow-hidden rounded-[20px] border bg-white shadow-[0_12px_34px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] ${theme.accentBorder} ${theme.hover}`}
                  onClick={() => openService(service)}
                >
                  <div className={`h-1.5 w-full ${theme.accent}`} />
                  <CardHeader className="pb-0 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${theme.iconWrap}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${theme.badge}`}>
                        {service.badgeLabel || "Service"}
                      </span>
                    </div>
                    <div className="pt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate">
                      {service.eyebrow}
                    </div>
                    <CardTitle className="pt-2 text-[22px] leading-[1.12]">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col pt-3 text-[13.5px] leading-6 text-slate">
                    <p className="line-clamp-3 min-h-[72px]">{service.description}</p>

                    {service.tags?.length ? (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full px-3 py-1 text-[12px] font-medium ${theme.pill}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-3.5">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">
                        Includes
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {(service.includes || []).map((item) => (
                          <div key={item} className="flex items-center gap-2.5 text-ink">
                            <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex-1" />

                    <div className="mt-2.5 border-t border-black/5 pt-3">
                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate">
                            Ideal for
                          </div>
                          <span className={`inline-flex w-full rounded-[15px] px-3 py-1.5 text-[11.5px] font-medium leading-5 ${theme.pill}`}>
                            {service.idealFor}
                          </span>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-2 text-[12px] font-medium text-moss">
                          View more <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[86vh] max-w-3xl overflow-y-auto rounded-[22px] border border-[#dbeafe] p-0 shadow-[0_24px_50px_rgba(15,23,42,0.18)]">
              {activeService ? (
                <div className="relative overflow-hidden rounded-[22px] bg-white">
                  <div className={`h-2 w-full ${currentTheme.accent}`} />
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbeafe] bg-white text-slate transition-colors hover:text-ink"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DialogClose>

                  <div className="p-5 md:p-6">
                    <div className="pr-14">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-moss">
                        {activeService.eyebrow}
                      </div>
                      <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-ink md:text-[28px]">
                        {activeService.title}
                      </h2>
                      <p className="mt-3 max-w-3xl text-[14px] leading-6 text-slate">
                        {activeService.description}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-[200px_1fr]">
                      <div className="space-y-3">
                        {activeService.detailTabs.map((tab, index) => {
                          const TabIcon = tabIconMap[index] || Sparkles
                          const isActive = activeTab === index

                          return (
                            <button
                              key={`${activeService.title}-${tab.title}-${index}`}
                              type="button"
                              onClick={() => setActiveTab(index)}
                              className={`flex w-full items-center gap-3 rounded-[14px] border px-3.5 py-3 text-left transition-colors ${
                                isActive
                                  ? `${currentTheme.accentBorder} ${currentTheme.accentSoft} text-ink shadow-[0_8px_24px_rgba(15,23,42,0.05)]`
                                  : "border-[#e2e8f0] bg-white text-slate hover:bg-[#f8fbff]"
                              }`}
                            >
                              <span className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${currentTheme.iconWrap}`}>
                                <TabIcon className="h-4 w-4" />
                              </span>
                              <span>
                                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate">
                                  Section {index + 1}
                                </span>
                                <span className="mt-1 block text-[13px] font-medium leading-5">
                                  {tab.title}
                                </span>
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      <div className={`rounded-[16px] border p-4 ${currentTheme.accentBorder} ${currentTheme.modalSurface}`}>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">
                          {activeService.title}
                        </div>
                        <div className="mt-2 text-[20px] font-semibold text-ink">
                          {currentTab?.title}
                        </div>
                        <div className="mt-4 grid gap-2">
                          {(currentTab?.items || []).map((item) => (
                            <div
                              key={item}
                              className="flex items-start gap-3 rounded-[12px] border border-white/70 bg-white px-3.5 py-3 text-[13px] leading-6 text-ink shadow-[0_6px_18px_rgba(15,23,42,0.04)]"
                            >
                              <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${currentTheme.iconWrap}`}>
                                <Check className="h-3.5 w-3.5" />
                              </span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-4 rounded-[16px] border border-[#dbeafe] bg-[#f8fbff] p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-[18px] font-semibold text-ink">
                          Get a quote for this service
                        </div>
                        <div className="mt-1 text-[13px] text-slate">
                          No commitment required.
                        </div>
                      </div>
                      <Button asChild className="min-w-[200px]">
                        <Link to="/contact">
                          Start with this service <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </Container>
      </section>
    </div>
  )
}

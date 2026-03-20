import { Link } from "react-router-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { Container } from "@/components/layout/Container"
import { featuredServices, defaultProjects, values } from "@/data/content"
import { apiFetch } from "@/lib/api"
import { PageSkeleton } from "@/components/PageSkeleton"
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Code2,
  Globe,
  Lock,
  Monitor,
  PenTool,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react"

const featureTags = [
  "Modern UX",
  "Reliable builds",
  "Scalable stacks",
  "Secure by design",
]

const DEFAULT_ACCENT_COLOR = "#2F6BFF"

const defaultHomeContent = {
  hero_title: "Build Secure Software That Scales Your Business",
  hero_subtitle: "Modern Software • AI Solutions • Cloud Infrastructure",
  hero_description:
    "We help startups and businesses design, build, and secure high-performance digital products.",
  hero_primary_button_text: "Get a Quote",
  hero_primary_button_link: "/contact",
  hero_secondary_button_text: "View Services",
  hero_secondary_button_link: "/services",
  brand_accent_color: DEFAULT_ACCENT_COLOR,
  trusted_badges: [
    "Startups",
    "Small Businesses",
    "Creators",
    "Local Enterprises",
    "Early Partners",
  ],
  why_choose_items: [
    {
      icon: "Workflow",
      title: "Fast Delivery",
      description: "Rapid development cycles without compromising quality",
    },
    {
      icon: "Sparkles",
      title: "Startup-Friendly Pricing",
      description: "Affordable solutions designed for growing businesses",
    },
    {
      icon: "Code2",
      title: "Modern Tech Stack",
      description: "Built using latest secure and scalable technologies",
    },
    {
      icon: "BadgeCheck",
      title: "Direct Expert Support",
      description: "Work directly with developers, not middlemen",
    },
    {
      icon: "ShieldCheck",
      title: "Secure by Design",
      description: "Security integrated from day one",
    },
  ],
  stats: [
    { value: "20+", label: "Projects Delivered" },
    { value: "10+", label: "Technologies Used" },
    { value: "24/7", label: "Support" },
    { value: "Startup-Friendly", label: "Pricing" },
  ],
}

const fallbackTestimonials = [
  {
    quote:
      "The team kept delivery calm, structured, and transparent from start to finish.",
    name: "Operations Lead",
    role: "Multi-location services business",
  },
  {
    quote:
      "We got cleaner reporting, better visibility, and a product our team actually enjoys using.",
    name: "Founder",
    role: "E-commerce brand",
  },
  {
    quote:
      "Their execution felt senior from day one. Clear scope, solid communication, and no chaos.",
    name: "Product Manager",
    role: "Internal tools team",
  },
]

const serviceVisuals = [
  {
    icon: Monitor,
    iconWrap: "bg-[#eff6ff] text-[#2563eb]",
    border: "border-[#dbeafe] bg-white",
    badge: null,
    short: "Fast, clean, scalable builds",
  },
  {
    icon: ShieldCheck,
    iconWrap: "bg-[#eff6ff] text-[#2563eb]",
    border: "border-[#3b82f6] bg-[#fafcff]",
    badge: { label: "New", className: "bg-[#dbeafe] text-[#1d4ed8]" },
    short: "Protect systems & data",
  },
  {
    icon: PenTool,
    iconWrap: "bg-[#eff6ff] text-[#1d4ed8]",
    border: "border-[#dbeafe] bg-white",
    badge: null,
    short: "Interfaces users love",
  },
  {
    icon: Monitor,
    iconWrap: "bg-[#eff6ff] text-[#2563eb]",
    border: "border-[#dbeafe] bg-white",
    badge: null,
    short: "Focused, practical delivery",
  },
]

const securityTiles = [
  {
    icon: ShieldCheck,
    title: "Threat Detection",
    subtitle: "Real-time monitoring",
  },
  {
    icon: Lock,
    title: "Data Protection",
    subtitle: "Encrypted at every point",
  },
  {
    icon: ScanSearch,
    title: "Security Audit",
    subtitle: "Full vulnerability scan",
  },
  {
    icon: BadgeCheck,
    title: "Compliance",
    subtitle: "GDPR & ISO ready",
  },
]

const iconMap = {
  Monitor,
  ShieldCheck,
  PenTool,
  Lock,
  ScanSearch,
  BadgeCheck,
  Workflow,
  Sparkles,
  Code2,
  Globe,
}

function mergeWithFallback(primary, fallback, count, key) {
  const next = []
  const seen = new Set()

  ;[...(primary || []), ...(fallback || [])].forEach((item) => {
    if (!item) return
    const value = key(item)
    if (!value || seen.has(value) || next.length >= count) return
    seen.add(value)
    next.push(item)
  })

  return next
}

function resolveIcon(name) {
  return iconMap[name] || ShieldCheck
}

function splitHeadline(title = "") {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 2) {
    return {
      prefix: parts[0] || "",
      highlight: parts.slice(1).join(" ") || parts[0] || "",
    }
  }

  return {
    prefix: parts.slice(0, -2).join(" "),
    highlight: parts.slice(-2).join(" "),
  }
}

function SmartLink({ to, className, children }) {
  if (!to) {
    return <span className={className}>{children}</span>
  }

  if (/^(https?:)?\/\//.test(to)) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    )
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}

function BrowserMockup({ caption }) {
  const codeLines = [
    "const deploy = async () => {",
    "  await runSecurityChecks();",
    "  await shipFeature('homepage');",
    "  return reportStatus('stable');",
    "}",
  ]

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#dbeafe] bg-white shadow-[0_24px_60px_rgba(37,99,235,0.10)]">
      <div className="flex items-center gap-2 rounded-t-[18px] bg-[#14213d] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
        <div className="ml-2 h-2.5 flex-1 rounded-full bg-white/10" />
        <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-[#bfdbfe]">
          live typing
        </div>
      </div>
      <div className="rounded-b-[18px] bg-[#0f172a] px-4 py-5">
        <div className="rounded-[14px] border border-white/10 bg-[#091121]/90 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#60a5fa]">
            <span>deploy.ts</span>
            <span>auto-save enabled</span>
          </div>
          <div className="space-y-2 font-mono text-[12px] leading-6 text-[#dbeafe]">
            {codeLines.map((line, index) => (
              <div
                key={line}
                className="overflow-hidden whitespace-nowrap border-r-2 border-[#60a5fa] pr-1 animate-[typing_4.8s_steps(40,end)_infinite,blink_0.9s_step-end_infinite]"
                style={{
                  width: `${line.length + 1}ch`,
                  animationDelay: `${index * 0.35}s, ${index * 0.35}s`,
                }}
              >
                {line}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#1e3a8a] bg-[#0f1b33] px-3 py-2 text-[11px] text-[#93c5fd]">
              build ok
            </div>
            <div className="rounded-xl border border-[#1e3a8a] bg-[#0f1b33] px-3 py-2 text-[11px] text-[#93c5fd]">
              tests pass
            </div>
            <div className="rounded-xl border border-[#1e3a8a] bg-[#0f1b33] px-3 py-2 text-[11px] text-[#93c5fd]">
              secure
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white px-4 py-3 text-[12px] text-[#64748b]">
        {caption || "Clarity-driven product development."}
      </div>
    </div>
  )
}

export function Home() {
  const pageRef = useRef(null)
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [homeContent, setHomeContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    Promise.allSettled([
      apiFetch("/api/services"),
      apiFetch("/api/projects"),
      apiFetch("/api/content/home"),
    ])
      .then(([servicesResult, projectsResult, contentResult]) => {
        if (!mounted) return

        if (servicesResult.status === "fulfilled" && Array.isArray(servicesResult.value) && servicesResult.value.length > 0) {
          const featured = servicesResult.value.filter((item) => item.featured)
          setServices(featured.length > 0 ? featured : servicesResult.value)
        } else {
          setServices(featuredServices)
        }

        if (projectsResult.status === "fulfilled" && Array.isArray(projectsResult.value) && projectsResult.value.length > 0) {
          setProjects(projectsResult.value)
        } else {
          setProjects(defaultProjects)
        }

        if (contentResult.status === "fulfilled" && contentResult.value) {
          const data = contentResult.value
          setHomeContent({
            hero_title: data.hero_title || defaultHomeContent.hero_title,
            hero_subtitle: data.hero_subtitle || defaultHomeContent.hero_subtitle,
            hero_description: data.hero_description || defaultHomeContent.hero_description,
            hero_primary_button_text:
              data.hero_primary_button_text || defaultHomeContent.hero_primary_button_text,
            hero_primary_button_link:
              data.hero_primary_button_link || defaultHomeContent.hero_primary_button_link,
            hero_secondary_button_text:
              data.hero_secondary_button_text || defaultHomeContent.hero_secondary_button_text,
            hero_secondary_button_link:
              data.hero_secondary_button_link || defaultHomeContent.hero_secondary_button_link,
            brand_accent_color:
              data.brand_accent_color || defaultHomeContent.brand_accent_color,
            trusted_badges:
              Array.isArray(data.trusted_badges) && data.trusted_badges.filter(Boolean).length
                ? data.trusted_badges.filter(Boolean)
                : defaultHomeContent.trusted_badges,
            why_choose_items:
              Array.isArray(data.why_choose_items) && data.why_choose_items.length
                ? data.why_choose_items
                : defaultHomeContent.why_choose_items,
            stats:
              Array.isArray(data.stats) && data.stats.length
                ? data.stats
                : defaultHomeContent.stats,
            heroCards: Array.isArray(data.heroCards) ? data.heroCards : [],
            showTestimonials: data.showTestimonials ?? true,
            testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
          })
        } else {
          setHomeContent({
            ...defaultHomeContent,
            heroCards: [],
            showTestimonials: true,
            testimonials: [],
          })
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

  useEffect(() => {
    const scope = pageRef.current
    if (!scope || typeof IntersectionObserver === "undefined") return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    )

    scope.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [services, projects, homeContent])

  useEffect(() => {
    const root = document.documentElement
    const accent = homeContent.brand_accent_color || DEFAULT_ACCENT_COLOR
    root.style.setProperty("--accent-color", accent)

    return () => {
      root.style.setProperty("--accent-color", DEFAULT_ACCENT_COLOR)
    }
  }, [homeContent.brand_accent_color])

  const heroServices = mergeWithFallback(services, featuredServices, 3, (item) => item.title)
  const serviceCards = mergeWithFallback(services, featuredServices, 4, (item) => item.title)
  const selectedProjects = mergeWithFallback(
    projects.some((item) => item.featured) ? projects.filter((item) => item.featured) : projects,
    defaultProjects,
    2,
    (item) => item.name
  )
  const testimonials = (homeContent.testimonials || []).filter(
    (item) => item?.quote || item?.name || item?.role
  ).length
    ? homeContent.testimonials.filter((item) => item?.quote || item?.name || item?.role)
    : fallbackTestimonials
  const trustedBadges = (homeContent.trusted_badges || []).filter(Boolean).length
    ? homeContent.trusted_badges.filter(Boolean)
    : defaultHomeContent.trusted_badges
  const whyChooseItems = (homeContent.why_choose_items || []).filter(
    (item) => item?.title || item?.description
  ).length
    ? homeContent.why_choose_items.filter((item) => item?.title || item?.description)
    : defaultHomeContent.why_choose_items
  const stats = (homeContent.stats || []).filter((item) => item?.value || item?.label).length
    ? homeContent.stats.filter((item) => item?.value || item?.label)
    : defaultHomeContent.stats
  const accentColor = homeContent.brand_accent_color || DEFAULT_ACCENT_COLOR
  const headline = splitHeadline(homeContent.hero_title)
  const accentCardShadow = useMemo(
    () => ({ boxShadow: `0 18px 45px ${accentColor}24` }),
    [accentColor]
  )

  if (loading || !homeContent) {
    return (
      <PageSkeleton
        badge="Home"
        titleWidth="max-w-[520px]"
        chipCount={4}
        cardCount={6}
        cardClassName="min-h-[280px]"
      />
    )
  }

  return (
    <div
      ref={pageRef}
      className="bg-white"
      style={{ "--accent-color": accentColor }}
    >
      <style>{`
        @keyframes typing {
          0%, 18% { max-width: 0; opacity: 0.65; }
          35%, 78% { max-width: 100%; opacity: 1; }
          100% { max-width: 100%; opacity: 1; }
        }

        @keyframes blink {
          0%, 45% { border-color: rgba(96, 165, 250, 0.95); }
          50%, 100% { border-color: transparent; }
        }

        @keyframes floatPanel {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .home-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 620ms ease, transform 620ms ease;
        }

        .home-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-panel-float {
          animation: floatPanel 6s ease-in-out infinite;
        }

        .accent-primary {
          background: var(--accent-color);
          box-shadow: 0 16px 40px color-mix(in srgb, var(--accent-color) 28%, transparent);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .accent-primary:hover {
          transform: translateY(-2px);
          color: #ffffff;
          box-shadow: 0 18px 46px color-mix(in srgb, var(--accent-color) 34%, transparent);
        }

        .accent-outline {
          transition: transform 180ms ease, box-shadow 180ms ease, color 180ms ease, border-color 180ms ease;
        }

        .accent-outline:hover {
          transform: translateY(-2px);
          border-color: var(--accent-color);
          color: var(--accent-color);
          box-shadow: 0 12px 28px color-mix(in srgb, var(--accent-color) 18%, transparent);
        }

        .accent-pill {
          transition: transform 180ms ease, box-shadow 180ms ease, color 180ms ease, border-color 180ms ease;
        }

        .accent-pill:hover {
          transform: translateY(-2px);
          color: var(--accent-color);
          border-color: color-mix(in srgb, var(--accent-color) 35%, white);
          box-shadow: 0 12px 28px color-mix(in srgb, var(--accent-color) 14%, transparent);
        }

        .accent-card {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }

        .accent-card:hover {
          transform: translateY(-6px);
          border-color: color-mix(in srgb, var(--accent-color) 34%, white);
          box-shadow: 0 18px 44px color-mix(in srgb, var(--accent-color) 15%, transparent);
        }
      `}</style>
      <section className="border-b border-fog bg-white">
        <Container className="px-4 py-12 sm:px-6 md:grid md:grid-cols-[1.02fr_0.98fr] md:py-16">
          <div className="pr-0 md:pr-12 home-reveal" data-reveal>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-medium"
              style={{
                borderColor: `${accentColor}33`,
                backgroundColor: `${accentColor}12`,
                color: accentColor,
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
              {homeContent.hero_subtitle}
            </div>

            <h1 className="mt-7 max-w-[12ch] text-[36px] font-bold leading-[1.02] tracking-[-0.05em] text-[#0f172a] sm:text-[44px] md:text-[58px]">
              {headline.prefix} <span style={{ color: accentColor }}>{headline.highlight}</span>
            </h1>

            <p className="mt-6 max-w-[560px] text-[15px] leading-[1.85] text-[#475569] sm:text-[16px]">
              {homeContent.hero_description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <SmartLink
                to={homeContent.hero_primary_button_link}
                className="accent-primary inline-flex items-center gap-2 rounded-[11px] px-6 py-[13px] text-[14px] font-medium text-white"
              >
                {homeContent.hero_primary_button_text} <ArrowRight className="h-4 w-4" />
              </SmartLink>
              <SmartLink
                to={homeContent.hero_secondary_button_link}
                className="accent-outline inline-flex items-center rounded-[11px] border border-[#cbd5e1] bg-white px-6 py-[13px] text-[14px] font-medium text-[#0f172a]"
              >
                {homeContent.hero_secondary_button_text}
              </SmartLink>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {heroServices.map((service, index) => {
                const visual = serviceVisuals[index] || serviceVisuals[0]
                const Icon = visual.icon

                return (
                  <article
                    key={service.title}
                    className="accent-card rounded-[15px] border border-fog bg-white px-6 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                        style={{
                          backgroundColor: `${accentColor}12`,
                          color: accentColor,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {visual.badge ? (
                        <span
                          className="rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide"
                          style={{
                            backgroundColor: `${accentColor}14`,
                            color: accentColor,
                          }}
                        >
                          {visual.badge.label}
                        </span>
                      ) : null}
                    </div>
                    <div className="max-w-[14ch] text-[15px] font-semibold leading-[1.3] text-[#0f172a]">
                      {service.title}
                    </div>
                    <div className="mt-2 pr-1 text-[12.5px] leading-[1.65] text-[#64748b]">
                      {service.description || visual.short}
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
              {featureTags.map((tag) => (
                <div key={tag} className="flex items-center gap-2 text-[12.5px] text-[#64748b]">
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${accentColor}14`,
                      color: accentColor,
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  {tag}
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-10 border-l-0 border-fog bg-[#f8fbff] pl-0 pt-0 md:mt-0 md:border-l md:pl-8 home-reveal"
            data-reveal
          >
            <div className="space-y-4">
              <div className="hero-panel-float">
                <BrowserMockup caption={homeContent.heroCards?.[0]?.caption} />
              </div>

              <div
                className="rounded-[18px] bg-[#0f172a] p-5 shadow-[0_20px_45px_rgba(15,23,42,0.18)]"
                style={accentCardShadow}
              >
                <div
                  className="inline-flex rounded-full px-3 py-1 text-[10px] font-medium text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Cybersecurity Services
                </div>
                <div className="mt-4 text-[16px] font-bold text-white">
                  Security built into every layer
                </div>
                <div className="mt-2 max-w-md text-[12.5px] leading-5 text-[#bfdbfe]">
                  {homeContent.heroCards?.[1]?.caption ||
                    "We audit, protect, and monitor your systems so threats never reach your users."}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {securityTiles.map((tile) => {
                    const Icon = tile.icon
                    return (
                      <div
                        key={tile.title}
                        className="rounded-[13px] border border-white/10 bg-white/5 p-3 transition-transform duration-200 hover:-translate-y-1"
                      >
                        <Icon className="h-4 w-4" style={{ color: accentColor }} />
                        <div className="mt-3 text-[12px] font-medium text-white">
                          {tile.title}
                        </div>
                        <div className="mt-1 text-[11px] text-[#94a3b8]">
                          {tile.subtitle}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[18px] border border-[#dbeafe] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#9ca3af]">
                  What you can expect
                </div>
                <div className="mt-4 space-y-4">
                  {values.map((value) => (
                    <div key={value.title} className="flex gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: `${accentColor}14`,
                          color: accentColor,
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <div>
                        <div className="text-[13.5px] font-semibold text-[#0f172a]">
                          {value.title}
                        </div>
                        <div className="mt-1 text-[12.5px] leading-5 text-[#64748b]">
                          {value.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-fog bg-[#f8fbff]">
        <Container className="py-6">
          <div className="home-reveal" data-reveal>
            <div className="text-center text-[11.5px] font-medium uppercase tracking-[0.24em] text-[#94a3b8]">
              Trusted by growing startups and businesses
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {trustedBadges.map((badge) => (
                <div
                  key={badge}
                  className="accent-pill inline-flex items-center rounded-full border border-[#dbeafe] bg-white px-4 py-2 text-[12px] font-medium text-[#334155]"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="home-reveal" data-reveal>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9ca3af]">
              Why VUN Tech
            </div>
            <h2 className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#0f172a] sm:text-[34px]">
              Why Choose VUN Tech
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {whyChooseItems.map((item, index) => {
              const Icon = resolveIcon(item.icon)

              return (
                <article
                  key={`${item.title}-${index}`}
                  className="home-reveal accent-card rounded-[18px] border border-fog bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.04)]"
                  data-reveal
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[14px]"
                    style={{
                      backgroundColor: `${accentColor}12`,
                      color: accentColor,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-[16px] font-semibold text-[#0f172a]">
                    {item.title}
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.75] text-[#64748b]">
                    {item.description}
                  </p>
                </article>
              )
            })}
          </div>
        </Container>
      </section>

      <section className="bg-[#f8fbff] py-8">
        <Container>
          <div className="grid gap-4 rounded-[24px] border border-fog bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:grid-cols-4">
            {stats.map((item, index) => (
              <div
                key={`${item.value}-${item.label}-${index}`}
                className="home-reveal rounded-[16px] border border-transparent px-2 py-3 text-center transition-all duration-200 hover:bg-[var(--accent-soft)]"
                data-reveal
              >
                <div
                  className="text-[26px] font-bold tracking-[-0.05em]"
                  style={{ color: accentColor }}
                >
                  {item.value}
                </div>
                <div className="mt-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#64748b]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f8fbff] py-16">
        <Container>
          <div
            className="home-reveal mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
            data-reveal
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9ca3af]">
                What we do
              </div>
              <h2 className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#0f172a] sm:text-[34px]">
                Services
              </h2>
              <p className="mt-2 text-[14px] text-[#64748b]">
                Focused, practical offerings.
              </p>
            </div>
            <Link
              to="/services"
              className="accent-outline inline-flex items-center gap-2 self-start rounded-[10px] border border-[#cbd5e1] bg-white px-4 py-2.5 text-[12.5px] font-medium text-[#0f172a]"
            >
              All services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {serviceCards.map((service, index) => {
              const visual = serviceVisuals[index] || serviceVisuals[0]
              const Icon = visual.icon
              const isSecurity = /security|compliance|cyber/i.test(
                `${service.title} ${service.categoryTitle || ""}`
              )

              return (
                <article
                  key={service.title}
                  className={`home-reveal accent-card min-w-[285px] rounded-[18px] border bg-white p-[24px] shadow-[0_12px_34px_rgba(15,23,42,0.04)] md:min-w-0 ${
                    index === 3 ? "md:col-start-1" : ""
                  } ${isSecurity ? "border-[#3b82f6]" : "border-fog"}`}
                  data-reveal
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                      style={{
                        backgroundColor: `${accentColor}12`,
                        color: accentColor,
                        border: isSecurity ? `1px solid ${accentColor}` : "none",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {isSecurity ? (
                      <span
                        className="rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide"
                        style={{
                          backgroundColor: `${accentColor}14`,
                          color: accentColor,
                        }}
                      >
                        New
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-5 text-[16px] font-semibold text-[#0f172a]">
                    {service.title}
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.7] text-[#64748b]">
                    {service.description}
                  </p>
                  <div className="mt-4 space-y-2 text-[12px] text-[#64748b]">
                    {(service.includes || []).slice(0, 3).map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/services"
                    className="mt-5 inline-flex items-center gap-1 text-[12px] font-semibold"
                    style={{ color: accentColor }}
                  >
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                  <div className="mt-5 border-t border-fog pt-4 text-[10px] uppercase tracking-[0.18em] text-[#9ca3af]">
                    Ideal for: {service.idealFor}
                  </div>
                </article>
              )
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <div className="home-reveal mb-8" data-reveal>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9ca3af]">
              Portfolio
            </div>
            <h2 className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#0f172a] sm:text-[34px]">
              Selected work
            </h2>
            <p className="mt-2 text-[14px] text-[#64748b]">
              Practical solutions built for real operations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:justify-items-center">
            {selectedProjects.map((project) => {
              const isSecurity = /security|secure|cyber/i.test(
                `${project.name} ${project.industry || ""}`
              )

              return (
                <article
                  key={project.name}
                  className="home-reveal w-full max-w-[560px] rounded-[18px] border border-fog bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-transform duration-200 hover:-translate-y-1"
                  data-reveal
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: `${accentColor}14`,
                        color: accentColor,
                      }}
                    >
                      {project.badgeLabel || (isSecurity ? "Security" : "Web App")}
                    </span>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
                      {project.domain || project.industry}
                    </div>
                  </div>
                  <div className="mt-4 text-[20px] font-semibold leading-[1.2] text-[#0f172a]">
                    {project.name}
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.75] text-[#64748b]">
                    {project.description}
                  </p>
                  {project.outcome ? (
                    <div
                      className="mt-4 rounded-[14px] px-4 py-3 text-[12px] leading-6"
                      style={{
                        backgroundColor: `${accentColor}0d`,
                        color: accentColor,
                      }}
                    >
                      Outcome: {project.outcome}
                    </div>
                  ) : null}
                  <a
                    href={project.link || "/work"}
                    target={project.link ? "_blank" : undefined}
                    rel={project.link ? "noreferrer" : undefined}
                    className="mt-5 inline-flex items-center gap-1 text-[12px] font-medium"
                    style={{ color: accentColor }}
                  >
                    View details <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              )
            })}
          </div>
        </Container>
      </section>

      {homeContent.showTestimonials !== false ? (
        <section className="bg-white py-16">
          <Container>
            <div className="home-reveal mb-8" data-reveal>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9ca3af]">
                Testimonials
              </div>
              <h2 className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#0f172a] sm:text-[34px]">
                What clients say
              </h2>
              <p className="mt-2 text-[14px] text-[#64748b]">
                Real feedback from teams we have helped ship with more clarity.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <article
                  key={`${testimonial.name || "testimonial"}-${index}`}
                  className="home-reveal rounded-[18px] border border-[#dbeafe] bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)]"
                  data-reveal
                >
                  <div className="text-[28px] leading-none" style={{ color: accentColor }}>
                    "
                  </div>
                  <p className="mt-3 text-[14px] leading-7 text-[#475569]">
                    {testimonial.quote}
                  </p>
                  <div className="mt-5 border-t border-fog pt-4">
                    <div className="text-[14px] font-semibold text-[#0f172a]">
                      {testimonial.name}
                    </div>
                    <div className="mt-1 text-[12px] text-[#64748b]">
                      {testimonial.role}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </div>
  )
}

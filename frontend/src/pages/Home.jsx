import { Link } from "react-router-dom"
import { lazy, startTransition, useEffect, useRef, useState } from "react"
import { Container } from "@/components/layout/Container"
import { OptimizedImage } from "@/components/OptimizedImage"
import { LazySection } from "@/components/performance/LazySection"
import { featuredServices, defaultProjects, values } from "@/data/content"
import { apiFetch } from "@/lib/api"
import { Seo } from "@/components/seo/Seo"
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Lock,
  Monitor,
  PenTool,
  ScanSearch,
  ShieldCheck,
} from "lucide-react"

const TrustedBadgesSection = lazy(() =>
  import("@/components/home/TrustedBadgesSection").then((m) => ({
    default: m.TrustedBadgesSection,
  }))
)
const WhyChooseSection = lazy(() =>
  import("@/components/home/WhyChooseSection").then((m) => ({
    default: m.WhyChooseSection,
  }))
)
const StatsSection = lazy(() =>
  import("@/components/home/StatsSection").then((m) => ({
    default: m.StatsSection,
  }))
)
const ServicesSection = lazy(() =>
  import("@/components/home/ServicesSection").then((m) => ({
    default: m.ServicesSection,
  }))
)
const PortfolioSection = lazy(() =>
  import("@/components/home/PortfolioSection").then((m) => ({
    default: m.PortfolioSection,
  }))
)
const TestimonialsSection = lazy(() =>
  import("@/components/home/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
  }))
)

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
        <div className="mb-4 flex items-center justify-between gap-4 rounded-[14px] border border-[#1e3a8a] bg-[#091121]/90 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#60a5fa]">
              VUN Tech
            </div>
            <div className="mt-2 max-w-[18ch] text-[14px] font-semibold leading-5 text-white">
              Reliable product delivery with a lighter, faster hero asset.
            </div>
          </div>
          <OptimizedImage
            src="/vun-logo.webp"
            alt="VUN Tech brand mark"
            width={320}
            height={320}
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 168px, 128px"
            className="h-24 w-24 shrink-0 object-contain sm:h-28 sm:w-28"
          />
        </div>
        <div className="rounded-[14px] border border-white/10 bg-[#091121]/90 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#60a5fa]">
            <span>deploy.ts</span>
            <span>auto-save enabled</span>
          </div>
          <div className="space-y-2 font-mono text-[12px] leading-6 text-[#dbeafe]">
            {codeLines.map((line, index) => (
              <div
                key={line}
                className="overflow-hidden whitespace-nowrap pr-1"
                style={{
                  width: `${line.length + 1}ch`,
                  opacity: 1 - index * 0.08,
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

function HomeSectionFallback({ className = "", height = "320px" }) {
  return (
    <section className={className} aria-hidden="true">
      <Container className="py-6">
        <div
          className="rounded-[24px] border border-fog bg-white/70 shadow-[0_12px_34px_rgba(15,23,42,0.03)]"
          style={{ minHeight: height }}
        />
      </Container>
    </section>
  )
}

export function Home() {
  const pageRef = useRef(null)
  const revealObserverRef = useRef(null)
  const [services, setServices] = useState(featuredServices)
  const [projects, setProjects] = useState(defaultProjects)
  const [homeContent, setHomeContent] = useState({
    ...defaultHomeContent,
    heroCards: [],
    showTestimonials: true,
    testimonials: [],
  })

  useEffect(() => {
    let mounted = true
    let idleId
    let timeoutId

    const loadHomeData = () =>
      Promise.allSettled([
        apiFetch("/api/services"),
        apiFetch("/api/projects"),
        apiFetch("/api/content/home"),
      ]).then(([servicesResult, projectsResult, contentResult]) => {
        if (!mounted) return

        startTransition(() => {
          if (
            servicesResult.status === "fulfilled" &&
            Array.isArray(servicesResult.value) &&
            servicesResult.value.length > 0
          ) {
            const featured = servicesResult.value.filter((item) => item.featured)
            setServices(featured.length > 0 ? featured : servicesResult.value)
          } else {
            setServices(featuredServices)
          }

          if (
            projectsResult.status === "fulfilled" &&
            Array.isArray(projectsResult.value) &&
            projectsResult.value.length > 0
          ) {
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
          }
        })
      })

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(loadHomeData, { timeout: 1800 })
    } else {
      timeoutId = window.setTimeout(loadHomeData, 600)
    }

    return () => {
      mounted = false
      if (typeof window !== "undefined" && idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  useEffect(() => {
    const scope = pageRef.current
    if (!scope || typeof IntersectionObserver === "undefined") return undefined

    if (!revealObserverRef.current) {
      revealObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible")
              revealObserverRef.current?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
      )
    }

    scope.querySelectorAll("[data-reveal]").forEach((element) => {
      if (element.dataset.revealObserved === "true") return
      element.dataset.revealObserved = "true"
      revealObserverRef.current.observe(element)
    })

    return undefined
  })

  useEffect(() => {
    return () => revealObserverRef.current?.disconnect()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const accent = homeContent?.brand_accent_color || DEFAULT_ACCENT_COLOR
    root.style.setProperty("--accent-color", accent)

    return () => {
      root.style.setProperty("--accent-color", DEFAULT_ACCENT_COLOR)
    }
  }, [homeContent?.brand_accent_color])

  const resolvedHomeContent = homeContent
  const heroServices = mergeWithFallback(services, featuredServices, 3, (item) => item.title)
  const serviceCards = mergeWithFallback(services, featuredServices, 4, (item) => item.title)
  const selectedProjects = mergeWithFallback(
    projects.some((item) => item.featured) ? projects.filter((item) => item.featured) : projects,
    defaultProjects,
    2,
    (item) => item.name
  )
  const testimonials = (resolvedHomeContent.testimonials || []).filter(
    (item) => item?.quote || item?.name || item?.role
  ).length
    ? resolvedHomeContent.testimonials.filter((item) => item?.quote || item?.name || item?.role)
    : fallbackTestimonials
  const trustedBadges = (resolvedHomeContent.trusted_badges || []).filter(Boolean).length
    ? resolvedHomeContent.trusted_badges.filter(Boolean)
    : defaultHomeContent.trusted_badges
  const whyChooseItems = (resolvedHomeContent.why_choose_items || []).filter(
    (item) => item?.title || item?.description
  ).length
    ? resolvedHomeContent.why_choose_items.filter((item) => item?.title || item?.description)
    : defaultHomeContent.why_choose_items
  const stats = (resolvedHomeContent.stats || []).filter((item) => item?.value || item?.label).length
    ? resolvedHomeContent.stats.filter((item) => item?.value || item?.label)
    : defaultHomeContent.stats
  const accentColor = resolvedHomeContent.brand_accent_color || DEFAULT_ACCENT_COLOR
  const headline = splitHeadline(resolvedHomeContent.hero_title)
  const accentCardShadow = { boxShadow: `0 18px 45px ${accentColor}24` }

  return (
    <div
      ref={pageRef}
      className="bg-white"
      style={{ "--accent-color": accentColor }}
    >
      <Seo
        title="VUN Tech"
        description="Reliable software delivery with clear scope, honest timelines, and modern UX."
        image="/vun-logo.webp"
      />
      <style>{`
        .home-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 620ms ease, transform 620ms ease;
        }

        .home-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
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
          <div className="pr-0 md:pr-12">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-medium"
              style={{
                borderColor: `${accentColor}33`,
                backgroundColor: `${accentColor}12`,
                color: accentColor,
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
              {resolvedHomeContent.hero_subtitle}
            </div>

            <h1 className="mt-7 max-w-[12ch] text-[36px] font-bold leading-[1.02] tracking-[-0.05em] text-[#0f172a] sm:text-[44px] md:text-[58px]">
              {headline.prefix} <span style={{ color: accentColor }}>{headline.highlight}</span>
            </h1>

            <p className="mt-6 max-w-[560px] text-[15px] leading-[1.85] text-[#475569] sm:text-[16px]">
              {resolvedHomeContent.hero_description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <SmartLink
                to={resolvedHomeContent.hero_primary_button_link}
                className="accent-primary inline-flex items-center gap-2 rounded-[11px] px-6 py-[13px] text-[14px] font-medium text-white"
              >
                {resolvedHomeContent.hero_primary_button_text} <ArrowRight className="h-4 w-4" />
              </SmartLink>
              <SmartLink
                to={resolvedHomeContent.hero_secondary_button_link}
                className="accent-outline inline-flex items-center rounded-[11px] border border-[#cbd5e1] bg-white px-6 py-[13px] text-[14px] font-medium text-[#0f172a]"
              >
                {resolvedHomeContent.hero_secondary_button_text}
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
            className="mt-10 border-l-0 border-fog bg-[#f8fbff] pl-0 pt-0 md:mt-0 md:border-l md:pl-8"
          >
            <div className="space-y-4">
              <BrowserMockup caption={resolvedHomeContent.heroCards?.[0]?.caption} />

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
                  {resolvedHomeContent.heroCards?.[1]?.caption ||
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
                        <div className="mt-1 text-[11px] text-[#cbd5e1]">
                          {tile.subtitle}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[18px] border border-[#dbeafe] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
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

      <LazySection
        containIntrinsicSize="180px"
        fallback={<HomeSectionFallback className="border-y border-fog bg-[#f8fbff]" height="160px" />}
      >
        <TrustedBadgesSection trustedBadges={trustedBadges} />
      </LazySection>

      <LazySection
        containIntrinsicSize="720px"
        fallback={<HomeSectionFallback className="bg-white" height="720px" />}
      >
        <WhyChooseSection whyChooseItems={whyChooseItems} accentColor={accentColor} />
      </LazySection>

      <LazySection
        containIntrinsicSize="220px"
        fallback={<HomeSectionFallback className="bg-[#f8fbff]" height="220px" />}
      >
        <StatsSection stats={stats} accentColor={accentColor} />
      </LazySection>

      <LazySection
        containIntrinsicSize="860px"
        fallback={<HomeSectionFallback className="bg-[#f8fbff]" height="860px" />}
      >
        <ServicesSection serviceCards={serviceCards} accentColor={accentColor} />
      </LazySection>

      <LazySection
        containIntrinsicSize="760px"
        fallback={<HomeSectionFallback className="bg-white" height="760px" />}
      >
        <PortfolioSection selectedProjects={selectedProjects} accentColor={accentColor} />
      </LazySection>

      {resolvedHomeContent.showTestimonials !== false ? (
        <LazySection
          containIntrinsicSize="620px"
          fallback={<HomeSectionFallback className="bg-white" height="620px" />}
        >
          <TestimonialsSection testimonials={testimonials} accentColor={accentColor} />
        </LazySection>
      ) : null}
    </div>
  )
}

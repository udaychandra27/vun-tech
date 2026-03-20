import { useEffect, useState } from "react"
import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionBadge, GradientOrbs } from "@/components/Decorations"
import { apiFetch, API_URL } from "@/lib/api"
import { Linkedin } from "lucide-react"
import { OptimizedImage } from "@/components/OptimizedImage"
import { PageSkeleton } from "@/components/PageSkeleton"

const defaultApproach = [
  {
    title: "Discovery",
    description: "We define scope, outcomes, risks, and a practical roadmap.",
  },
  {
    title: "Delivery",
    description: "Weekly updates, tight feedback loops, and clear milestones.",
  },
  {
    title: "Stewardship",
    description: "We document, maintain, and improve the system after launch.",
  },
]

const defaultTeam = [
  {
    name: "Uday Chandra",
    role: "Founder & Delivery Lead",
    bio: "Focused on clear scope, dependable execution, and long-term maintainability.",
    imageUrl: "",
  },
  {
    name: "Vaani Sharma",
    role: "Product & Client Strategy",
    bio: "Focused on clear scope, dependable execution, and long-term maintainability.",
    imageUrl: "",
  },
  {
    name: "Nitesh Pal",
    role: "Engineering & Systems",
    bio: "Focused on clear scope, dependable execution, and long-term maintainability.",
    imageUrl: "",
  },
]

export function About() {
  const storedTeam =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("aboutTeamMembers") || "null")
      : null
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const fallbackContent = {
    heroTitle: "Small team, serious delivery",
    heroSubtitle:
      "We are a focused group of engineers and product strategists. Our work is grounded in honesty, simple execution, and measurable progress.",
    approach: defaultApproach,
    team:
      Array.isArray(storedTeam) && storedTeam.length > 0 ? storedTeam : defaultTeam,
    highlightTitle: "Built for teams that value clarity",
    highlightSubtitle:
      "We partner with founders and ops leaders who want dependable delivery, transparent communication, and systems that scale without drama.",
    highlightPoints: [
      "Senior-led delivery with weekly checkpoints",
      "Clear scope, timelines, and measurable outcomes",
      "Practical engineering that lasts beyond launch",
    ],
    closingNote:
      "We work best with teams who value clear communication, respect time, and want solutions that last. If that sounds like you, we should talk.",
  }

  const resolveImageUrl = (url) => {
    if (!url) return ""
    const normalized = url.replace(/\\/g, "/")
    if (normalized.startsWith("http") || normalized.startsWith("data:")) {
      return normalized
    }
    if (normalized.startsWith("uploads/")) return `${API_URL}/${normalized}`
    if (normalized.startsWith("/uploads/")) return `${API_URL}${normalized}`
    return normalized
  }

  useEffect(() => {
    let mounted = true
    apiFetch("/api/content/about")
      .then((data) => {
        if (!mounted) return
        if (!data) {
          setContent(fallbackContent)
          return
        }
        setContent((prev) => ({
          ...(prev || fallbackContent),
          ...data,
          approach: data.approach?.length ? data.approach : (prev || fallbackContent).approach,
          team: data.team?.length ? data.team : (prev || fallbackContent).team,
          highlightTitle: data.highlightTitle || (prev || fallbackContent).highlightTitle,
          highlightSubtitle:
            data.highlightSubtitle || (prev || fallbackContent).highlightSubtitle,
          highlightPoints: data.highlightPoints?.length
            ? data.highlightPoints
            : (prev || fallbackContent).highlightPoints,
          closingNote: data.closingNote || (prev || fallbackContent).closingNote,
        }))
        if (Array.isArray(data.team) && data.team.length > 0) {
          localStorage.setItem("aboutTeamMembers", JSON.stringify(data.team))
        }
      })
      .catch(() => {
        if (mounted) {
          setContent({
            ...fallbackContent,
            team: Array.isArray(storedTeam) && storedTeam.length > 0 ? storedTeam : defaultTeam,
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

  if (loading || !content) {
    return (
      <PageSkeleton
        badge="About"
        titleWidth="max-w-[420px]"
        cardCount={6}
        columnsClassName="md:grid-cols-3"
        cardClassName="min-h-[240px]"
      />
    )
  }

  return (
    <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_55%,#ffffff_100%)]">
      <section className="relative border-b border-fog bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] bg-grid">
        <GradientOrbs />
        <Container className="py-16">
          <SectionBadge>About</SectionBadge>
          <h1 className="mt-5 text-[40px] font-semibold tracking-[-0.04em] text-ink md:text-[56px]">
            {content.heroTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] leading-8 text-slate">
            {content.heroSubtitle}
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-14">
          <div className="mb-10 rounded-[24px] border border-[#dbeafe] bg-white/90 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
                  Why teams choose us
                </div>
                <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-ink">
                  {content.highlightTitle}
                </h2>
                <p className="mt-4 text-[15px] leading-7 text-slate">
                  {content.highlightSubtitle}
                </p>
              </div>
              <div className="grid gap-3">
                {content.highlightPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[16px] border border-[#bfdbfe] bg-[#f8fbff] px-4 py-4 text-[14px] text-ink"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {content.approach.map((step) => (
              <Card
                key={step.title}
                className="rounded-[18px] border-[#dbeafe] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.04)]"
              >
                <CardHeader>
                  <CardTitle className="text-[24px]">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-[14px] leading-7 text-slate">
                  {step.description}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10">
            <h2 className="text-[30px] font-semibold tracking-[-0.03em]">Team</h2>
            <p className="mt-2 text-[15px] text-slate">
              A small, senior team focused on clarity and delivery.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {content.team.map((member) => (
                <Card key={member.name} className="team-card glass-card border-[#dbeafe] bg-white">
                  <CardHeader className="items-center pt-8 text-center">
                    <div className="team-avatar">
                      <span className="team-initials">
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      {member.imageUrl ? (
                        <OptimizedImage
                          src={resolveImageUrl(member.imageUrl)}
                          alt={member.name}
                          width={600}
                          height={600}
                          className="team-avatar-image"
                          onLoad={(e) => {
                            const initials = e.currentTarget.previousSibling
                            if (initials) initials.style.opacity = "0"
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            const initials = e.currentTarget.previousSibling
                            if (initials) initials.style.opacity = "1"
                          }}
                        />
                      ) : null}
                    </div>
                    <CardTitle className="mt-5 text-[24px] font-semibold text-[#0f172a]">
                      {member.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-8 text-center text-[14px] text-slate">
                    <div className="font-medium text-slate-500">{member.role}</div>
                    {member.linkedinUrl && (
                      <a
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb]"
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="mt-10 rounded-[18px] border border-[#dbeafe] bg-white p-6 text-[15px] leading-7 text-slate shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
            {content.closingNote}
          </div>
        </Container>
      </section>
    </div>
  )
}

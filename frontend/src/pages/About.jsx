import { useEffect, useState } from "react"
import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionBadge, GradientOrbs } from "@/components/Decorations"
import { apiFetch, API_URL } from "@/lib/api"
import { Linkedin } from "lucide-react"
import { OptimizedImage } from "@/components/OptimizedImage"

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
  const [content, setContent] = useState({
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
  })

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
        if (!mounted || !data) return
        setContent((prev) => ({
          ...prev,
          ...data,
          approach: data.approach?.length ? data.approach : prev.approach,
          team: data.team?.length ? data.team : prev.team,
          highlightTitle: data.highlightTitle || prev.highlightTitle,
          highlightSubtitle: data.highlightSubtitle || prev.highlightSubtitle,
          highlightPoints: data.highlightPoints?.length
            ? data.highlightPoints
            : prev.highlightPoints,
          closingNote: data.closingNote || prev.closingNote,
        }))
        if (Array.isArray(data.team) && data.team.length > 0) {
          localStorage.setItem("aboutTeamMembers", JSON.stringify(data.team))
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="bg-sand">
      <section className="relative border-b border-fog bg-sand bg-grid">
        <GradientOrbs />
        <Container className="py-14">
          <SectionBadge>About</SectionBadge>
          <h1 className="text-4xl font-semibold">{content.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate">
            {content.heroSubtitle}
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-12">
          <div className="mb-10 rounded-3xl border border-fog bg-white/70 p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/60">
                  Why teams choose us
                </div>
                <h2 className="mt-3 text-3xl font-semibold text-ink">
                  {content.highlightTitle}
                </h2>
                <p className="mt-3 text-slate">{content.highlightSubtitle}</p>
              </div>
              <div className="grid gap-3">
                {content.highlightPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-fog bg-sand px-4 py-3 text-sm text-ink"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {content.approach.map((step) => (
              <Card key={step.title}>
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate">
                  {step.description}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10">
            <h2 className="text-2xl font-semibold">Team</h2>
            <p className="mt-2 text-sm text-slate">
              A small, senior team focused on clarity and delivery.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {content.team.map((member) => (
                <Card key={member.name} className="team-card glass-card">
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
                    <CardTitle className="mt-5 text-xl font-semibold text-[#3b1d79]">
                      {member.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-8 text-center text-sm text-slate">
                    <div className="font-medium text-slate-500">{member.role}</div>
                    {member.linkedinUrl && (
                      <a
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0a66c2]"
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
          <div className="mt-10 rounded-xl border border-fog bg-white p-6 text-sm text-slate">
            {content.closingNote}
          </div>
        </Container>
      </section>
    </div>
  )
}

import { useEffect, useState } from "react"
import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionBadge, GradientOrbs } from "@/components/Decorations"
import { apiFetch, API_URL } from "@/lib/api"

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
  const storedGallery =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("aboutGalleryImages") || "null")
      : null
  const [content, setContent] = useState({
    heroTitle: "Small team, serious delivery",
    heroSubtitle:
      "We are a focused group of engineers and product strategists. Our work is grounded in honesty, simple execution, and measurable progress.",
    approach: defaultApproach,
    team: defaultTeam,
    galleryImages:
      Array.isArray(storedGallery) && storedGallery.length === 3
        ? storedGallery
        : ["/images/about-1.svg", "/images/about-2.svg", "/images/about-3.svg"],
    closingNote:
      "We work best with teams who value clear communication, respect time, and want solutions that last. If that sounds like you, we should talk.",
  })
  const fallbackGallery = ["/images/about-1.svg", "/images/about-2.svg", "/images/about-3.svg"]

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
          galleryImages: data.galleryImages?.length
            ? data.galleryImages
            : prev.galleryImages,
          closingNote: data.closingNote || prev.closingNote,
        }))
        if (data.galleryImages?.length === 3) {
          localStorage.setItem(
            "aboutGalleryImages",
            JSON.stringify(data.galleryImages)
          )
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    content.galleryImages.forEach((url) => {
      const image = new Image()
      image.src = resolveImageUrl(url)
    })
  }, [content.galleryImages])

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
          <div className="mb-10 grid gap-6 md:grid-cols-3">
            {content.galleryImages.map((imageUrl, index) => (
              <img
                key={`about-gallery-${index}`}
                src={resolveImageUrl(imageUrl)}
                alt="About gallery"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                className="h-48 w-full rounded-2xl border border-fog object-cover"
                onError={(e) => {
                  e.currentTarget.src = fallbackGallery[index] || "/images/about-1.svg"
                }}
              />
            ))}
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
                        <img
                          src={resolveImageUrl(member.imageUrl)}
                          alt={member.name}
                          loading="lazy"
                          decoding="async"
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
                    <div className="font-medium text-slate-500">
                      {member.role}
                    </div>
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

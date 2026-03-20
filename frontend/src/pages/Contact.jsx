import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  ClipboardList,
  Link2,
  Linkedin,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  Send,
} from "lucide-react"
import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SectionBadge, GradientOrbs } from "@/components/Decorations"
import { featuredServices } from "@/data/content"
import { apiFetch } from "@/lib/api"
import { PageSkeleton } from "@/components/PageSkeleton"

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  serviceNeeded: "",
  message: "",
  referenceLink: "",
  website: "",
  humanCheck: "",
}

const initialContent = {
  heroTitle: "Tell us about your project",
  heroSubtitle:
    "Share what you are building and what success looks like. We will reply with clear next steps, usually within one business day.",
  trustPoints: [
    "Replies within one business day",
    "No commitment required",
    "Clear scope before we start",
  ],
  formTitle: "Project inquiry",
  formStatusLabel: "Accepting projects",
  serviceFieldLabel: "Service needed",
  directTitle: "Direct contact",
  email: import.meta.env.VITE_CONTACT_EMAIL || "hello@techservices.agency",
  whatsappUrl: import.meta.env.VITE_WHATSAPP_URL || "https://wa.me/1234567890",
  linkedinUrl: "",
  linkedinLabel: "VUN Tech",
  locationText: "We are based in the US and work remotely.",
  nextStepsTitle: "What happens next",
  nextSteps: [
    "We review your request and understand the brief.",
    "We confirm scope, priorities, and any open questions.",
    "You get clear next steps for moving forward.",
  ],
  requirementsTitle: "What we need from you",
  requirements: [
    "A short description of the project and what success looks like.",
    "Any existing links, docs, references, or technical context.",
    "Optional files that help us understand the work faster.",
  ],
  attachmentHint: "Optional upload: PDF, DOCX, or JPG up to 5MB.",
  linkFieldLabel: "Reference link",
}

function ContactMethod({ icon, label, value, href, accent = "blue" }) {
  const accents = {
    blue: "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]",
    green: "border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a]",
  }
  const IconComponent = icon

  return (
    <div className="flex items-start gap-4 rounded-[18px] border border-[#e2e8f0] bg-white px-4 py-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border ${accents[accent] || accents.blue}`}
      >
        <IconComponent className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate">
          {label}
        </div>
        {href ? (
          <a
            href={href}
            className="mt-1 block break-all text-[16px] font-medium leading-6 text-[#2563eb]"
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
          >
            {value}
          </a>
        ) : (
          <div className="mt-1 text-[15px] leading-6 text-ink">{value}</div>
        )}
      </div>
    </div>
  )
}

export function Contact() {
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState(null)
  const [services, setServices] = useState([])
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: "idle", message: "" })
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    Promise.allSettled([apiFetch("/api/content/contact"), apiFetch("/api/services")])
      .then(([contentResult, servicesResult]) => {
        if (!mounted) return

        if (contentResult.status === "fulfilled" && contentResult.value) {
          const data = contentResult.value
          setContent((prev) => ({
            ...prev,
            ...data,
            trustPoints: data.trustPoints?.length ? data.trustPoints : prev.trustPoints,
            nextSteps: data.nextSteps?.length ? data.nextSteps : prev.nextSteps,
            requirements: data.requirements?.length ? data.requirements : prev.requirements,
          }))
        }

        if (servicesResult.status === "fulfilled" && Array.isArray(servicesResult.value)) {
          setServices(servicesResult.value.filter((item) => item.visible !== false))
        } else {
          setServices(featuredServices)
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

  const serviceOptions = useMemo(
    () =>
      services.length > 0 ? services.map((service) => service.title).filter(Boolean) : [],
    [services]
  )

  if (loading) {
    return (
      <PageSkeleton
        badge="Contact"
        titleWidth="max-w-[540px]"
        showSidebar
        cardCount={1}
        columnsClassName="grid-cols-1"
        cardClassName="min-h-[760px]"
      />
    )
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
      referenceLink: form.referenceLink.trim(),
      humanCheck: form.humanCheck.trim(),
    }
    const nextErrors = {}
    if (!trimmed.name) nextErrors.name = "Name is required."
    if (!trimmed.email) nextErrors.email = "Email is required."
    if (trimmed.email && !/^\S+@\S+\.\S+$/.test(trimmed.email)) {
      nextErrors.email = "Enter a valid email."
    }
    if (!trimmed.phone) nextErrors.phone = "Contact number is required."
    if (trimmed.phone && trimmed.phone.length < 7) {
      nextErrors.phone = "Enter a valid contact number."
    }
    if (serviceOptions.length > 0 && !form.serviceNeeded.trim()) {
      nextErrors.serviceNeeded = "Please choose a service."
    }
    if (!trimmed.message) nextErrors.message = "Project details are required."
    if (trimmed.message && trimmed.message.length < 10) {
      nextErrors.message = "Please share a few project details."
    }
    if (trimmed.referenceLink && !/^https?:\/\//i.test(trimmed.referenceLink)) {
      nextErrors.referenceLink = "Enter a valid link starting with http:// or https://."
    }
    if (trimmed.humanCheck !== "7") {
      nextErrors.humanCheck = "Please answer the spam check."
    }
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (form.website) {
      setStatus({ type: "success", message: "Thanks! We'll be in touch." })
      setForm(initialForm)
      setFile(null)
      return
    }

    setStatus({ type: "loading", message: "Sending..." })

    try {
      const body = new FormData()
      body.append("name", form.name.trim())
      body.append("email", form.email.trim())
      body.append("phone", form.phone.trim())
      body.append("company", form.company.trim())
      body.append("serviceNeeded", form.serviceNeeded.trim())
      body.append("message", form.message.trim())
      body.append("referenceLink", form.referenceLink.trim())
      if (file) {
        body.append("attachment", file)
      }

      await apiFetch("/api/contact", {
        method: "POST",
        body,
      })

      setStatus({
        type: "success",
        message: "Thanks. We have received your enquiry and sent a confirmation email.",
      })
      setForm(initialForm)
      setFile(null)
      setErrors({})
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      })
    }
  }

  return (
    <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_52%,#ffffff_100%)]">
      <section className="relative border-b border-fog bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] bg-grid">
        <GradientOrbs />
        <Container className="py-16">
          <SectionBadge>Contact</SectionBadge>
          <div className="mt-6 max-w-4xl">
            <h1 className="text-[40px] font-semibold tracking-[-0.05em] text-ink md:text-[62px]">
              {content.heroTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-[18px] leading-8 text-slate">
              {content.heroSubtitle}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {content.trustPoints.map((point) => (
              <div
                key={point}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-white px-4 py-2 text-[14px] text-slate shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
              >
                <CheckCircle2 className="h-4.5 w-4.5 text-[#22c55e]" />
                {point}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-6 py-14 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden rounded-[28px] border-[#dbeafe] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.07)]">
            <CardHeader className="border-b border-[#e2e8f0] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-[30px] tracking-[-0.03em] text-ink">
                  {content.formTitle}
                </CardTitle>
                {content.formStatusLabel ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#86efac] bg-[#f0fdf4] px-4 py-2 text-[14px] font-medium text-[#15803d]">
                    <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                    {content.formStatusLabel}
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-slate">
                      Full name
                    </label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="h-14 rounded-[16px]"
                    />
                    {errors.name ? (
                      <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-slate">
                      Work email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="h-14 rounded-[16px]"
                    />
                    {errors.email ? (
                      <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-slate">
                      Contact number
                    </label>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 999 999 9999"
                      className="h-14 rounded-[16px]"
                    />
                    {errors.phone ? (
                      <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-slate">
                      Company <span className="text-ink/50">(optional)</span>
                    </label>
                    <Input
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Company name"
                      className="h-14 rounded-[16px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-[14px] font-medium text-slate">
                    {content.serviceFieldLabel}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {serviceOptions.map((service) => {
                      const isActive = form.serviceNeeded === service
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, serviceNeeded: service }))
                          }
                          className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${
                            isActive
                              ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                              : "border-[#cbd5e1] bg-white text-slate hover:border-[#93c5fd] hover:text-ink"
                          }`}
                        >
                          {service}
                        </button>
                      )
                    })}
                  </div>
                  {errors.serviceNeeded ? (
                    <p className="mt-2 text-xs text-red-600">{errors.serviceNeeded}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-medium text-slate">
                    Project details
                  </label>
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="What are you building? What should we know before we reply?"
                    className="min-h-[160px] rounded-[20px] px-4 py-4"
                  />
                  {errors.message ? (
                    <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-slate">
                      {content.linkFieldLabel} <span className="text-ink/50">(optional)</span>
                    </label>
                    <Input
                      name="referenceLink"
                      value={form.referenceLink}
                      onChange={handleChange}
                      placeholder="https://example.com/brief"
                      className="h-14 rounded-[16px]"
                    />
                    {errors.referenceLink ? (
                      <p className="mt-1.5 text-xs text-red-600">{errors.referenceLink}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-slate">
                      Upload file <span className="text-ink/50">(optional)</span>
                    </label>
                    <div className="flex h-14 items-center rounded-[16px] border border-dashed border-[#cbd5e1] bg-[#f8fbff] px-4">
                      <input
                        type="file"
                        accept=".pdf,.docx,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg"
                        onChange={(event) => setFile(event.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate file:mr-4 file:rounded-full file:border-0 file:bg-[#eff6ff] file:px-4 file:py-2 file:font-medium file:text-[#2563eb]"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate">
                      {file ? `Selected: ${file.name}` : content.attachmentHint}
                    </p>
                  </div>
                </div>

                <div className="hidden">
                  <label>Website</label>
                  <Input name="website" value={form.website} onChange={handleChange} />
                </div>

                <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-slate">
                      Spam check: 3 + 4 = ?
                    </label>
                    <Input
                      name="humanCheck"
                      value={form.humanCheck}
                      onChange={handleChange}
                      placeholder="Answer"
                      className="h-14 rounded-[16px]"
                    />
                    {errors.humanCheck ? (
                      <p className="mt-1.5 text-xs text-red-600">{errors.humanCheck}</p>
                    ) : null}
                  </div>
                  <div className="flex items-end">
                    <div className="w-full rounded-[16px] border border-[#dbeafe] bg-[#f8fbff] px-4 py-4 text-sm text-slate">
                      Quick check to filter bots and keep the inbox clean.
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="lg" className="h-14 w-full rounded-[16px]">
                    Send inquiry <Send className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="mt-3 text-center text-sm text-slate">
                    We typically respond within one business day. No spam, ever.
                  </p>
                  {status.type !== "idle" ? (
                    <p
                      className={`mt-3 text-sm ${
                        status.type === "error" ? "text-red-600" : "text-moss"
                      }`}
                    >
                      {status.message}
                    </p>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-[22px] border-[#dbeafe] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[24px] tracking-[-0.03em] text-ink">
                  {content.directTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                <ContactMethod
                  icon={Mail}
                  label="Email"
                  value={content.email}
                  href={`mailto:${content.email}`}
                />
                <ContactMethod
                  icon={MessageSquare}
                  label="WhatsApp"
                  value="Message us directly"
                  href={content.whatsappUrl}
                  accent="green"
                />
                {content.linkedinUrl ? (
                  <ContactMethod
                    icon={Linkedin}
                    label="LinkedIn"
                    value={content.linkedinLabel || content.linkedinUrl}
                    href={content.linkedinUrl}
                  />
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-[22px] border-[#dbeafe] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-[24px] tracking-[-0.03em] text-ink">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#2563eb]">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  {content.nextStepsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {content.nextSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-3 rounded-[16px] border border-[#e2e8f0] bg-[#fbfdff] px-3.5 py-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-[13px] font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="pt-0.5 text-[14px] leading-6 text-slate">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[22px] border-[#dbeafe] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-[24px] tracking-[-0.03em] text-ink">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#2563eb]">
                    <ClipboardList className="h-4.5 w-4.5" />
                  </span>
                  {content.requirementsTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {content.requirements.map((item, index) => {
                  const icons = [MessageSquare, Paperclip, Link2]
                  const Icon = icons[index] || CheckCircle2
                  return (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-[16px] border border-[#e2e8f0] bg-[#fbfdff] px-3.5 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#eff6ff] text-[#2563eb]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-[14px] leading-6 text-slate">{item}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  )
}

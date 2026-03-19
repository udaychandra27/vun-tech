import { useEffect, useState } from "react"
import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SectionBadge, GradientOrbs } from "@/components/Decorations"
import { apiFetch } from "@/lib/api"

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
  website: "",
  humanCheck: "",
}

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "hello@techservices.agency"
const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL || "https://wa.me/1234567890"

export function Contact() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: "idle", message: "" })
  const [content, setContent] = useState({
    heroTitle: "Tell us about your project",
    heroSubtitle: "Share your goals and timelines. We will reply with clear next steps.",
    email: CONTACT_EMAIL,
    whatsappUrl: WHATSAPP_URL,
    locationText: "We are based in the US and work remotely.",
    nextSteps: [
      "We review your request.",
      "We confirm scope and priorities.",
      "You get a clear plan and timeline.",
    ],
    requirements: [
      "A short description of the project.",
      "Expected deadline or milestone.",
      "Current links, docs, or references.",
    ],
  })

  useEffect(() => {
    let mounted = true
    apiFetch("/api/content/contact")
      .then((data) => {
        if (!mounted || !data) return
        setContent((prev) => ({
          ...prev,
          ...data,
          email: data.email || prev.email,
          whatsappUrl: data.whatsappUrl || prev.whatsappUrl,
          nextSteps: data.nextSteps?.length ? data.nextSteps : prev.nextSteps,
          requirements: data.requirements?.length
            ? data.requirements
            : prev.requirements,
        }))
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

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
    if (!trimmed.message) nextErrors.message = "Message is required."
    if (trimmed.message && trimmed.message.length < 10) {
      nextErrors.message = "Please share a few project details."
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
      return
    }

    setStatus({ type: "loading", message: "Sending..." })

    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          message: form.message.trim(),
        }),
      })
      setStatus({
        type: "success",
        message: "Thanks. We have received your enquiry and sent a confirmation email.",
      })
      setForm(initialForm)
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      })
    }
  }

  return (
    <div className="bg-sand">
      <section className="relative border-b border-fog bg-sand bg-grid">
        <GradientOrbs />
        <Container className="py-14">
          <SectionBadge>Contact</SectionBadge>
          <h1 className="text-4xl font-semibold">{content.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate">
            {content.heroSubtitle}
          </p>
        </Container>
      </section>

      <section>
        <Container className="grid gap-6 py-12 md:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Project inquiry</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Contact number</label>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 999 999 9999"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company (optional)</label>
                    <Input
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Company name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Project details</label>
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="What are you building? What's the deadline?"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                  )}
                </div>
                <div className="hidden">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Spam check: 3 + 4 = ?</label>
                  <Input
                    name="humanCheck"
                    value={form.humanCheck}
                    onChange={handleChange}
                    placeholder="Answer"
                  />
                  {errors.humanCheck && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.humanCheck}
                    </p>
                  )}
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Send inquiry
                </Button>
                {status.type !== "idle" && (
                  <p
                    className={`text-sm ${
                      status.type === "error" ? "text-red-600" : "text-moss"
                    }`}
                  >
                    {status.message}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Direct contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate">
                <div>
                  Email:{" "}
                  <a className="text-moss" href={`mailto:${content.email}`}>
                    {content.email}
                  </a>
                </div>
                <div>
                  WhatsApp:{" "}
                  <a className="text-moss" href={content.whatsappUrl}>
                    Message us
                  </a>
                </div>
                <div>{content.locationText}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What happens next</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate">
                <ol className="space-y-2">
                  {content.nextSteps.map((step, index) => (
                    <li key={step}>
                      {index + 1}. {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>What we need from you</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate">
                <ul className="space-y-2">
                  {content.requirements.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  )
}

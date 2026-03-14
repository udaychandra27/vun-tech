import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/layout/Container"
import { featuredServices, defaultProjects, values } from "@/data/content"
import { apiFetch, API_URL } from "@/lib/api"
import {
  GradientOrbs,
  SectionBadge,
  HeroGraphic,
  StatGraphic,
} from "@/components/Decorations"
import { Sparkles, ShieldCheck, Layers } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function Home() {
  const [services, setServices] = useState(featuredServices)
  const [projects, setProjects] = useState(defaultProjects)
  const [homeContent, setHomeContent] = useState({
    heroCards: [],
  })
  const [offerOpen, setOfferOpen] = useState(false)
  const [activeOffer, setActiveOffer] = useState(null)
  const [offerForm, setOfferForm] = useState({ name: "", email: "", phone: "" })
  const [offerStatus, setOfferStatus] = useState({ type: "idle", message: "" })

  const offers = [
    { id: "resume", label: "Resume", price: 199, color: "bg-emerald-600 text-white" },
    { id: "portfolio", label: "Portfolio Website", price: 1999, color: "bg-blue-600 text-white" },
    { id: "gift", label: " Gift Page", price: 999, color: "bg-pink-300 text-ink" },
  ]

  useEffect(() => {
    apiFetch("/api/services")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const featured = data.filter((item) => item.featured)
          setServices(featured.length > 0 ? featured : data)
        }
      })
      .catch(() => {})
    apiFetch("/api/projects")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProjects(data)
      })
      .catch(() => {})
    apiFetch("/api/content/home")
      .then((data) => {
        if (data?.heroCards?.length) {
          setHomeContent({ heroCards: data.heroCards })
        }
      })
      .catch(() => {})
  }, [])

  const resolveImageUrl = (url) => {
    if (!url) return ""
    if (url.startsWith("http") || url.startsWith("data:")) return url
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`
    return url
  }

  const openOffer = (offer) => {
    setActiveOffer(offer)
    setOfferStatus({ type: "idle", message: "" })
    setOfferOpen(true)
  }

  const handleOfferPay = async (event) => {
    event.preventDefault()
    if (!activeOffer) return
    if (!offerForm.name.trim() || !offerForm.email.trim() || !offerForm.phone.trim()) {
      setOfferStatus({ type: "error", message: "Please complete all fields." })
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(offerForm.email)) {
      setOfferStatus({ type: "error", message: "Enter a valid email." })
      return
    }
    if (!window.Razorpay) {
      setOfferStatus({ type: "error", message: "Payment system not loaded." })
      return
    }

    try {
      setOfferStatus({ type: "loading", message: "Creating payment..." })
      const order = await apiFetch("/api/payments/order", {
        method: "POST",
        body: JSON.stringify({
          amount: activeOffer.price * 100,
          currency: "INR",
          product: activeOffer.label,
          name: offerForm.name,
          email: offerForm.email,
          phone: offerForm.phone,
        }),
      })

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Tech Services Agency",
        description: activeOffer.label,
        order_id: order.orderId,
        prefill: {
          name: offerForm.name,
          email: offerForm.email,
          contact: offerForm.phone,
        },
        handler: async (response) => {
          try {
            await apiFetch("/api/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            })
            setOfferStatus({
              type: "success",
              message: "Payment successful. Confirmation sent.",
            })
          } catch (error) {
            setOfferStatus({
              type: "error",
              message: error.message || "Verification failed.",
            })
          }
        },
        theme: { color: "#2563eb" },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      setOfferStatus({ type: "idle", message: "" })
    } catch (error) {
      setOfferStatus({ type: "error", message: error.message || "Payment failed." })
    }
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-fog bg-sand bg-grid">
        <GradientOrbs />
        <Container className="grid gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
          <div className="space-y-6">
            <SectionBadge>Tech services for growing teams</SectionBadge>
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
              We build and maintain software that keeps your business moving.
            </h1>
            <p className="text-lg text-slate md:text-xl">
              Clear scope, honest delivery, and reliable systems. We partner with
              teams that want steady progress without the noise.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/contact">Contact / Get Quote</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/services">View Services</Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-fog bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
                Exclusive offers
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {offers.map((offer) => (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => openOffer(offer)}
                    className={`rounded-xl px-4 py-3 text-left transition-transform hover:-translate-y-1 ${offer.color}`}
                  >
                    <div className="text-xs uppercase tracking-wide">
                      {offer.label}
                    </div>
                    <div className="text-lg font-semibold">INR {offer.price}</div>
                    <div className="mt-2 text-xs underline">Get this offer</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 pt-4 text-sm text-slate sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-moss" />
                Modern UX
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-moss" />
                Reliable builds
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-moss" />
                Scalable stacks
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {homeContent.heroCards?.length >= 2 ? (
              homeContent.heroCards.slice(0, 2).map((card, index) => (
                <div
                  key={`hero-card-${index}`}
                  className="rounded-2xl border border-fog bg-white p-4"
                >
                  <div className="overflow-hidden rounded-xl bg-sand">
                    {card.imageUrl ? (
                      <img
                        src={resolveImageUrl(card.imageUrl)}
                        alt={`Hero ${index + 1}`}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="h-40 w-full" />
                    )}
                  </div>
                  {card.caption && (
                    <div className="mt-2 text-xs text-slate">{card.caption}</div>
                  )}
                </div>
              ))
            ) : (
              <>
                <HeroGraphic />
                <StatGraphic />
              </>
            )}
            <div className="glass-card rounded-2xl p-6 shadow-sm">
              <div className="space-y-4 text-sm text-slate">
                <div className="text-xs uppercase tracking-[0.2em] text-ink/60">
                  What you can expect
                </div>
                <div className="space-y-3">
                  {values.map((value) => (
                    <div key={value.title} className="rounded-xl bg-white p-4">
                      <div className="text-base font-semibold text-ink">
                        {value.title}
                      </div>
                      <div className="text-sm text-slate">{value.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-fog bg-white section-sheen bg-grid">
        <Container className="py-14">
          <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Services</h2>
              <p className="text-slate">Focused, practical offerings.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/services">All services</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title}>
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate">
                  <p>{service.description}</p>
                  <ul className="space-y-2 text-ink list-disc pl-4">
                    {(service.includes || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-xs uppercase tracking-wide text-ink/60">
                    Ideal for: {service.idealFor}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative border-b border-fog bg-sand bg-grid">
        <GradientOrbs />
        <Container className="py-14">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold">Selected work</h2>
            <p className="text-slate">
              Practical solutions built for real operations.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {(projects.some((p) => p.featured) ? projects.filter((p) => p.featured) : projects).map(
              (project) => (
                <Card key={project.name}>
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate">
                    <p>{project.description}</p>
                    {project.outcome && (
                      <p className="text-ink">Outcome: {project.outcome}</p>
                    )}
                    {project.link && (
                      <a className="text-sm text-moss" href={project.link}>
                        View details
                      </a>
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </Container>
      </section>

      <section className="bg-sand">
        <Container className="grid gap-6 py-14 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-3xl font-semibold">Ready to talk?</h2>
            <p className="mt-3 text-slate">
              We will respond within two business days with clear next steps.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end md:justify-center">
            <Button asChild size="lg">
              <Link to="/contact">Start a project</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/about">How we work</Link>
            </Button>
          </div>
        </Container>
      </section>

      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeOffer ? `Buy: ${activeOffer.label}` : "Offer"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleOfferPay}>
            <Input
              placeholder="Full name"
              value={offerForm.name}
              onChange={(e) =>
                setOfferForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              placeholder="Email"
              value={offerForm.email}
              onChange={(e) =>
                setOfferForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Input
              placeholder="Phone"
              value={offerForm.phone}
              onChange={(e) =>
                setOfferForm((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
            <Button type="submit" className="w-full">
              Pay INR {activeOffer?.price || ""}
            </Button>
            {offerStatus.type !== "idle" && (
              <p
                className={`text-sm ${
                  offerStatus.type === "error" ? "text-red-600" : "text-moss"
                }`}
              >
                {offerStatus.message}
              </p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

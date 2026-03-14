import { useEffect, useState } from "react"
import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionBadge, GradientOrbs } from "@/components/Decorations"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"
import { OptimizedImage } from "@/components/OptimizedImage"

export function Trending() {
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "" })
  const [status, setStatus] = useState({ type: "idle", message: "" })
  const [products, setProducts] = useState([])

  useEffect(() => {
    apiFetch("/api/trending")
      .then((data) => {
        if (Array.isArray(data)) setProducts(data)
      })
      .catch(() => {})
  }, [])

  const openDetails = (product) => {
    setActive(product)
    setStatus({ type: "idle", message: "" })
    setDetailsOpen(true)
  }

  const openCheckout = () => {
    if (!active) return
    setStatus({ type: "idle", message: "" })
    setOpen(true)
  }

  const handlePay = async (event) => {
    event.preventDefault()
    if (!active) return
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setStatus({ type: "error", message: "Please complete all fields." })
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setStatus({ type: "error", message: "Enter a valid email." })
      return
    }
    if (!window.Razorpay) {
      setStatus({ type: "error", message: "Payment system not loaded." })
      return
    }

    try {
      setStatus({ type: "loading", message: "Creating payment..." })
      const order = await apiFetch("/api/payments/order", {
        method: "POST",
        body: JSON.stringify({
          amount: active.price * 100,
          currency: "INR",
          product: active.title,
          name: form.name,
          email: form.email,
          phone: form.phone,
        }),
      })

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Tech Services Agency",
        description: active.title,
        order_id: order.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
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
            setStatus({
              type: "success",
              message: "Payment successful. Confirmation sent.",
            })
          } catch (error) {
            setStatus({
              type: "error",
              message: error.message || "Verification failed.",
            })
          }
        },
        theme: { color: "#2563eb" },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      setStatus({ type: "idle", message: "" })
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Payment failed." })
    }
  }

  return (
    <div className="bg-sand">
      <section className="relative border-b border-fog bg-sand bg-grid">
        <GradientOrbs />
        <Container className="py-12">
          <SectionBadge>Trending</SectionBadge>
          <h1 className="text-4xl font-semibold">Trending digital products</h1>
          <p className="mt-3 max-w-2xl text-slate">
            Quick-turn digital products that help students and professionals move faster.
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product._id || product.id}
                className="glass-card cursor-pointer transition-transform hover:-translate-y-1"
                onClick={() => openDetails(product)}
              >
                <CardHeader>
                  <CardTitle>{product.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate">
                  <div className="overflow-hidden rounded-xl border border-fog bg-white">
                    {product.imageUrl ? (
                      <OptimizedImage
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="h-36 w-full bg-fog" />
                    )}
                  </div>
                  <p>{product.description}</p>
                  {product.details?.length > 0 && (
                    <ul className="space-y-1 text-xs text-slate">
                      {product.details.map((detail) => (
                        <li key={detail}>• {detail}</li>
                      ))}
                    </ul>
                  )}
                  <div className="text-lg font-semibold text-ink">
                    INR {product.price}
                  </div>
                  <Button onClick={(event) => {
                    event.stopPropagation()
                    openDetails(product)
                  }}>
                    View details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{active?.title || "Product details"}</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="space-y-4 text-sm text-slate">
              <div className="overflow-hidden rounded-xl border border-fog bg-white">
                {active.imageUrl ? (
                  <OptimizedImage
                    src={active.imageUrl}
                    alt={active.title}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="h-44 w-full bg-fog" />
                )}
              </div>
              <p>{active.description}</p>
              {active.details?.length > 0 && (
                <ul className="space-y-1 text-xs text-slate">
                  {active.details.map((detail) => (
                    <li key={detail}>• {detail}</li>
                  ))}
                </ul>
              )}
              <div className="text-lg font-semibold text-ink">
                INR {active.price}
              </div>
              <Button onClick={() => {
                setDetailsOpen(false)
                openCheckout()
              }}>
                Proceed to checkout
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {active ? `Buy: ${active.title}` : "Checkout"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handlePay}>
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <Button type="submit" className="w-full">
              Pay INR {active?.price || ""}
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
        </DialogContent>
      </Dialog>
    </div>
  )
}

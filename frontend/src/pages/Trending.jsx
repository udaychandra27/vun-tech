import { useEffect, useState } from "react"
import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionBadge, GradientOrbs } from "@/components/Decorations"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"
import { OptimizedImage } from "@/components/OptimizedImage"

let razorpayScriptPromise

function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Payment checkout is only available in the browser."))
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay)
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => resolve(window.Razorpay)
      script.onerror = () => reject(new Error("Unable to load the payment system."))
      document.head.appendChild(script)
    })
  }

  return razorpayScriptPromise
}

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
    try {
      await loadRazorpayCheckout()
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
    <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_55%,#ffffff_100%)]">
      <section className="relative border-b border-fog bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] bg-grid">
        <GradientOrbs />
        <Container className="py-16">
          <SectionBadge>Trending</SectionBadge>
          <h1 className="mt-5 text-[40px] font-semibold tracking-[-0.04em] text-ink md:text-[56px]">
            Trending digital products
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] leading-8 text-slate">
            Quick-turn digital products that help students and professionals move faster.
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-14">
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product._id || product.id}
                className="glass-card cursor-pointer rounded-[18px] border-[#dbeafe] bg-white transition-transform hover:-translate-y-1"
                onClick={() => openDetails(product)}
              >
                <CardHeader>
                  <CardTitle className="text-[24px]">{product.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-[14px] leading-7 text-slate">
                  <div className="overflow-hidden rounded-xl border border-fog bg-white">
                    {product.imageUrl ? (
                      <OptimizedImage
                        src={product.imageUrl}
                        alt={product.title}
                        width={800}
                        height={600}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="h-36 w-full bg-fog" />
                    )}
                  </div>
                  <p>{product.description}</p>
                  {product.details?.length > 0 && (
                    <ul className="space-y-1 text-[12px] text-slate">
                      {product.details.map((detail) => (
                        <li key={detail}>- {detail}</li>
                      ))}
                    </ul>
                  )}
                  <div className="text-[22px] font-semibold text-ink">
                    INR {product.price}
                  </div>
                  <Button onClick={(event) => {
                    event.stopPropagation()
                    openDetails(product)
                  }}>
                    View product details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg rounded-[24px] border-[#dbeafe]">
          <DialogHeader>
            <DialogTitle className="text-[28px]">{active?.title || "Product details"}</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="space-y-4 text-[14px] leading-7 text-slate">
              <div className="overflow-hidden rounded-xl border border-fog bg-white">
                {active.imageUrl ? (
                  <OptimizedImage
                    src={active.imageUrl}
                    alt={active.title}
                    width={900}
                    height={600}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="h-44 w-full bg-fog" />
                )}
              </div>
              <p>{active.description}</p>
              {active.details?.length > 0 && (
                <ul className="space-y-1 text-[12px] text-slate">
                  {active.details.map((detail) => (
                    <li key={detail}>- {detail}</li>
                  ))}
                </ul>
              )}
              <div className="text-[22px] font-semibold text-ink">
                INR {active.price}
              </div>
              <Button onClick={() => {
                setDetailsOpen(false)
                openCheckout()
              }}>
                Proceed to secure checkout
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[24px] border-[#dbeafe]">
          <DialogHeader>
            <DialogTitle className="text-[28px]">
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

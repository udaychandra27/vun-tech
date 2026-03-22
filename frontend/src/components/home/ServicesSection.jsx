import { Link } from "react-router-dom"
import { ArrowRight, Monitor, PenTool, ShieldCheck } from "lucide-react"
import { Container } from "@/components/layout/Container"

const serviceVisuals = [
  {
    icon: Monitor,
    short: "Fast, clean, scalable builds",
  },
  {
    icon: ShieldCheck,
    short: "Protect systems & data",
  },
  {
    icon: PenTool,
    short: "Interfaces users love",
  },
  {
    icon: Monitor,
    short: "Focused, practical delivery",
  },
]

export function ServicesSection({ serviceCards, accentColor }) {
  return (
    <section className="bg-[#f8fbff] py-16">
      <Container>
        <div
          className="home-reveal mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          data-reveal
        >
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
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
                  {service.description || visual.short}
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
                  Explore {service.title} services <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="mt-5 border-t border-fog pt-4 text-[10px] uppercase tracking-[0.18em] text-[#64748b]">
                  Ideal for: {service.idealFor}
                </div>
              </article>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

import {
  BadgeCheck,
  Code2,
  Globe,
  Lock,
  Monitor,
  PenTool,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react"
import { Container } from "@/components/layout/Container"

const iconMap = {
  Monitor,
  ShieldCheck,
  PenTool,
  Lock,
  ScanSearch,
  BadgeCheck,
  Workflow,
  Sparkles,
  Code2,
  Globe,
}

function resolveIcon(name) {
  return iconMap[name] || ShieldCheck
}

export function WhyChooseSection({ whyChooseItems, accentColor }) {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="home-reveal" data-reveal>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
            Why VUN Tech
          </div>
          <h2 className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#0f172a] sm:text-[34px]">
            Why Choose VUN Tech
          </h2>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {whyChooseItems.map((item, index) => {
            const Icon = resolveIcon(item.icon)

            return (
              <article
                key={`${item.title}-${index}`}
                className="home-reveal accent-card rounded-[18px] border border-fog bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.04)]"
                data-reveal
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-[14px]"
                  style={{
                    backgroundColor: `${accentColor}12`,
                    color: accentColor,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[16px] font-semibold text-[#0f172a]">
                  {item.title}
                </div>
                <p className="mt-2 text-[13px] leading-[1.75] text-[#64748b]">
                  {item.description}
                </p>
              </article>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

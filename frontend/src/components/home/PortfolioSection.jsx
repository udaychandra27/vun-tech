import { ArrowRight } from "lucide-react"
import { Container } from "@/components/layout/Container"

export function PortfolioSection({ selectedProjects, accentColor }) {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="home-reveal mb-8" data-reveal>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
            Portfolio
          </div>
          <h2 className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#0f172a] sm:text-[34px]">
            Selected work
          </h2>
          <p className="mt-2 text-[14px] text-[#64748b]">
            Practical solutions built for real operations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:justify-items-center">
          {selectedProjects.map((project) => {
            const isSecurity = /security|secure|cyber/i.test(
              `${project.name} ${project.industry || ""}`
            )

            return (
              <article
                key={project.name}
                className="home-reveal w-full max-w-[560px] rounded-[18px] border border-fog bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-transform duration-200 hover:-translate-y-1"
                data-reveal
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide"
                    style={{
                      backgroundColor: `${accentColor}14`,
                      color: accentColor,
                    }}
                  >
                    {project.badgeLabel || (isSecurity ? "Security" : "Web App")}
                  </span>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    {project.domain || project.industry}
                  </div>
                </div>
                <div className="mt-4 text-[20px] font-semibold leading-[1.2] text-[#0f172a]">
                  {project.name}
                </div>
                <p className="mt-3 text-[13px] leading-[1.75] text-[#64748b]">
                  {project.description}
                </p>
                {project.outcome ? (
                  <div
                    className="mt-4 rounded-[14px] px-4 py-3 text-[12px] leading-6"
                    style={{
                      backgroundColor: `${accentColor}0d`,
                      color: accentColor,
                    }}
                  >
                    Outcome: {project.outcome}
                  </div>
                ) : null}
                <a
                  href={project.link || "/work"}
                  target={project.link ? "_blank" : undefined}
                  rel={project.link ? "noreferrer" : undefined}
                  className="mt-5 inline-flex items-center gap-1 text-[12px] font-medium"
                  style={{ color: accentColor }}
                >
                  Review {project.name} project details <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

import { Container } from "@/components/layout/Container"

export function TestimonialsSection({ testimonials, accentColor }) {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="home-reveal mb-8" data-reveal>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748b]">
            Testimonials
          </div>
          <h2 className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#0f172a] sm:text-[34px]">
            What clients say
          </h2>
          <p className="mt-2 text-[14px] text-[#64748b]">
            Real feedback from teams we have helped ship with more clarity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <article
              key={`${testimonial.name || "testimonial"}-${index}`}
              className="home-reveal rounded-[18px] border border-[#dbeafe] bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)]"
              data-reveal
            >
              <div className="text-[28px] leading-none" style={{ color: accentColor }}>
                "
              </div>
              <p className="mt-3 text-[14px] leading-7 text-[#475569]">
                {testimonial.quote}
              </p>
              <div className="mt-5 border-t border-fog pt-4">
                <div className="text-[14px] font-semibold text-[#0f172a]">
                  {testimonial.name}
                </div>
                <div className="mt-1 text-[12px] text-[#64748b]">
                  {testimonial.role}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

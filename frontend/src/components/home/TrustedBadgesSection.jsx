import { Container } from "@/components/layout/Container"

export function TrustedBadgesSection({ trustedBadges }) {
  return (
    <section className="border-y border-fog bg-[#f8fbff]">
      <Container className="py-6">
        <div className="home-reveal" data-reveal>
          <div className="text-center text-[11.5px] font-medium uppercase tracking-[0.24em] text-[#64748b]">
            Trusted by growing startups and businesses
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {trustedBadges.map((badge) => (
              <div
                key={badge}
                className="accent-pill inline-flex items-center rounded-full border border-[#dbeafe] bg-white px-4 py-2 text-[12px] font-medium text-[#334155]"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

import { Container } from "@/components/layout/Container"

export function StatsSection({ stats, accentColor }) {
  return (
    <section className="bg-[#f8fbff] py-8">
      <Container>
        <div className="grid gap-4 rounded-[24px] border border-fog bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:grid-cols-4">
          {stats.map((item, index) => (
            <div
              key={`${item.value}-${item.label}-${index}`}
              className="home-reveal rounded-[16px] border border-transparent px-2 py-3 text-center transition-all duration-200 hover:bg-[var(--accent-soft)]"
              data-reveal
            >
              <div
                className="text-[26px] font-bold tracking-[-0.05em]"
                style={{ color: accentColor }}
              >
                {item.value}
              </div>
              <div className="mt-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#64748b]">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

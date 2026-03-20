import { Container } from "@/components/layout/Container"

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-[16px] bg-[#e2e8f0] ${className}`} />
}

export function PageSkeleton({
  badge = "Loading",
  titleWidth = "max-w-[420px]",
  bodyLines = 2,
  chipCount = 3,
  cardCount = 3,
  columnsClassName = "md:grid-cols-3",
  cardClassName = "h-[320px]",
  filterCount = 0,
  showSidebar = false,
  showFooterCta = false,
}) {
  return (
    <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_55%,#ffffff_100%)]">
      <section className="relative border-b border-fog bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] bg-grid">
        <Container className="py-16">
          <div className="inline-flex rounded-full border border-[#dbeafe] bg-white px-4 py-2 text-[11px] font-medium text-[#64748b]">
            {badge}
          </div>
          <div className={`mt-6 ${titleWidth}`}>
            <SkeletonBlock className="h-12 w-full md:h-16" />
          </div>
          <div className="mt-5 max-w-3xl space-y-3">
            {Array.from({ length: bodyLines }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className={`h-5 ${index === bodyLines - 1 ? "w-4/5" : "w-full"}`}
              />
            ))}
          </div>
          {chipCount > 0 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {Array.from({ length: chipCount }).map((_, index) => (
                <SkeletonBlock key={index} className="h-10 w-40 rounded-full" />
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      {filterCount > 0 ? (
        <section className="border-b border-fog bg-white">
          <Container className="flex flex-wrap gap-3 py-4">
            {Array.from({ length: filterCount }).map((_, index) => (
              <SkeletonBlock key={index} className="h-11 w-28 rounded-full" />
            ))}
          </Container>
        </section>
      ) : null}

      <section>
        <Container
          className={`grid gap-6 py-14 ${showSidebar ? "xl:grid-cols-[1.2fr_0.8fr]" : ""}`}
        >
          <div className={`grid gap-6 ${columnsClassName}`}>
            {Array.from({ length: cardCount }).map((_, index) => (
              <div
                key={index}
                className={`overflow-hidden rounded-[24px] border border-[#dbeafe] bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] ${cardClassName}`}
              >
                <SkeletonBlock className="h-2 w-full rounded-full" />
                <div className="mt-5 flex items-center justify-between gap-4">
                  <SkeletonBlock className="h-11 w-11 rounded-[14px]" />
                  <SkeletonBlock className="h-7 w-20 rounded-full" />
                </div>
                <div className="mt-5 space-y-3">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-8 w-3/4" />
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-5/6" />
                </div>
                <div className="mt-6 space-y-2">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-11/12" />
                  <SkeletonBlock className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>

          {showSidebar ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#dbeafe] bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
                <div className="space-y-4">
                  <SkeletonBlock className="h-8 w-40" />
                  <SkeletonBlock className="h-20 w-full" />
                  <SkeletonBlock className="h-20 w-full" />
                  <SkeletonBlock className="h-20 w-full" />
                </div>
              </div>
              <div className="rounded-[24px] border border-[#dbeafe] bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
                <div className="space-y-4">
                  <SkeletonBlock className="h-8 w-36" />
                  <SkeletonBlock className="h-14 w-full" />
                  <SkeletonBlock className="h-14 w-full" />
                  <SkeletonBlock className="h-14 w-full" />
                </div>
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      {showFooterCta ? (
        <section className="border-t border-[#d8e4f5] bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_100%)]">
          <Container className="flex flex-col gap-5 py-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <SkeletonBlock className="h-10 w-80" />
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-4/5" />
            </div>
            <div className="flex gap-3">
              <SkeletonBlock className="h-12 w-40" />
              <SkeletonBlock className="h-12 w-40" />
            </div>
          </Container>
        </section>
      ) : null}
    </div>
  )
}

import { Container } from "@/components/layout/Container"
import { Badge } from "@/components/ui/badge"

export function Privacy() {
  return (
    <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_60%,#ffffff_100%)]">
      <section className="border-b border-fog bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <Container className="py-14">
          <Badge variant="outline" className="mb-4">
            Privacy Policy
          </Badge>
          <h1 className="text-[40px] font-semibold tracking-[-0.04em] text-ink md:text-[52px]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-[15px] text-slate">
            Effective date: February 7, 2026.
          </p>
        </Container>
      </section>

      <section>
        <Container className="max-w-3xl space-y-5 py-12 text-[15px] leading-8 text-slate">
          <p>
            We collect information you submit through our contact forms to
            respond to inquiries, provide services, and maintain client
            communication. We do not sell your data.
          </p>
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-ink">Information we collect</h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>Name, email, company, and project details you provide.</li>
              <li>Basic technical data (such as IP address) for security.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-ink">How we use your information</h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>Respond to inquiries and deliver services.</li>
              <li>Improve internal operations and service quality.</li>
              <li>Comply with legal obligations when required.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-ink">Data retention</h3>
            <p>
              We retain contact submissions only as long as needed to respond and
              maintain business records.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-ink">Your rights</h3>
            <p>
              You can request access, correction, or deletion of your data by
              emailing hello@techservices.agency.
            </p>
          </div>
        </Container>
      </section>
    </div>
  )
}

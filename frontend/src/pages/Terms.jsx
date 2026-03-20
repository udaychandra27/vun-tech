import { Container } from "@/components/layout/Container"
import { Badge } from "@/components/ui/badge"

export function Terms() {
  return (
    <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_60%,#ffffff_100%)]">
      <section className="border-b border-fog bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <Container className="py-14">
          <Badge variant="outline" className="mb-4">
            Terms of Service
          </Badge>
          <h1 className="text-[40px] font-semibold tracking-[-0.04em] text-ink md:text-[52px]">
            Terms of Service
          </h1>
          <p className="mt-4 text-[15px] text-slate">
            Effective date: February 7, 2026.
          </p>
        </Container>
      </section>

      <section>
        <Container className="max-w-3xl space-y-5 py-12 text-[15px] leading-8 text-slate">
          <p>
            By engaging Tech Services Agency, you agree to the terms described
            here. Detailed terms for a specific project will be defined in a
            written agreement.
          </p>
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-ink">Services</h3>
            <p>
              We provide software design, development, and support services as
              agreed in project documentation.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-ink">Client responsibilities</h3>
            <ul className="list-disc space-y-1 pl-4">
              <li>Provide timely access to information and stakeholders.</li>
              <li>Review deliverables and provide feedback promptly.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-ink">Payment</h3>
            <p>
              Payment terms are agreed in writing before work begins. Late
              payments may pause delivery.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-ink">Limitation of liability</h3>
            <p>
              We are not liable for indirect damages. Our total liability is
              limited to fees paid for the services.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-ink">Contact</h3>
            <p>
              Questions about these terms can be sent to
              hello@techservices.agency.
            </p>
          </div>
        </Container>
      </section>
    </div>
  )
}

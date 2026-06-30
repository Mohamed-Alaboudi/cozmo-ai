import type { Metadata } from "next";

import { Container, Display, Section } from "@/components/ui/section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Cozmo AI collects, uses, and protects personal information across its website and AI phone-agent services.",
};

const UPDATED = "June 30, 2026";

export default function PrivacyPage() {
  return (
    <Section className="pt-32 md:pt-40">
      <Container className="max-w-[760px]">
        <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-accent-text">
          Legal
        </p>
        <Display as="h1" className="text-[clamp(34px,5vw,60px)]">
          Privacy Policy
        </Display>
        <p className="mt-5 text-[14px] text-gray-2">Last updated {UPDATED}</p>

        <div className="prose-cozmo mt-12 space-y-10">
          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Overview
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              {SITE.legalName} (&ldquo;{SITE.name},&rdquo; &ldquo;we,&rdquo;
              &ldquo;us&rdquo;) provides AI phone agents for the insurance
              industry. This policy explains what information we collect when you
              use this website or our services, how we use it, and the choices
              you have. By using the site you agree to this policy.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Information we collect
            </h2>
            <ul className="mt-3 space-y-2 text-[16px] leading-[1.7] text-gray">
              <li>
                <strong className="text-ink">Contact details</strong> you submit
                — name, phone number, and email — when you request a demo call or
                reach out to us.
              </li>
              <li>
                <strong className="text-ink">Call data</strong> — when you use a
                demo or live agent, the call may be recorded and transcribed to
                operate and improve the service. Sensitive identifiers such as
                card and policy numbers are redacted from logs.
              </li>
              <li>
                <strong className="text-ink">Usage data</strong> — standard log
                and device information (IP address, browser, pages viewed)
                collected automatically as you browse.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              How we use information
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              We use the information to place demo calls you request, respond to
              inquiries, provide and improve the service, maintain security, and
              meet legal and regulatory obligations. We honor consent and
              do-not-call preferences and apply TCPA-aware calling rules to
              outbound contact.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Sharing
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              We do not sell personal information. We share it only with service
              providers who help us run the service (such as telephony and cloud
              infrastructure) under appropriate confidentiality terms, or when
              required by law.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Data retention and security
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              We retain information only as long as needed for the purposes above
              or as required by law. Call data is encrypted in transit and at
              rest, and access is restricted with single sign-on and role-based
              permissions.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Your choices
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              You can ask us to access, correct, or delete your information, and
              you can opt out of demo calls and texts at any time (reply STOP to
              messages). To make a request, email{" "}
              <a
                href={SITE.emailHref}
                className="font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent-text"
              >
                {SITE.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Contact
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              Questions about this policy? Email{" "}
              <a
                href={SITE.emailHref}
                className="font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent-text"
              >
                {SITE.email}
              </a>{" "}
              or call{" "}
              <a
                href={SITE.demoPhoneHref}
                className="tabular font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent-text"
              >
                {SITE.demoPhone}
              </a>
              .
            </p>
          </section>

          <p className="border-t border-line pt-8 text-[14px] leading-[1.6] text-gray-2">
            This page is provided for general informational purposes and is not
            legal advice.
          </p>
        </div>
      </Container>
    </Section>
  );
}

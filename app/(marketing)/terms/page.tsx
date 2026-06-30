import type { Metadata } from "next";

import { Container, Display, Section } from "@/components/ui/section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of the Cozmo AI website and AI phone-agent services.",
};

const UPDATED = "June 30, 2026";

export default function TermsPage() {
  return (
    <Section className="pt-32 md:pt-40">
      <Container className="max-w-[760px]">
        <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-accent-text">
          Legal
        </p>
        <Display as="h1" className="text-[clamp(34px,5vw,60px)]">
          Terms of Service
        </Display>
        <p className="mt-5 text-[14px] text-gray-2">Last updated {UPDATED}</p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Agreement
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
              and use of the {SITE.legalName} website and services
              (&ldquo;Service&rdquo;). By using the Service you agree to these
              Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Use of the Service
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              You agree to use the Service only for lawful purposes and not to
              misuse it, interfere with its operation, or attempt to access it
              other than through the interfaces we provide. Demo calls are
              offered for evaluation and may be limited or rate-controlled.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Demo calls and communications
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              By submitting your number you authorize {SITE.name} to place a
              one-time AI demo call and related messages to that number,
              including via automated technology. Consent is not a condition of
              purchase. Standard message and data rates may apply, and you can
              opt out at any time.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Intellectual property
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              The Service, including its content, design, and software, is owned
              by {SITE.legalName} and protected by applicable law. We grant you a
              limited, revocable, non-exclusive license to use the Service for
              its intended purpose.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Disclaimers and liability
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              The Service is provided &ldquo;as is&rdquo; without warranties of
              any kind. To the maximum extent permitted by law, {SITE.legalName}{" "}
              is not liable for any indirect, incidental, or consequential
              damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Changes
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              We may update these Terms from time to time. Continued use of the
              Service after changes take effect constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-disp text-[22px] font-semibold tracking-[-0.01em] text-ink">
              Contact
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-gray">
              Questions about these Terms? Email{" "}
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

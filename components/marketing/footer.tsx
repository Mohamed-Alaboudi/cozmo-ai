import Link from "next/link";
import { Container } from "@/components/ui/section";
import { Wordmark } from "@/components/ui/logo";
import { SITE, NAV_LINKS } from "@/lib/site";

/**
 * Dark editorial footer (the second of the page's near-black bands). Brand +
 * tagline, Solutions / Company columns, the TCPA/SMS consent the call-me forms
 * require, a copyright row, and a faint oversized ghost wordmark.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr] md:gap-16">
          {/* Brand */}
          <div className="max-w-[320px]">
            <Wordmark onDark />
            <p className="mt-5 text-[15px] font-light leading-[1.65] text-white/65">
              {SITE.tagline}. Every call answered, in your brand&apos;s voice,
              wired into the systems you already run.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <p className="font-disp text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-hi">
              Solutions
            </p>
            <ul className="mt-5 space-y-3.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] font-light text-white/75 transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-disp text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-hi">
              Company
            </p>
            <ul className="mt-5 space-y-3.5">
              <li>
                <a
                  href={SITE.emailHref}
                  className="text-[15px] font-light text-white/75 transition-colors hover:text-paper"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE.demoPhoneHref}
                  className="tabular text-[15px] text-white/75 transition-colors hover:text-paper"
                >
                  {SITE.demoPhone}
                </a>
              </li>
              <li>
                <Link
                  href={SITE.privacyHref}
                  className="text-[15px] font-light text-white/75 transition-colors hover:text-paper"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={SITE.termsHref}
                  className="text-[15px] font-light text-white/75 transition-colors hover:text-paper"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* TCPA / SMS consent */}
        <p className="mt-14 max-w-[680px] border-t border-white/10 pt-8 text-[13px] font-light leading-[1.65] text-white/45">
          By sharing your number you agree that {SITE.name} and {SITE.legalName}{" "}
          may call and text you about a demo at that number, including via
          automated technology. Consent is not a condition of purchase. Message
          and data rates may apply. Reply STOP to opt out.
        </p>

        {/* Copyright */}
        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-[11.5px] tracking-[0.06em] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p className="tabular">
            © {year} {SITE.legalName}
          </p>
          <p className="uppercase">{SITE.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}

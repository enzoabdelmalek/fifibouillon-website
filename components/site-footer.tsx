import Link from "next/link";
import { Logo } from "@/components/logo";
import { nav, site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="grain relative overflow-hidden bg-footer-bg text-footer-ink">
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <Logo variant="onDark" className="h-24" />
            <p className="mt-6 max-w-xs text-sm/relaxed text-footer-ink/70">
              {site.tagline} — {site.district}. La cuisine française de toujours,
              généreuse et à prix juste.
            </p>
            <div className="mt-6 flex gap-3">
              {site.social.instagram ? (
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Instagram"
                  className="grid size-10 place-items-center rounded-full border border-footer-ink/25 transition-colors hover:bg-footer-ink/10"
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                    <circle cx="12" cy="12" r="3.9" />
                    <circle cx="17.2" cy="6.8" r="1.05" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              ) : null}
              {site.social.tiktok ? (
                <a
                  href={site.social.tiktok}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="TikTok"
                  className="grid size-10 place-items-center rounded-full border border-footer-ink/25 transition-colors hover:bg-footer-ink/10"
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
                    <path d="M16.6 2h-2.9v13.1a2.6 2.6 0 1 1-2.2-2.6v-3a5.6 5.6 0 1 0 5.1 5.6V8.9a6.8 6.8 0 0 0 4 1.3V7.3a4 4 0 0 1-4-4Z" />
                  </svg>
                </a>
              ) : null}
              {site.social.facebook ? (
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Facebook"
                  className="grid size-10 place-items-center rounded-full border border-footer-ink/25 transition-colors hover:bg-footer-ink/10"
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="currentColor">
                    <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.25-1.5 1.5-1.5h1.7V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V10H7.5v3h2.7v8Z" />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <h2 className="eyebrow text-accent">Le restaurant</h2>
            <ul className="mt-5 space-y-1 text-sm">
              {nav.slice(1).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block py-1 text-footer-ink/75 transition-colors hover:text-footer-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="/Menu%20food.pdf"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-block py-1 text-footer-ink/75 transition-colors hover:text-footer-ink"
                >
                  Carte à manger (PDF)
                </a>
              </li>
              <li>
                <a
                  href="/Menu%20boisson.pdf"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-block py-1 text-footer-ink/75 transition-colors hover:text-footer-ink"
                >
                  Carte des boissons (PDF)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-accent">Nous trouver</h2>
            <address className="mt-5 space-y-4 text-sm/relaxed not-italic text-footer-ink/75">
              <p>
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </p>
              <p>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="block py-1 transition-colors hover:text-footer-ink"
                >
                  {site.contact.phoneDisplay}
                </a>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="block py-1 transition-colors hover:text-footer-ink"
                >
                  {site.contact.email}
                </a>
              </p>
            </address>

            <h2 className="eyebrow mt-8 text-accent">Horaires</h2>
            <dl className="mt-5 space-y-2 text-sm text-footer-ink/75">
              {site.hours.map((slot) => (
                <div key={slot.days} className="flex justify-between gap-4">
                  <dt>{slot.days}</dt>
                  <dd className="tabular-nums">{slot.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-footer-ink/15 pt-7 text-xs text-footer-ink/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.fullName}. Tous droits réservés.
          </p>
          <p>
            Prix en euros, taxes et service compris. L’abus d’alcool est dangereux pour
            la santé, à consommer avec modération.
          </p>
        </div>
      </div>
    </footer>
  );
}

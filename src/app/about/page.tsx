import {
  getAboutIntro,
  getCodeOfConductPdfUrl,
  getCommitteeMembers,
  getConstitutionPdfUrl,
} from "@/lib/site-content";
import Image from "next/image";
import Link from "next/link";

/** Wording matches `RA docs/Mission statement .txt`. */
const missionHeadingClass =
  "font-heading font-bold text-[var(--foreground)] text-xl sm:text-2xl tracking-tight";
const missionTitleClass =
  "font-heading font-bold text-[var(--foreground)] text-2xl sm:text-3xl tracking-tight";

const STAND_FOR = [
  {
    title: "A strong community voice",
    body: "We listen to residents and speak up on their behalf, ensuring local views are heard by councils, developers and decision‑makers.",
  },
  {
    title: "Protecting our environment",
    body: "We champion our rural identity and village heritage, promoting thoughtful development that respects our surroundings.",
  },
  {
    title: "A safe and connected place to live",
    body: "We support initiatives that improve safety, wellbeing, and neighbourliness across both villages.",
  },
  {
    title: "Open, inclusive involvement",
    body: "We encourage everyone to take part — whether by sharing ideas, joining discussions, or helping with community projects.",
  },
  {
    title: "Transparency and trust",
    body: "We communicate openly and work with integrity, always putting the interests of residents first.",
  },
] as const;

export default async function AboutPage() {
  const [intro, members, constitutionPdfUrl, codeOfConductPdfUrl] = await Promise.all([
    getAboutIntro(),
    getCommitteeMembers(),
    getConstitutionPdfUrl(),
    getCodeOfConductPdfUrl(),
  ]);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
          About us
        </h1>
        <div className="prose mt-8 max-w-none whitespace-pre-wrap text-[var(--foreground)]">
          {intro || (
            <>
              <p>
                The Culcheth & Glazebury Residents Association represents and supports
                residents in the Culcheth and Glazebury areas. We work to promote
                community interests, share local news and events, and provide a forum
                for discussion.
              </p>
              <p>
                This website is your hub for the latest news, a residents' forum,
                gallery, and a way to get in touch with the committee. If you'd like
                to get involved or have questions, please use the Contact page.
              </p>
            </>
          )}
        </div>

        <section
          className="mt-14 border-t border-[var(--color-border)] pt-14"
          aria-label="Mission statement"
        >
          <h2 className={missionTitleClass}>Mission statement</h2>
          <p className={`mt-5 ${missionHeadingClass}`}>
            Culcheth and Glazebury Residents Association
          </p>
          <h3 className={`mt-10 ${missionHeadingClass}`}>Our Mission</h3>
          <p className="mt-4 leading-relaxed text-[var(--foreground)]">
            We work to protect, enhance, and celebrate the unique character of Culcheth and Glazebury.
            Our mission is to represent the interests of local residents, strengthen community life, and
            help shape a safe, sustainable, and thriving future for our villages.
          </p>
          <h3 className={`mt-10 ${missionHeadingClass}`}>What We Stand For</h3>
          <ul className="mt-5 list-none space-y-6 pl-0 leading-relaxed text-[var(--foreground)]">
            {STAND_FOR.map(({ title, body }) => (
              <li key={title}>
                <p className="font-semibold text-[var(--foreground)]">• {title}</p>
                <p className="mt-2 pl-1">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-[var(--color-border)] pt-14">
          <h2 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
            Code of conduct
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--foreground)]">
            Expectations for committee members are set out in our code of conduct. You can read or
            download it below.
          </p>
          <p className="mt-4">
            <Link
              href={codeOfConductPdfUrl}
              className="font-medium text-[var(--foreground)] underline decoration-[var(--color-border)] underline-offset-4 transition hover:decoration-[var(--foreground)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open code of conduct (PDF)
            </Link>
          </p>
        </section>

        <section className="mt-14 border-t border-[var(--color-border)] pt-14">
          <h2 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
            Constitution
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--foreground)]">
            Our formal rules and how the association is run are set out in the constitution. You
            can read or download it below.
          </p>
          <p className="mt-4">
            <Link
              href={constitutionPdfUrl}
              className="font-medium text-[var(--foreground)] underline decoration-[var(--color-border)] underline-offset-4 transition hover:decoration-[var(--foreground)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open constitution (PDF)
            </Link>
          </p>
        </section>
      </div>

      {members.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-14 pt-14 border-t border-[var(--color-border)]">
          <h2 className="font-heading text-2xl font-semibold text-[var(--foreground)] text-center mb-10">
            Committee
          </h2>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {members.map((m) => (
              <li key={m.id} className="flex flex-col gap-6 rounded-2xl border-2 border-[var(--color-primary-muted)] bg-white p-6 md:p-8 shadow-sm transition hover:shadow-md hover:border-[var(--color-surface-strong)]">
                <div className="flex items-center gap-5">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[var(--color-border)] shadow-md">
                    {m.image_url ? (
                      <Image
                        src={m.image_url}
                        alt={m.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-3xl text-[var(--color-muted)]">
                        ?
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-heading text-xl font-semibold text-[var(--foreground)]">{m.name}</p>
                    <p className="text-base font-medium text-[var(--color-primary)] mt-1">{m.role || "—"}</p>
                  </div>
                </div>
                {m.bio && (
                  <div className="text-base leading-relaxed text-[var(--color-muted)]">
                    {m.bio.split(/\n\s*\n/).map((paragraph, i) => (
                      <p key={i} className="mb-4 last:mb-0">
                        {paragraph.replace(/\n/g, ' ')}
                      </p>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

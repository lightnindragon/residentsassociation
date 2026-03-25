import { getAboutIntro, getCommitteeMembers } from "@/lib/site-content";
import Image from "next/image";
import Link from "next/link";

const CONSTITUTION_PDF = "/documents/culcheth-glazebury-ra-constitution.pdf";

export default async function AboutPage() {
  const [intro, members] = await Promise.all([getAboutIntro(), getCommitteeMembers()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
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

      <section className="mt-14 border-t border-[var(--color-border)] pt-14">
        <h2 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
          Mission statement
        </h2>
        <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
          Culcheth and Glazebury Residents Association
        </p>
        <h3 className="mt-8 font-heading text-lg font-semibold text-[var(--foreground)]">
          Our mission
        </h3>
        <p className="mt-3 leading-relaxed text-[var(--foreground)]">
          We work to protect, enhance, and celebrate the unique character of Culcheth and
          Glazebury. Our mission is to represent the interests of local residents, strengthen
          community life, and help shape a safe, sustainable, and thriving future for our
          villages.
        </p>
        <h3 className="mt-10 font-heading text-lg font-semibold text-[var(--foreground)]">
          What we stand for
        </h3>
        <ul className="mt-4 space-y-5 text-[var(--foreground)]">
          <li>
            <p className="font-medium text-[var(--foreground)]">A strong community voice</p>
            <p className="mt-1 leading-relaxed text-[var(--color-muted)]">
              We listen to residents and speak up on their behalf, ensuring local views are
              heard by councils, developers and decision-makers.
            </p>
          </li>
          <li>
            <p className="font-medium text-[var(--foreground)]">Protecting our environment</p>
            <p className="mt-1 leading-relaxed text-[var(--color-muted)]">
              We champion our rural identity and village heritage, promoting thoughtful
              development that respects our surroundings.
            </p>
          </li>
          <li>
            <p className="font-medium text-[var(--foreground)]">
              A safe and connected place to live
            </p>
            <p className="mt-1 leading-relaxed text-[var(--color-muted)]">
              We support initiatives that improve safety, wellbeing, and neighbourliness across
              both villages.
            </p>
          </li>
          <li>
            <p className="font-medium text-[var(--foreground)]">Open, inclusive involvement</p>
            <p className="mt-1 leading-relaxed text-[var(--color-muted)]">
              We encourage everyone to take part — whether by sharing ideas, joining
              discussions, or helping with community projects.
            </p>
          </li>
          <li>
            <p className="font-medium text-[var(--foreground)]">Transparency and trust</p>
            <p className="mt-1 leading-relaxed text-[var(--color-muted)]">
              We communicate openly and work with integrity, always putting the interests of
              residents first.
            </p>
          </li>
        </ul>
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
            href={CONSTITUTION_PDF}
            className="font-medium text-[var(--foreground)] underline decoration-[var(--color-border)] underline-offset-4 transition hover:decoration-[var(--foreground)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open constitution (PDF)
          </Link>
        </p>
      </section>

      {members.length > 0 && (
        <div className="mt-14 border-t border-[var(--color-border)] pt-14">
          <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
            Committee
          </h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2">
            {members.map((m) => (
              <li key={m.id} className="flex flex-col gap-4 rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--color-border)] shadow-sm">
                    {m.image_url ? (
                      <Image
                        src={m.image_url}
                        alt={m.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-2xl text-[var(--color-muted)]">
                        ?
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-heading text-lg font-semibold text-[var(--foreground)]">{m.name}</p>
                    <p className="text-sm font-medium text-[var(--color-primary)]">{m.role || "—"}</p>
                  </div>
                </div>
                {m.bio && (
                  <p className="text-sm leading-relaxed text-[var(--color-muted)] whitespace-pre-wrap">
                    {m.bio}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

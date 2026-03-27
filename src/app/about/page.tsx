import { getAboutIntro, getCommitteeMembers, getConstitutionPdfUrl } from "@/lib/site-content";
import Image from "next/image";
import Link from "next/link";

/** Matches `RA docs/Mission statement .txt` (line breaks and wording). */
const MISSION_STATEMENT_TEXT = `Mission statement 

Culcheth and Glazebury Residents Association

Our Mission

We work to protect, enhance, and celebrate the unique character of Culcheth and Glazebury. Our mission is to represent the interests of local residents, strengthen community life, and help shape a safe, sustainable, and thriving future for our villages.

What We Stand For

• A strong community voice
We listen to residents and speak up on their behalf, ensuring local views are heard by councils, developers and decision‑makers.
• Protecting our environment
We champion our rural identity and village heritage, promoting thoughtful development that respects our surroundings.
• A safe and connected place to live
We support initiatives that improve safety, wellbeing, and neighbourliness across both villages.
• Open, inclusive involvement
We encourage everyone to take part — whether by sharing ideas, joining discussions, or helping with community projects.
• Transparency and trust
We communicate openly and work with integrity, always putting the interests of residents first.`;

/** From `RA docs/Code of Conduct for Committee Members Finalise.docx` (wording and structure). */
const CODE_OF_CONDUCT_TEXT = `Code of Conduct for Committee Members

Culcheth & Glazebury Residents Association

1. Act in the Best Interests of the Community
• Represent all residents fairly and respectfully.
• Prioritise projects that improve communication, tidiness, and local connections.

2. Communicate Clearly and Responsively
• Share updates promptly and accurately.
• Listen actively to feedback from residents and fellow committee members.
• Use respectful, inclusive language in all communications.

3. Collaborate and Support Each Other
• Work constructively with fellow committee members, sub-groups, and volunteers.
• Respect differing views and seek consensus where possible.
• Support partnerships with local businesses and organisations.

4. Be Transparent and Accountable
• Keep accurate records of meetings, decisions, and finances.
• Declare any conflicts of interest and avoid personal gain.
• Follow agreed procedures for decision-making and voting.

5. Uphold Integrity and Respect
• Treat all residents with dignity, regardless of background or belief.
• Maintain confidentiality where appropriate.
• Challenge discrimination or inappropriate behaviour if it arises.

6. Commit to Active Participation
• Attend meetings regularly and contribute to the work of the Association.
• Take responsibility for assigned tasks and follow through.
• Step aside if unable to fulfil duties consistently.`;

export default async function AboutPage() {
  const [intro, members, constitutionPdfUrl] = await Promise.all([
    getAboutIntro(),
    getCommitteeMembers(),
    getConstitutionPdfUrl(),
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
          <div className="whitespace-pre-wrap text-[var(--foreground)] leading-relaxed">
            {MISSION_STATEMENT_TEXT}
          </div>
        </section>

        <section
          className="mt-14 border-t border-[var(--color-border)] pt-14"
          aria-label="Code of conduct for committee members"
        >
          <div className="whitespace-pre-wrap text-[var(--foreground)] leading-relaxed">
            {CODE_OF_CONDUCT_TEXT}
          </div>
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

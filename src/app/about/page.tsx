import { getAboutIntro, getCommitteeMembers } from "@/lib/site-content";
import Image from "next/image";

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
      {members.length > 0 && (
        <div className="mt-12">
          <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">
            Committee
          </h2>
          <ul className="mt-6 grid gap-8 sm:grid-cols-2">
            {members.map((m) => (
              <li key={m.id} className="flex items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--color-border)]">
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
                  <p className="font-medium text-[var(--foreground)]">{m.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">{m.role || "—"}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

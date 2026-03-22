import { getAboutIntro, getCommitteeMembers } from "@/lib/site-content";
import { AboutIntroForm } from "./AboutIntroForm";
import { CommitteeMemberForm } from "./CommitteeMemberForm";
import { CommitteeMemberList } from "./CommitteeMemberList";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const [intro, members] = await Promise.all([getAboutIntro(), getCommitteeMembers()]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
          About us
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Edit the About page intro and committee members (with photos).
        </p>
        <AboutIntroForm initialIntro={intro} />
      </div>
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
          Committee members
        </h2>
        <CommitteeMemberForm />
        <CommitteeMemberList members={members} />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ForumSetupForm } from "./ForumSetupForm";

export default async function ForumSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/forum/setup");
  }

  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl && callbackUrl.startsWith("/forum") ? callbackUrl : "/forum";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Forum Profile
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Before you can use the forum, please set a display name and the town you live in. Both are required.
      </p>
      <ForumSetupForm redirectTo={redirectTo} />
    </div>
  );
}

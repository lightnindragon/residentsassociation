import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MinutesForm } from "../MinutesForm";

export default async function AdminNewMinutesPage() {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  return (
    <div>
      <Link href="/admin/minutes" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Minutes
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">New Minutes</h1>
      <MinutesForm authorId={user.id} />
    </div>
  );
}

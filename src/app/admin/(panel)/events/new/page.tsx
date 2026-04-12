import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EventForm } from "../EventForm";

export default async function AdminNewEventPage() {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Events
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">New Event</h1>
      <EventForm authorId={user.id} />
    </div>
  );
}

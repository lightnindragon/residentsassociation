import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlanningApplicationForm } from "../PlanningApplicationForm";

export default async function AdminNewPlanningApplicationPage() {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  return (
    <div>
      <Link
        href="/admin/planning-applications"
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        ← Planning Applications
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">New Planning Application</h1>
      <PlanningApplicationForm authorId={user.id} />
    </div>
  );
}

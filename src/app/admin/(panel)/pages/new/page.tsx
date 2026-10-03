import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageForm } from "../PageForm";

export default async function AdminNewPagePage() {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Pages
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">New Page</h1>
      <PageForm authorId={user.id} />
    </div>
  );
}

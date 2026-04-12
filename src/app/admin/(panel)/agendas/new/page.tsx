import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AgendaForm } from "../AgendaForm";

export default async function AdminNewAgendaPage() {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  return (
    <div>
      <Link href="/admin/agendas" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Agendas
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">New Agenda</h1>
      <AgendaForm authorId={user.id} />
    </div>
  );
}

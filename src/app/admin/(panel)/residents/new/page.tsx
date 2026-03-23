import Link from "next/link";
import { AddResidentForm } from "./AddResidentForm";

export default function NewResidentPage() {
  return (
    <div>
      <Link href="/admin/residents" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Residents
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">Add new resident</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Create a new resident account manually.
      </p>
      <div className="mt-6 max-w-lg">
        <AddResidentForm />
      </div>
    </div>
  );
}
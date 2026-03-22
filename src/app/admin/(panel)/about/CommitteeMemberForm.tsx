"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { addCommitteeMember } from "@/app/admin/actions/about";

export function CommitteeMemberForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    startTransition(async () => {
      const result = await addCommitteeMember(name.trim(), role.trim(), file ?? undefined);
      if (result.ok) {
        setName("");
        setRole("");
        setFile(null);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to add.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)]">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Gill Stott"
          className="mt-0.5 rounded border border-[var(--color-border)] bg-[var(--background)] px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)]">Role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Chair"
          className="mt-0.5 rounded border border-[var(--color-border)] bg-[var(--background)] px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)]">Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-0.5 block text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add member"}
      </button>
      {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
